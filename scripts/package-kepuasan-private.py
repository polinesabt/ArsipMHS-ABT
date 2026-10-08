"""Build the private, self-contained satisfaction import bundle from local data."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'kepuasan pengguna' / 'hasil'
STORAGE = ROOT / 'backend' / 'storage'
OUTPUT = SOURCE / 'paket_impor_kepuasan_privat.zip'

records = json.loads((SOURCE / 'records.json').read_text(encoding='utf-8'))
statuses = json.loads((SOURCE / 'download-status.json').read_text(encoding='utf-8'))
manifest = {'version': 1, 'records': []}
files: dict[str, Path] = {}
for record in records:
    status = statuses.get(record['id'], {})
    proof = None
    if status.get('ok'):
        relative = status['path']
        if not re.fullmatch(r'satisfaction_import/[A-Za-z0-9_-]+\.(pdf|jpe?g|png)', relative, re.IGNORECASE):
            raise ValueError('Invalid private proof path')
        source = STORAGE / relative
        if not source.is_file() or hashlib.sha256(source.read_bytes()).hexdigest() != status['sha256']:
            raise ValueError('Proof is missing or does not match its manifest')
        proof = {'path': relative, 'sha256': status['sha256']}
        files[relative] = source
    manifest['records'].append({**record, 'proof': proof})

assert len(manifest['records']) == 34
assert sum(len(record['rating']) for record in manifest['records']) == 260
assert len(files) == 33
assert sum(bool(record['rating']) and record['proof'] is not None for record in manifest['records']) == 26
with zipfile.ZipFile(OUTPUT, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    archive.writestr('manifest.json', json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
    for relative, source in sorted(files.items()):
        archive.write(source, relative)
print(f'Private bundle ready: {len(manifest["records"])} records, 260 ratings, {len(files)} proofs, {OUTPUT.stat().st_size} bytes')
