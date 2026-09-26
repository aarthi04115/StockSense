import sys
import os
from datetime import datetime, timedelta

# Ensure backend imports work
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.database import SessionLocal, engine, run_migrations
from app import models

def seed_db():
    models.Base.metadata.create_all(bind=engine)
    run_migrations()
    db = SessionLocal()
    
    print("Seeding StockSense Database...")

    # 1. Seed Warehouses if missing
    warehouses = db.query(models.Warehouse).all()
    if len(warehouses) < 3:
        wh_names = [w.name for w in warehouses]
        new_whs = []
        if "Main HQ Warehouse" not in wh_names:
            new_whs.append(models.Warehouse(name="Main HQ Warehouse", location="New York, NY", is_active=True))
        if "West Coast Distribution Hub" not in wh_names:
            new_whs.append(models.Warehouse(name="West Coast Distribution Hub", location="San Francisco, CA", is_active=True))
        if "Central Fulfillment Center" not in wh_names:
            new_whs.append(models.Warehouse(name="Central Fulfillment Center", location="Chicago, IL", is_active=True))
        if new_whs:
            db.add_all(new_whs)
            db.commit()
        warehouses = db.query(models.Warehouse).all()
        print(f"Warehouses available: {len(warehouses)}")

    # 2. Seed Locations if missing
    locations = db.query(models.Location).all()
    if len(locations) < 4:
        loc_codes = [l.code for l in locations]
        new_locs = []
        if "HQ-Rack-A1" not in loc_codes:
            new_locs.append(models.Location(warehouse_id=warehouses[0].id, code="HQ-Rack-A1", type="Bulk Storage"))
        if "HQ-Pick-B2" not in loc_codes:
            new_locs.append(models.Location(warehouse_id=warehouses[0].id, code="HQ-Pick-B2", type="Picking Bay"))
        if len(warehouses) > 1 and "WC-Dock-01" not in loc_codes:
            new_locs.append(models.Location(warehouse_id=warehouses[1].id, code="WC-Dock-01", type="Inbound Dock"))
        if len(warehouses) > 1 and "WC-Zone-C3" not in loc_codes:
            new_locs.append(models.Location(warehouse_id=warehouses[1].id, code="WC-Zone-C3", type="Storage"))
        if new_locs:
            db.add_all(new_locs)
            db.commit()
        locations = db.query(models.Location).all()
        print(f"Locations available: {len(locations)}")

    # 3. Seed Categories if missing
    categories = db.query(models.Category).all()
    if not categories:
        cat1 = models.Category(name="Electronics & Audio")
        cat2 = models.Category(name="Ergonomic Furniture")
        cat3 = models.Category(name="Computer Peripherals")
        cat4 = models.Category(name="Storage & Cables")
        db.add_all([cat1, cat2, cat3, cat4])
        db.commit()
        categories = [cat1, cat2, cat3, cat4]
        print(f"Created {len(categories)} categories.")

    # 4. Seed Products if missing
    products = db.query(models.Product).all()
    if len(products) < 4:
        p1 = models.Product(name="Aura Pro Wireless Headphones", sku="SKU-AUR-101", category_id=categories[0].id, uom="pcs", reorder_point=40, reorder_qty=150)
        p2 = models.Product(name="ErgoMotion Standing Desk", sku="SKU-DSK-202", category_id=categories[1].id, uom="units", reorder_point=15, reorder_qty=45)
        p3 = models.Product(name="Apex Stealth Mechanical Keyboard", sku="SKU-KBD-303", category_id=categories[2].id, uom="pcs", reorder_point=50, reorder_qty=200)
        p4 = models.Product(name="Thunderbolt 4 Docking Station", sku="SKU-DCK-404", category_id=categories[3].id, uom="pcs", reorder_point=25, reorder_qty=80)
        p5 = models.Product(name="Ultra HD 4K Webcam 60FPS", sku="SKU-CAM-505", category_id=categories[0].id, uom="pcs", reorder_point=30, reorder_qty=100)
        db.add_all([p1, p2, p3, p4, p5])
        db.commit()
        products = db.query(models.Product).all()
        print(f"Created {len(products)} products.")

    # 5. Seed Stock Levels
    for product in products:
        for loc in locations[:2]:
            existing = db.query(models.StockLevel).filter(
                models.StockLevel.product_id == product.id,
                models.StockLevel.location_id == loc.id
            ).first()
            if not existing:
                stock = models.StockLevel(
                    product_id=product.id,
                    location_id=loc.id,
                    quantity=120.0
                )
                db.add(stock)
    db.commit()

    # 6. Seed Deliveries (Outbound customer orders)
    if db.query(models.Delivery).count() == 0:
        del1 = models.Delivery(
            customer_id=101,
            customer_name="Starlight Technologies Corp",
            shipping_address="742 Evergreen Way, Suite 400, Austin, TX",
            carrier="FedEx Ground Priority",
            warehouse_id=warehouses[0].id,
            status="Draft",
            created_by=1
        )
        del2 = models.Delivery(
            customer_id=102,
            customer_name="Nexus Cloud Innovations",
            shipping_address="1200 Innovation Parkway, Seattle, WA",
            carrier="UPS Next Day Air",
            warehouse_id=warehouses[0].id,
            status="Picked",
            created_by=1
        )
        del3 = models.Delivery(
            customer_id=103,
            customer_name="Quantum Design Studios",
            shipping_address="500 Art District Blvd, New York, NY",
            carrier="DHL Express Freight",
            warehouse_id=warehouses[1].id,
            status="Done",
            created_by=1,
            validated_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add_all([del1, del2, del3])
        db.commit()

        # Add lines for Deliveries
        db.add_all([
            models.DeliveryLine(delivery_id=del1.id, product_id=products[0].id, qty_ordered=10, qty_picked=0),
            models.DeliveryLine(delivery_id=del1.id, product_id=products[2].id, qty_ordered=15, qty_picked=0),
            models.DeliveryLine(delivery_id=del2.id, product_id=products[1].id, qty_ordered=5, qty_picked=5),
            models.DeliveryLine(delivery_id=del3.id, product_id=products[3].id, qty_ordered=25, qty_picked=25),
        ])
        db.commit()
        print("Seeded sample customer deliveries.")

    # 7. Seed Transfers (Internal warehouse / location movements)
    if db.query(models.Transfer).count() == 0:
        tr1 = models.Transfer(
            from_location_id=locations[0].id,
            to_location_id=locations[1].id,
            reason="Replenish Active Picking Bay from Bulk Reserve",
            status="Draft",
            created_by=1
        )
        tr2 = models.Transfer(
            from_location_id=locations[0].id,
            to_location_id=locations[3].id,
            reason="Inter-Facility Stock Rebalance to West Coast",
            status="In Transit",
            created_by=1
        )
        tr3 = models.Transfer(
            from_location_id=locations[1].id,
            to_location_id=locations[0].id,
            reason="Overstock Relocation to Long-term Storage",
            status="Done",
            created_by=1,
            validated_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add_all([tr1, tr2, tr3])
        db.commit()

        # Add lines for Transfers
        db.add_all([
            models.TransferLine(transfer_id=tr1.id, product_id=products[0].id, qty=30),
            models.TransferLine(transfer_id=tr1.id, product_id=products[2].id, qty=40),
            models.TransferLine(transfer_id=tr2.id, product_id=products[1].id, qty=10),
            models.TransferLine(transfer_id=tr3.id, product_id=products[3].id, qty=15),
        ])
        db.commit()
        print("Seeded sample internal inventory transfers.")

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
