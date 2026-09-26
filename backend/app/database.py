from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "stocksense.db")
DEFAULT_SQLITE_URL = f"sqlite:///{DB_PATH}"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_migrations():
    """Ensure optional new columns exist in SQLite without needing full Alembic setup."""
    with engine.connect() as conn:
        columns_to_ensure = [
            ("receipts", "supplier_name", "TEXT DEFAULT 'Standard Supplier'"),
            ("deliveries", "customer_name", "TEXT DEFAULT 'ACME Corporation'"),
            ("deliveries", "shipping_address", "TEXT DEFAULT 'Main Logistics Hub, Suite 400'"),
            ("deliveries", "carrier", "TEXT DEFAULT 'Express Freight'"),
            ("transfers", "reason", "TEXT DEFAULT 'Internal Stock Replenishment'"),
            ("transfers", "validated_at", "DATETIME NULL"),
        ]
        for table, col, col_type in columns_to_ensure:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                conn.commit()
            except Exception:
                # Column likely already exists
                pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
