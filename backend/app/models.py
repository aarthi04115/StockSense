from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # Inventory Manager, Warehouse Staff
    created_at = Column(DateTime, default=datetime.utcnow)

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    is_active = Column(Boolean, default=True)

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    code = Column(String, index=True) # e.g., Rack A
    type = Column(String)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    uom = Column(String) # Unit of Measure
    reorder_point = Column(Float, default=0.0)
    reorder_qty = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class StockLevel(Base):
    __tablename__ = "stock_levels"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    quantity = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint('quantity >= 0', name='check_quantity_non_negative'),
    )

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer) # Mock supplier ID for now
    status = Column(String) # Draft, Waiting, Done
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    validated_at = Column(DateTime, nullable=True)
    
class ReceiptLine(Base):
    __tablename__ = "receipt_lines"
    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    qty_expected = Column(Float)
    qty_received = Column(Float, default=0.0)

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer) # Mock customer ID for now
    status = Column(String) # Draft, Picked, Done
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    validated_at = Column(DateTime, nullable=True)
    
class DeliveryLine(Base):
    __tablename__ = "delivery_lines"
    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    qty_ordered = Column(Float)
    qty_picked = Column(Float, default=0.0)

class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(Integer, primary_key=True, index=True)
    from_location_id = Column(Integer, ForeignKey("locations.id"))
    to_location_id = Column(Integer, ForeignKey("locations.id"))
    status = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))

class TransferLine(Base):
    __tablename__ = "transfer_lines"
    id = Column(Integer, primary_key=True, index=True)
    transfer_id = Column(Integer, ForeignKey("transfers.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    qty = Column(Float)

class Adjustment(Base):
    __tablename__ = "adjustments"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    recorded_qty = Column(Float)
    counted_qty = Column(Float)
    delta = Column(Float)
    reason = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))

class StockLedger(Base):
    __tablename__ = "stock_ledger"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    doc_type = Column(String) # receipt, delivery, transfer, adjustment
    doc_id = Column(Integer)
    delta = Column(Float)
    balance_after = Column(Float)
    actor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class AIForecast(Base):
    __tablename__ = "ai_forecasts"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    predicted_stockout_date = Column(DateTime)
    suggested_reorder_qty = Column(Float)
    confidence = Column(Float)
    generated_at = Column(DateTime, default=datetime.utcnow)

class AIAnomalyFlag(Base):
    __tablename__ = "ai_anomaly_flags"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    adjustment_id = Column(Integer, ForeignKey("adjustments.id"))
    anomaly_score = Column(Float)
    reason = Column(Text)
    reviewed = Column(Boolean, default=False)
