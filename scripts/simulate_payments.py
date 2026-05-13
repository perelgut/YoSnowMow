"""
simulate_payments.py — Test utility: mark all non-CANCELLED jobs as fully paid.

Sets realistic financial fields and transitions any non-terminal job to RELEASED,
simulating a successful end-to-end Stripe payment flow without touching Stripe.

Run from the project root:
    python scripts/simulate_payments.py

Requires Application Default Credentials (already set up via gcloud):
    gcloud auth application-default login   (if not already done)

Financial model used (Ontario, 15% platform commission, 13% HST):
    tierPriceCAD          — worker's agreed price (default $100 if not set)
    hstAmountCAD          = tierPrice × 0.13
    platformFeeCAD        = tierPrice × 0.15
    workerPayoutCAD       = tierPrice × 0.85
    totalAmountCAD        = tierPrice + hstAmountCAD
    commissionRateApplied = 0.15
"""

import sys
from datetime import datetime, timezone, timedelta
from google.cloud import firestore
from google.api_core.datetime_helpers import DatetimeWithNanoseconds

PROJECT_ID     = "yosnowmow-prod"
COMMISSION     = 0.15
HST_RATE       = 0.13
DEFAULT_TIER   = 100.00

TERMINAL = {"RELEASED", "SETTLED", "CANCELLED", "REFUNDED"}

# Timestamps spread across today to look realistic (Ontario = UTC-4 in summer)
_now = datetime.now(timezone.utc)
def _ts(hours_ago=0):
    return _now - timedelta(hours=hours_ago)


def financial_fields(tier_price):
    hst      = round(tier_price * HST_RATE, 2)
    platform = round(tier_price * COMMISSION, 2)
    worker   = round(tier_price * (1 - COMMISSION), 2)
    total    = round(tier_price + hst, 2)
    return {
        "tierPriceCAD":          tier_price,
        "hstAmountCAD":          hst,
        "platformFeeCAD":        platform,
        "workerPayoutCAD":       worker,
        "totalAmountCAD":        total,
        "commissionRateApplied": COMMISSION,
    }


def main():
    db = firestore.Client(project=PROJECT_ID)
    jobs_ref = db.collection("jobs")

    docs = list(jobs_ref.stream())
    if not docs:
        print("No jobs found.")
        return

    print(f"Found {len(docs)} job(s):\n")
    to_update = []

    for doc in docs:
        data   = doc.to_dict()
        status = data.get("status", "UNKNOWN")
        job_id = doc.id
        tier   = data.get("tierPriceCAD") or DEFAULT_TIER

        print(f"  {job_id}  status={status}  tier=${tier:.2f}"
              f"  releasedAt={'set' if data.get('releasedAt') else 'MISSING'}")

        if status == "CANCELLED":
            print("    -> skipping (CANCELLED)")
            continue

        to_update.append((doc.reference, data, tier))

    if not to_update:
        print("\nNothing to update.")
        return

    print(f"\n{len(to_update)} job(s) will be updated to RELEASED with mock payment data.")
    ans = input("Proceed? [y/N] ").strip().lower()
    if ans != "y":
        print("Aborted.")
        sys.exit(0)

    for ref, data, tier in to_update:
        fin = financial_fields(tier)
        updates = {**fin}

        # Fill in lifecycle timestamps that may be missing
        if not data.get("agreedAt"):
            updates["agreedAt"] = _ts(hours_ago=5)
        if not data.get("escrowHeldAt"):
            updates["escrowHeldAt"] = _ts(hours_ago=4)
        if not data.get("inProgressAt"):
            updates["inProgressAt"] = _ts(hours_ago=3)
        if not data.get("pendingApprovalAt"):
            updates["pendingApprovalAt"] = _ts(hours_ago=2)
        updates["releasedAt"] = _ts(hours_ago=1)  # always reset to today for test window

        # Move to RELEASED if not already terminal
        if data.get("status") not in TERMINAL:
            updates["status"] = "RELEASED"

        ref.update(updates)
        print(f"  OK {ref.id}  status={updates.get('status', data.get('status'))}"
              f"  total=${fin['totalAmountCAD']:.2f}")

    print("\nDone. Run Recompute on the Analytics page to see the updated numbers.")


if __name__ == "__main__":
    main()
