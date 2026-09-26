import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.app.database import SessionLocal, engine
from backend.app import models

def seed_db():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(models.Product).count() > 0:
        print("Database already seeded.")
        return

    # Categories
    cat1 = models.Category(name="Electronics")
    cat2 = models.Category(name="Furniture")
    cat3 = models.Category(name="Accessories")
    db.add_all([cat1, cat2, cat3])
    db.commit()

    # Warehouses
    wh1 = models.Warehouse(name="Main HQ", location="New York")
    db.add(wh1)
    db.commit()

    loc1 = models.Location(warehouse_id=wh1.id, code="Rack A", type="Storage")
    db.add(loc1)
    db.commit()

    # Products
    p1 = models.Product(name="Premium Wireless Headphones", sku="SKU-1001", category_id=cat1.id, uom="pcs", reorder_qty=120)
    p2 = models.Product(name="Ergonomic Office Chair", sku="SKU-1002", category_id=cat2.id, uom="pcs", reorder_qty=15)
    p3 = models.Product(name="Mechanical Keyboard", sku="SKU-1003", category_id=cat1.id, uom="pcs", reorder_qty=85)
    p4 = models.Product(name="USB-C Hub adapter", sku="SKU-1004", category_id=cat3.id, uom="pcs", reorder_qty=0)
    db.add_all([p1, p2, p3, p4])
    db.commit()

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
