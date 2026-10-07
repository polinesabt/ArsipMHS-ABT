"""Read-focused production diagnostic. Never prints tokens or response data."""

import argparse
import getpass
import json
import time
import urllib.error
import urllib.request


def call(base, method, path, token=None, payload=None):
    headers = {
        "Accept": "application/json",
        "User-Agent": "ArsipMHS-deep-smoke/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
        headers["X-Auth-Token"] = token
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(
        base + path, data=body, headers=headers, method=method
    )
    started = time.monotonic()
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            status = response.status
            raw = response.read()
    except urllib.error.HTTPError as error:
        status = error.code
        raw = error.read()
    except (urllib.error.URLError, TimeoutError) as error:
        return 0, None, 0, time.monotonic() - started, type(error).__name__
    try:
        parsed = json.loads(raw)
    except ValueError:
        parsed = None
    code = parsed.get("code") if isinstance(parsed, dict) else None
    return status, parsed, len(raw), time.monotonic() - started, code


def report(name, result):
    status, parsed, size, duration, code = result
    success = parsed.get("success") if isinstance(parsed, dict) else None
    print(
        f"{name}: HTTP {status}, success={success}, "
        f"bytes={size}, time={duration:.3f}s, code={code or '-'}"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="https://arsipmhs-abt.com")
    parser.add_argument("--username", default="AdminABT")
    args = parser.parse_args()
    base = args.base_url.rstrip("/")

    anonymous = {
        "students": "/backend/api/students/list.php?limit=1",
        "tracer": "/backend/api/tracer/list.php",
        "achievements": "/backend/api/achievements/list.php",
        "dosen": "/backend/api/dosen/data.php",
        "evaluations": "/backend/api/evaluations/list.php",
    }
    print("Anonymous access checks")
    for name, path in anonymous.items():
        result = call(base, "GET", path)
        report(name, result)
        if result[0] != 401:
            return 1

    password = getpass.getpass("Admin password: ")
    login = call(
        base,
        "POST",
        "/backend/api/auth/login.php",
        payload={"username": args.username, "password": password, "role": "admin"},
    )
    del password
    report("login", login)
    data = login[1].get("data", {}) if isinstance(login[1], dict) else {}
    access = data.get("jwt") or data.get("token")
    refresh = data.get("refreshToken")
    if login[0] != 200 or not access or not refresh:
        return 1

    print("Authenticated read checks")
    authenticated = {
        "students": "/backend/api/students/list.php?limit=10",
        "tracer": "/backend/api/tracer/list.php",
        "achievements": "/backend/api/achievements/list.php",
        "dosen": "/backend/api/dosen/data.php",
        "evaluations": "/backend/api/evaluations/list.php",
        "forms": "/backend/api/satisfaction-forms/list.php",
        "study_period": "/backend/api/insight/stats.php?section=study_period",
        "active_students": "/backend/api/insight/stats.php?section=active_students",
    }
    for name, path in authenticated.items():
        result = call(base, "GET", path, token=access)
        report(name, result)
        if result[0] != 200 or not isinstance(result[1], dict) or result[1].get("success") is not True:
            return 1

    print("Session refresh checks")
    valid_refresh = call(
        base,
        "POST",
        "/backend/api/auth/refresh.php",
        payload={"refresh_token": refresh},
    )
    report("refresh_token", valid_refresh)
    if valid_refresh[0] != 200 or not isinstance(valid_refresh[1], dict) or valid_refresh[1].get("success") is not True:
        return 1
    access_as_refresh = call(
        base,
        "POST",
        "/backend/api/auth/refresh.php",
        payload={"refresh_token": access},
    )
    report("access_token_as_refresh", access_as_refresh)
    if access_as_refresh[0] != 401:
        return 1
    refresh_as_access = call(
        base, "GET", "/backend/api/students/list.php?limit=1", token=refresh
    )
    report("refresh_token_as_access", refresh_as_access)
    if refresh_as_access[0] != 401:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
