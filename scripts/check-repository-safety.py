#!/usr/bin/env python3
"""Reject sensitive files from the Git index before a commit or deploy."""

from __future__ import annotations

import fnmatch
import io
import re
import subprocess
import sys


FORBIDDEN_PATHS = (
    "kepuasan pengguna/**",
    "backend/storage/satisfaction_import/**",
    "backend/storage/satisfaction_import_uploads/**",
    ".chart-build-check/**",
    ".security-build-check/**",
    "backend/database productin ekspor/**",
    "backend/database/backups/**",
    "backend/database/production_*.sql",
    "backend/database/seed*.sql",
    "backend/database/create_developer_account.sql",
    "backend/database/migrations/2026-03-05-replace-admin-accounts-hard-remap.sql",
    "backend/database/migrations/2026-03-15-safe-hosting-structure-migration.sql",
    "backend/database/migrations/2026-08-14-add-developer-role-and-settings.sql",
    "backend/database/migrations/*production-schema-update.sql",
    "backend/database/migrations/2026-09-11-add-demo-mode.sql",
    "backend/database/migrations/2026-09-12-remove-demo-and-reset-admin.sql",
    "backend/scripts/clean-all-dummy-data.php",
    "backend/scripts/replace-admin-account.php",
    "backend/scripts/seed-demo-20-full.php",
    "bug fix/*.sql",
)
FORBIDDEN_SUFFIXES = (".phar", ".dump", ".sql.gz", ".zip", ".bak", ".backup", ".log")
BCRYPT_HASH = re.compile(rb"\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}")
PRIVATE_KEY = re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")
DEFAULT_PASSWORDS = tuple(part + b"123" for part in (b"admin", b"student", b"password"))


def indexed_files() -> list[tuple[str, str]]:
    result = subprocess.check_output(["git", "ls-files", "--stage", "-z"])
    files: list[tuple[str, str]] = []
    for entry in result.split(b"\0"):
        if not entry:
            continue
        metadata, path_bytes = entry.split(b"\t", 1)
        _mode, object_id, stage = metadata.decode("ascii").split(" ")
        if stage == "0":
            files.append((path_bytes.decode("utf-8"), object_id))
    return files


def main() -> int:
    findings: list[str] = []
    files = indexed_files()
    batch = subprocess.run(
        ["git", "cat-file", "--batch"],
        input="".join(object_id + "\n" for _, object_id in files).encode("ascii"),
        stdout=subprocess.PIPE,
        check=True,
    )
    blobs = io.BytesIO(batch.stdout)
    for path, object_id in files:
        header = blobs.readline().strip().split()
        if len(header) != 3 or header[0].decode("ascii") != object_id or header[1] != b"blob":
            raise RuntimeError(f"Unexpected Git object for {path}")
        size = int(header[2])
        data = blobs.read(size)
        blobs.read(1)  # git cat-file separates objects with a newline.
        lower_path = path.lower()
        if lower_path != "backend/database productin ekspor/.htaccess" and any(
            fnmatch.fnmatchcase(lower_path, pattern.lower()) for pattern in FORBIDDEN_PATHS
        ):
            findings.append(f"{path}: forbidden tracked path")
            continue
        if lower_path.endswith(FORBIDDEN_SUFFIXES) or lower_path.split("/")[-1].startswith(".env"):
            findings.append(f"{path}: forbidden file type")
            continue

        if lower_path.endswith(".sql") and size > 250_000:
            findings.append(f"{path}: SQL file exceeds 250 KB")
            continue
        if size > 10_000_000:
            findings.append(f"{path}: file exceeds 10 MB review limit")
            continue

        if BCRYPT_HASH.search(data):
            findings.append(f"{path}: embedded password hash")
        if PRIVATE_KEY.search(data):
            findings.append(f"{path}: embedded private key")
        if any(password in data.lower() for password in DEFAULT_PASSWORDS):
            findings.append(f"{path}: embedded default password")

    if findings:
        print("Repository safety check failed:", file=sys.stderr)
        for finding in findings:
            print(f"- {finding}", file=sys.stderr)
        return 1
    print("Repository safety check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
