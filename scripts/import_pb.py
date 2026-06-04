#!/usr/bin/env python3
"""
import_pb.py — Bulk-import konst and aktorer from Excel JSON files into PocketBase.

Usage:
    python3 scripts/import_pb.py [--host http://192.168.86.112:8090] [--dry-run]

Auth:  reads PB_EMAIL / PB_PASSWORD from env, or prompts.
Files: reads public/data/konstlista.json and public/data/aktorlista.json
       (same source files as scripts/transform-data.mjs).

Idempotent: clears existing records in konst / aktorer before importing,
            unless --append is passed.
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA = ROOT / "public" / "data"

CATEGORY_MAP = {
    "Musik":     "musik",
    "Konst":     "konst",
    "Teater":    "teater",
    "Samhälle":  "samhalle",
    "Fritid":    "fritid",
    "Spel":      "spel",
    "Hantverk":  "hantverk",
    "Film":      "film",
    "Kurs":      "kurs",
    "Kultur":    "kultur",
    "Litteratur":"litteratur",
    "Poesi":     "poesi",
    "Dans":      "dans",
    "Museum":    "museum",
    "Lokal":     "lokal",
    "Skola":     "skola",
}


def normalize_cat(raw):
    if not raw:
        return None
    return CATEGORY_MAP.get(raw.strip(), raw.strip().lower())


def pb_request(host, path, *, method="GET", body=None, token=None):
    url = host.rstrip("/") + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = token
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def authenticate(host, email, password):
    status, resp = pb_request(
        host,
        "/api/collections/_superusers/auth-with-password",
        method="POST",
        body={"identity": email, "password": password},
    )
    if status != 200:
        print(f"  ✗ Auth failed ({status}): {resp.get('message')}", file=sys.stderr)
        sys.exit(1)
    token = resp["token"]
    print(f"  ✓ Authenticated as {email}")
    return token


def clear_collection(host, collection, token, dry_run):
    """Delete all records from a collection (paged)."""
    deleted = 0
    while True:
        status, resp = pb_request(
            host, f"/api/collections/{collection}/records?perPage=200", token=token
        )
        if status != 200:
            print(f"  ✗ Failed to list {collection}: {resp.get('message')}", file=sys.stderr)
            return
        items = resp.get("items", [])
        if not items:
            break
        for item in items:
            if dry_run:
                deleted += 1
            else:
                s, _ = pb_request(
                    host,
                    f"/api/collections/{collection}/records/{item['id']}",
                    method="DELETE",
                    token=token,
                )
                if s in (200, 204):
                    deleted += 1
    print(f"  {'(dry) ' if dry_run else ''}Cleared {deleted} existing records from {collection}")


def import_records(host, collection, records, token, dry_run):
    ok = 0
    fail = 0
    for rec in records:
        if dry_run:
            ok += 1
            continue
        status, resp = pb_request(
            host,
            f"/api/collections/{collection}/records",
            method="POST",
            body=rec,
            token=token,
        )
        if status in (200, 201):
            ok += 1
        else:
            fail += 1
            print(f"  ✗ [{collection}] insert failed ({status}): {resp.get('message')} | data={rec.get('name')}", file=sys.stderr)
        # small delay to avoid hammering PB
        time.sleep(0.02)
    return ok, fail


def transform_konst():
    raw = json.loads((DATA / "konstlista.json").read_text(encoding="utf-8"))
    _header, *rows = raw
    records = []
    for row in rows:
        name = (row.get("B") or "").strip()
        if not name:
            continue
        lat_raw = row.get("I") or ""
        lng_raw = row.get("J") or ""
        try:
            lat = float(lat_raw) if lat_raw.strip() else 0.0
        except ValueError:
            lat = 0.0
        try:
            lng = float(lng_raw) if lng_raw.strip() else 0.0
        except ValueError:
            lng = 0.0
        records.append({
            "name":     name,
            "artist":   (row.get("C") or "").strip(),
            "year":     (row.get("D") or "").strip(),
            "loc":      (row.get("E") or "").strip(),
            "desc":     (row.get("K") or "").strip(),
            "area":     "",
            "img":      (row.get("H") or row.get("L") or "").strip(),
            "lat":      lat,
            "lng":      lng,
            "longDesc": (row.get("K") or "").strip(),
        })
    return records


def transform_aktorer():
    raw = json.loads((DATA / "aktorlista.json").read_text(encoding="utf-8"))
    _header, *rows = raw
    records = []
    for row in rows:
        plats = (row.get("B") or "").strip()
        org   = (row.get("A") or "").strip()
        # Use org as name if Plats (B) is empty
        name = plats if plats else org
        if not name:
            continue
        lat_raw = row.get("F") or ""
        lng_raw = row.get("G") or ""
        try:
            lat = float(lat_raw) if str(lat_raw).strip() else 0.0
        except ValueError:
            lat = 0.0
        try:
            lng = float(lng_raw) if str(lng_raw).strip() else 0.0
        except ValueError:
            lng = 0.0
        records.append({
            "name":  name,
            "org":   org,
            "type":  normalize_cat(row.get("D") or "") or "",
            "area":  (row.get("C") or "").strip(),
            "addr":  (row.get("E") or "").strip(),
            "img":   (row.get("H") or "").strip(),
            "lat":   lat,
            "lng":   lng,
            "url":   "",
        })
    return records


def main():
    parser = argparse.ArgumentParser(description="Import konst/aktorer into PocketBase")
    parser.add_argument("--host",    default="http://192.168.86.112:8090")
    parser.add_argument("--dry-run", action="store_true", help="Parse + count only, no writes")
    parser.add_argument("--append",  action="store_true", help="Don't clear existing records first")
    args = parser.parse_args()

    email    = os.environ.get("PB_EMAIL",    "admin@huddinge.mreh.site")
    password = os.environ.get("PB_PASSWORD", "yRE9BaFDnBkLmOrnqgqfvC")

    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}Importing into {args.host}\n")

    # Auth
    print("Authenticating…")
    token = authenticate(args.host, email, password)

    # Transform
    print("\nTransforming source data…")
    konst_records   = transform_konst()
    aktor_records   = transform_aktorer()
    print(f"  konst:   {len(konst_records)} records")
    print(f"  aktorer: {len(aktor_records)} records  ({sum(1 for r in aktor_records if r['lat'] != 0)} with coords)")

    # konst
    print("\n── konst ──────────────────────────────────")
    if not args.append:
        clear_collection(args.host, "konst", token, args.dry_run)
    print(f"  Inserting {len(konst_records)} records…")
    ok, fail = import_records(args.host, "konst", konst_records, token, args.dry_run)
    print(f"  {'(dry) ' if args.dry_run else ''}Done: {ok} ok, {fail} failed")

    # aktorer
    print("\n── aktorer ────────────────────────────────")
    if not args.append:
        clear_collection(args.host, "aktorer", token, args.dry_run)
    print(f"  Inserting {len(aktor_records)} records…")
    ok, fail = import_records(args.host, "aktorer", aktor_records, token, args.dry_run)
    print(f"  {'(dry) ' if args.dry_run else ''}Done: {ok} ok, {fail} failed")

    print("\n✓ Import complete.")
    if not args.dry_run:
        print("  → Go to publicera.html and press 'Publicera nu' to push to GitHub.")


if __name__ == "__main__":
    main()
