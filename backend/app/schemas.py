from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Products ---
class ProductBase(BaseModel):
    name: str
    sku: str
    category_id: Optional[int] = None
    uom: str
    reorder_point: float = 0.0
    reorder_qty: float = 0.0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Warehouses ---
class WarehouseBase(BaseModel):
    name: str
    location: str
    is_active: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    id: int

    class Config:
        from_attributes = True

# --- Locations ---
class LocationBase(BaseModel):
    warehouse_id: int
    code: str
    type: str = "Storage"

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    class Config:
        from_attributes = True

# --- Line Item Inputs ---
class DeliveryItemInput(BaseModel):
    product_id: int
    qty_ordered: float

class TransferItemInput(BaseModel):
    product_id: int
    qty: float

class ReceiptItemInput(BaseModel):
    product_id: int
    qty_expected: float

# --- Receipts ---
class ReceiptBase(BaseModel):
    supplier_id: int = 1
    supplier_name: Optional[str] = "Standard Supplier"
    status: str = "Draft"
    warehouse_id: int = 1

class ReceiptCreate(ReceiptBase):
    lines: Optional[List[ReceiptItemInput]] = []

class ReceiptLineBase(BaseModel):
    receipt_id: int
    product_id: int
    qty_expected: float
    qty_received: float = 0.0

class ReceiptLineCreate(ReceiptLineBase):
    pass

class ReceiptLine(ReceiptLineBase):
    id: int
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class Receipt(ReceiptBase):
    id: int
    created_by: Optional[int] = None
    validated_at: Optional[datetime] = None
    lines: Optional[List[ReceiptLine]] = []

    class Config:
        from_attributes = True

# --- Deliveries ---
class DeliveryBase(BaseModel):
    customer_id: int = 1
    customer_name: Optional[str] = "ACME Corporation"
    shipping_address: Optional[str] = "Main Logistics Hub, Suite 400"
    carrier: Optional[str] = "Express Freight"
    status: str = "Draft"
    warehouse_id: int = 1

class DeliveryCreate(DeliveryBase):
    lines: Optional[List[DeliveryItemInput]] = []

class DeliveryLineBase(BaseModel):
    delivery_id: int
    product_id: int
    qty_ordered: float
    qty_picked: float = 0.0

class DeliveryLineCreate(DeliveryLineBase):
    pass

class DeliveryLine(DeliveryLineBase):
    id: int
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class Delivery(DeliveryBase):
    id: int
    created_by: Optional[int] = None
    validated_at: Optional[datetime] = None
    lines: Optional[List[DeliveryLine]] = []

    class Config:
        from_attributes = True

# --- Transfers ---
class TransferBase(BaseModel):
    from_location_id: int
    to_location_id: int
    reason: Optional[str] = "Internal Stock Replenishment"
    status: str = "Draft"

class TransferCreate(TransferBase):
    lines: Optional[List[TransferItemInput]] = []

class TransferLineBase(BaseModel):
    transfer_id: int
    product_id: int
    qty: float

class TransferLineCreate(TransferLineBase):
    pass

class TransferLine(TransferLineBase):
    id: int
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class Transfer(TransferBase):
    id: int
    created_by: Optional[int] = None
    validated_at: Optional[datetime] = None
    lines: Optional[List[TransferLine]] = []
    from_location: Optional[Location] = None
    to_location: Optional[Location] = None

    class Config:
        from_attributes = True

# --- Adjustments ---
class AdjustmentBase(BaseModel):
    product_id: int
    location_id: int
    recorded_qty: float
    counted_qty: float
    delta: float
    reason: Optional[str] = None

class AdjustmentCreate(AdjustmentBase):
    pass

class Adjustment(AdjustmentBase):
    id: int
    created_by: Optional[int] = None

    class Config:
        from_attributes = True

