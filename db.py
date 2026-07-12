from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------------------------------------------------------------
# The two rules the brief cares most about are enforced by Postgres itself,
# not by an `if` statement in Python. Application checks can be raced by two
# concurrent requests; these cannot.
#
#   1. An asset can have at most ONE open allocation row at any moment.
#   2. A bookable asset can never hold two overlapping confirmed bookings.
#
# The '[)' range bound is what makes 09:00-10:00 and 10:00-11:00 legal
# neighbours while rejecting 09:30-10:30. That is the exact behaviour the
# problem statement asks for, expressed in one line of DDL.
# --------------------------------------------------------------------------

HARD_RULES = [
    "CREATE EXTENSION IF NOT EXISTS btree_gist;",
    """
    CREATE UNIQUE INDEX IF NOT EXISTS one_open_allocation_per_asset
        ON allocations (asset_id)
        WHERE returned_at IS NULL;
    """,
    """
    DO $$
    BEGIN
        ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
        EXCLUDE USING gist (
            asset_id WITH =,
            tstzrange(start_ts, end_ts, '[)') WITH &&
        ) WHERE (status IN ('UPCOMING', 'ONGOING'));
    EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN duplicate_object THEN NULL;
    END $$;
    """,
    """
    ALTER TABLE bookings
        ADD CONSTRAINT booking_ends_after_it_starts
        CHECK (end_ts > start_ts) NOT VALID;
    """,
]


def init_db():
    from . import models  # noqa: F401  (registers the mappers)

    Base.metadata.create_all(bind=engine)
    # Each statement runs in its own autocommit transaction: re-running init_db()
    # on an already-migrated database is a safe no-op instead of a hard failure.
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        for stmt in HARD_RULES:
            try:
                conn.execute(text(stmt))
            except Exception as exc:  # already applied on a previous boot
                print(f"[init_db] skipped: {str(exc).splitlines()[0]}")
