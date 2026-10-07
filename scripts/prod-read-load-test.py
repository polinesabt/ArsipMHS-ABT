"""Bounded GET load check. An initial admin login updates last_login."""

import argparse
import getpass
import json
import math
import statistics
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor


BASE = "https://arsipmhs-abt.com"
TIMEOUT = 10


def request(name, path, token=None, base=BASE):
    headers = {"User-Agent": "ArsipMHS-controlled-load-check/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        headers["X-Auth-Token"] = token
    started = time.monotonic()
    status = 0
    ok = False
    try:
        req = urllib.request.Request(base + path, headers=headers)
        with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
            status = response.status
            body = response.read()
            if path.startswith("/backend/api/"):
                ok = status == 200 and json.loads(body).get("success") is True
            else:
                ok = status == 200 and b'<div id="root"></div>' in body
    except urllib.error.HTTPError as error:
        status = error.code
    except (urllib.error.URLError, TimeoutError, ValueError):
        pass
    return name, status, ok, time.monotonic() - started


def percentile(values, fraction):
    values = sorted(values)
    return values[max(0, math.ceil(len(values) * fraction) - 1)]


def describe(label, results, elapsed):
    by_route = defaultdict(list)
    for result in results:
        by_route[result[0]].append(result)
    print(f"{label}: {len(results)} requests, {len(results) / elapsed:.2f} req/s")
    for name, rows in by_route.items():
        times = [row[3] for row in rows]
        statuses = dict(Counter(row[1] for row in rows))
        failures = sum(not row[2] for row in rows)
        print(
            f"  {name}: n={len(rows)} failed={failures} status={statuses} "
            f"p50={statistics.median(times):.3f}s "
            f"p95={percentile(times, 0.95):.3f}s "
            f"max={max(times):.3f}s"
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--username", default="AdminABT")
    parser.add_argument("--base-url", default=BASE)
    parser.add_argument("--baseline-only", action="store_true")
    parser.add_argument("--seconds", type=int, default=10)
    parser.add_argument("--rates", default="1,2,4,6")
    args = parser.parse_args()
    if not 1 <= args.seconds <= 30:
        parser.error("--seconds must be between 1 and 30")
    try:
        rates = [int(value) for value in args.rates.split(",")]
    except ValueError:
        parser.error("--rates must be comma-separated integers")
    if not rates or any(rate < 1 or rate > 15 for rate in rates):
        parser.error("each rate must be between 1 and 15 req/s")

    password = getpass.getpass("Admin password: ")
    payload = json.dumps(
        {"username": args.username, "password": password, "role": "admin"}
    ).encode()
    del password
    base = args.base_url.rstrip("/")
    login_request = urllib.request.Request(
        base + "/backend/api/auth/login.php",
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "ArsipMHS-controlled-load-check/1.0"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(login_request, timeout=TIMEOUT) as response:
            login = json.load(response)
            status = response.status
    except urllib.error.HTTPError as error:
        print(f"Login failed: HTTP {error.code}; load test cancelled")
        return 1
    except (urllib.error.URLError, TimeoutError, ValueError):
        print("Login failed: network or invalid JSON; load test cancelled")
        return 1
    token = login.get("data", {}).get("jwt") or login.get("data", {}).get("token")
    if status != 200 or not login.get("success") or not token:
        print(f"Login failed: HTTP {status}; load test cancelled")
        return 1
    print("Admin login: HTTP 200, token received")

    routes = [
        ("homepage", "/", None, base),
        ("settings", "/backend/api/settings/get_settings.php", None, base),
        ("students_10", "/backend/api/students/list.php?limit=10", token, base),
        ("admin_forms", "/backend/api/satisfaction-forms/list.php", token, base),
    ]
    baseline = [request(*route) for route in routes]
    describe("baseline", baseline, sum(item[3] for item in baseline))
    if any(not item[2] for item in baseline):
        print("Baseline failed; load test cancelled")
        return 1
    if args.baseline_only:
        return 0

    for rate in rates:
        count = rate * args.seconds
        results = []
        started = time.monotonic()
        with ThreadPoolExecutor(max_workers=rate) as pool:
            futures = []
            for index in range(count):
                due = started + index / rate
                if due > time.monotonic():
                    time.sleep(due - time.monotonic())
                futures.append(pool.submit(request, *routes[index % len(routes)]))
            results = [future.result() for future in futures]
        elapsed = time.monotonic() - started
        describe(f"stage {rate} req/s", results, elapsed)
        failures = sum(not item[2] for item in results)
        latencies = [item[3] for item in results]
        if failures or percentile(latencies, 0.95) > 5:
            print("Stop threshold reached: failure or p95 > 5s")
            return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
