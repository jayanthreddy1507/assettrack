"""
The judge's checklist, run against the real API and a real Postgres.

Run:  python judge_test.py
"""
from datetime import date, datetime, time, timedelta, timezone

from fastapi.testclient import TestClient

from app.main import app

c = TestClient(app)
PW = "Assetflow2026"
passed, failed = 0, 0


def check(label, condition, extra=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS  {label}")
    else:
        failed += 1
        print(f"  FAIL  {label}  {extra}")


def token(email):
    r = c.post("/api/auth/login", json={"email": email, "password": PW})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


print("\n1. Signup cannot mint an admin")
r = c.post("/api/auth/signup", json={
    "name": "Mallory Test", "email": f"mallory{datetime.now():%H%M%S}@x.io",
    "password": "Passw0rd123", "role": "ADMIN",  # smuggled field
})
check("signup accepted", r.status_code == 201, r.text[:120])
check("role forced to EMPLOYEE, injected ADMIN ignored",
      r.json()["user"]["role"] == "EMPLOYEE", r.json()["user"]["role"])

print("\n2. Employee cannot promote themselves")
emp = token("raj@assetflow.io")
me = c.get("/api/auth/me", headers=emp).json()
r = c.patch(f"/api/org/employees/{me['id']}/role", json={"role": "ASSET_MANAGER"}, headers=emp)
check("self-promotion blocked with 403", r.status_code == 403, r.status_code)

print("\n3. Double allocation is blocked and offers a way forward")
mgr = token("manager@assetflow.io")
assets = c.get("/api/assets", params={"q": "AF-0114"}, headers=mgr).json()
laptop = assets[0]
raj_id = me["id"]
r = c.post("/api/allocations", json={"asset_id": laptop["id"], "holder_id": raj_id},
           headers=mgr)
body = r.json().get("detail", {})
check("second allocation rejected with 409", r.status_code == 409, r.status_code)
check("names the current holder", body.get("held_by", {}).get("name") == "Priya Nair", body)
check("offers a transfer request", body.get("can_request_transfer") is True)
check("suggests free alternatives", len(body.get("alternatives", [])) > 0,
      body.get("alternatives"))
print(f"        -> \"{body.get('message')}\"")
print(f"        -> alternatives: {[a['tag'] for a in body.get('alternatives', [])]}")

print("\n4. Booking overlap: the brief's exact example")
rooms = c.get("/api/assets", params={"q": "Room B2"}, headers=emp).json()
b2 = rooms[0]
tomorrow = date.today() + timedelta(days=1)


def slot(h1, m1, h2, m2):
    s = datetime.combine(tomorrow, time(h1, m1), tzinfo=timezone.utc)
    e = datetime.combine(tomorrow, time(h2, m2), tzinfo=timezone.utc)
    return {"asset_id": b2["id"], "start_ts": s.isoformat(), "end_ts": e.isoformat(),
            "purpose": "Judge test"}


r = c.post("/api/bookings", json=slot(9, 30, 10, 30), headers=emp)
check("09:30-10:30 rejected (overlaps the 09:00-10:00 hold)", r.status_code == 409,
      r.status_code)
detail = r.json().get("detail", {})
check("tells you who holds the clashing slot",
      detail.get("conflict", {}).get("held_by") == "Anjali Menon", detail.get("conflict"))
check("suggests the next free windows", len(detail.get("next_free_slots", [])) > 0)
check("suggests other rooms free at that exact time",
      len(detail.get("other_resources_free_then", [])) > 0)
print(f"        -> next free: {[s['start'][11:16] for s in detail.get('next_free_slots', [])]}")
print(f"        -> free rooms then: "
      f"{[a['name'] for a in detail.get('other_resources_free_then', [])]}")

r = c.post("/api/bookings", json=slot(10, 0, 11, 0), headers=emp)
check("10:00-11:00 accepted (starts exactly as the other ends)", r.status_code == 201,
      r.text[:160])

print("\n5. Maintenance approval gates the status change")
r = c.post("/api/maintenance", json={
    "asset_id": b2["id"], "issue": "Projector in B2 will not connect over HDMI.",
    "priority": "High",
}, headers=emp)
req_id = r.json()["id"]
after_raise = c.get(f"/api/assets/{b2['id']}", headers=emp).json()["asset"]["status"]
check("raising a request does NOT move the asset", after_raise != "UNDER_MAINTENANCE",
      after_raise)

r = c.post(f"/api/maintenance/{req_id}/advance", params={"to": "IN_PROGRESS"}, headers=mgr)
check("cannot skip approval and jump to IN_PROGRESS", r.status_code == 409, r.status_code)

c.post(f"/api/maintenance/{req_id}/decide", json={"approve": True}, headers=mgr)
after_approve = c.get(f"/api/assets/{b2['id']}", headers=emp).json()["asset"]["status"]
check("approval flips the asset to UNDER_MAINTENANCE",
      after_approve == "UNDER_MAINTENANCE", after_approve)

c.post(f"/api/maintenance/{req_id}/advance",
       params={"to": "TECHNICIAN_ASSIGNED", "technician": "Zenith Services"}, headers=mgr)
c.post(f"/api/maintenance/{req_id}/advance", params={"to": "IN_PROGRESS"}, headers=mgr)
c.post(f"/api/maintenance/{req_id}/advance", params={"to": "RESOLVED"}, headers=mgr)
after_resolve = c.get(f"/api/assets/{b2['id']}", headers=emp).json()["asset"]["status"]
check("resolution returns it to AVAILABLE", after_resolve == "AVAILABLE", after_resolve)

print("\n6. Health score flags the six-year-old projector")
radar = c.get("/api/reports/retirement-radar", headers=mgr).json()
worst = radar["assets"][0]
check("worst-scoring asset is the ageing projector", worst["tag"] == "AF-0031", worst["tag"])
check("it lands in the retire band", worst["band"] == "retire", worst["band"])
check("the score explains itself", len(worst["reasons"]) >= 2, worst["reasons"])
print(f"        -> {worst['name']}: {worst['score']}/100")
for reason in worst["reasons"]:
    print(f"           - {reason}")

print("\n7. Dashboard sees the overdue return")
dash = c.get("/api/dashboard", headers=mgr).json()
check("overdue return surfaced", dash["kpis"]["overdue_returns"] >= 1, dash["kpis"])
check("overdue kept separate from upcoming", "overdue" in dash and "upcoming" in dash)
print(f"        -> {dash['overdue'][0]['asset_tag']} is "
      f"{dash['overdue'][0]['days_overdue']} days overdue")

print("\n8. Audit cycle closes and marks a missing asset LOST")
adm = token("admin@assetflow.io")
r = c.post("/api/audits/cycles", json={
    "name": "IT Sweep Q3", "scope_department_id": None, "scope_location": "IT Store",
    "start_date": str(date.today()), "end_date": str(date.today() + timedelta(days=7)),
    "auditor_ids": [raj_id],
}, headers=adm)
check("cycle created with a frozen worklist", r.status_code == 201, r.text[:140])
cycle_id = r.json()["id"]
detail = c.get(f"/api/audits/cycles/{cycle_id}", headers=adm).json()

r = c.post(f"/api/audits/cycles/{cycle_id}/close", headers=adm)
check("cannot close a cycle with unchecked assets", r.status_code == 409, r.status_code)

items = detail["items"]
c.post(f"/api/audits/items/{items[0]['id']}/mark",
       json={"result": "MISSING", "notes": "Not on the shelf."}, headers=token("raj@assetflow.io"))
for it in items[1:]:
    c.post(f"/api/audits/items/{it['id']}/mark", json={"result": "VERIFIED"},
           headers=token("raj@assetflow.io"))

rep = c.get(f"/api/audits/cycles/{cycle_id}/discrepancies", headers=adm).json()
check("discrepancy report auto-generated", rep["total_flagged"] == 1, rep["total_flagged"])
r = c.post(f"/api/audits/cycles/{cycle_id}/close", headers=adm).json()
check("closing marks the missing asset LOST", r["marked_lost"] == 1, r)
gone = c.get(f"/api/assets/{items[0]['asset_id']}", headers=adm).json()["asset"]["status"]
check("asset status is now LOST", gone == "LOST", gone)

print("\n9. Activity log recorded every one of those moves")
logs = c.get("/api/activity", headers=adm).json()
actions = {l["action"] for l in logs}
check("log captured the audit close", "AUDIT_CYCLE_CLOSED" in actions)
check("log captured the maintenance approval", "MAINTENANCE_APPROVED" in actions)
check("employee cannot read the activity log",
      c.get("/api/activity", headers=emp).status_code == 403)

print(f"\n{'=' * 52}\n  {passed} passed, {failed} failed\n{'=' * 52}")
