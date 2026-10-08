"""Download public Drive proof links extracted from the satisfaction workbook."""

from concurrent.futures import ThreadPoolExecutor, as_completed
from hashlib import sha256
from pathlib import Path
from urllib.parse import urlencode
from zipfile import ZipFile, ZIP_DEFLATED
import json
import os
import sys
import time

import requests


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "kepuasan pengguna" / "hasil"
FILES = OUTPUT / "backend" / "storage" / "satisfaction_import"
STATUS = OUTPUT / "download-status.json"
MAX_BYTES = 100 * 1024 * 1024


def detected_extension(first_bytes):
    if first_bytes.startswith(b"%PDF-"):
        return ".pdf"
    if first_bytes.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if first_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if first_bytes.startswith(b"II*\x00") or first_bytes.startswith(b"MM\x00*"):
        return ".tif"
    return None


def fetch(record):
    drive_id = record.get("driveId")
    if not drive_id:
        return record["id"], {"ok": False, "error": "ID Drive tidak tersedia"}
    url = "https://drive.google.com/uc?" + urlencode({"export": "download", "id": drive_id})
    filename_base = drive_id
    last_error = "unduhan gagal"
    for attempt in range(3):
        temporary = FILES / (filename_base + ".part")
        try:
            with requests.Session() as session:
                with session.get(url, timeout=(20, 90), stream=True) as response:
                    response.raise_for_status()
                    if response.url.startswith("https://accounts.google.com/"):
                        raise ValueError("Google Drive meminta login; izin file perlu diubah atau berkas diberikan langsung")
                    first_bytes = b""
                    total = 0
                    digest = sha256()
                    with temporary.open("wb") as handle:
                        for chunk in response.iter_content(chunk_size=128 * 1024):
                            if not chunk:
                                continue
                            if not first_bytes:
                                first_bytes = chunk[:16]
                            total += len(chunk)
                            if total > MAX_BYTES:
                                raise ValueError("berkas melebihi 100 MiB")
                            handle.write(chunk)
                            digest.update(chunk)
                    extension = detected_extension(first_bytes)
                    if not extension:
                        raise ValueError(f"respons bukan PDF/gambar ({response.headers.get('Content-Type')})")
                    destination = FILES / (filename_base + extension)
                    os.replace(temporary, destination)
                    return record["id"], {
                        "ok": True,
                        "path": "satisfaction_import/" + destination.name,
                        "size": total,
                        "sha256": digest.hexdigest(),
                    }
        except (requests.RequestException, OSError, ValueError) as error:
            last_error = str(error)
            temporary.unlink(missing_ok=True)
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    return record["id"], {"ok": False, "error": last_error}


def main():
    records = json.loads((OUTPUT / "records.json").read_text(encoding="utf-8"))
    FILES.mkdir(parents=True, exist_ok=True)
    statuses = json.loads(STATUS.read_text(encoding="utf-8")) if STATUS.exists() else {}
    pending = []
    for record in records:
        previous = statuses.get(record["id"], {})
        if previous.get("skip"):
            continue
        if previous.get("ok") and (OUTPUT / "backend" / "storage" / previous["path"]).is_file():
            continue
        pending.append(record)
    if "--package-only" in sys.argv:
        pending = []
    print(f"Downloading {len(pending)} of {len(records)} proof files", flush=True)
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(fetch, record) for record in pending]
        for future in as_completed(futures):
            record_id, result = future.result()
            statuses[record_id] = result
            STATUS.write_text(json.dumps(statuses, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"{record_id}: {'OK' if result['ok'] else result['error']}", flush=True)
    archive = OUTPUT / "berkas_bukti_untuk_hosting.zip"
    with ZipFile(archive, "w", compression=ZIP_DEFLATED) as zipped:
        storage_rules = ROOT / "backend" / "storage" / ".htaccess"
        if storage_rules.is_file():
            zipped.write(storage_rules, "backend/storage/.htaccess")
        for record in records:
            result = statuses.get(record["id"], {})
            if result.get("ok"):
                local = OUTPUT / "backend" / "storage" / result["path"]
                if local.is_file():
                    zipped.write(local, "backend/storage/" + result["path"])
    success = sum(bool(statuses.get(record["id"], {}).get("ok")) for record in records)
    skipped = sum(bool(statuses.get(record["id"], {}).get("skip")) for record in records)
    print(f"Complete: {success}/{len(records) - skipped} required files ({skipped} omitted), archive: {archive}", flush=True)


if __name__ == "__main__":
    main()
