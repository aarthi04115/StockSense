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

# --- Receipts ---
class ReceiptBase(BaseModel):
    supplier_id: int
    status: str = "Draft"
    warehouse_id: int

class ReceiptCreate(ReceiptBase):
    pass

class Receipt(ReceiptBase):
    id: int
    created_by: Optional[int] = None
    validated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReceiptLineBase(BaseModel):
    receipt_id: int
    product_id: int
    qty_expected: float
    qty_received: float = 0.0

class ReceiptLineCreate(ReceiptLineBase):
    pass

class ReceiptLine(ReceiptLineBase):
    id: int

    class Config:
        from_attributes = True

# --- Deliveries ---
class DeliveryBase(BaseModel):
    customer_id: int
    status: str = "Draft"
    warehouse_id: int

class DeliveryCreate(DeliveryBase):
    pass

class Delivery(DeliveryBase):
    id: int
    created_by: Optional[int] = None
    validated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DeliveryLineBase(BaseModel):
    delivery_id: int
    product_id: int
    qty_ordered: float
    qty_picked: float = 0.0

class DeliveryLineCreate(DeliveryLineBase):
    pass

class DeliveryLine(DeliveryLineBase):
    id: int

    class Config:
        from_attributes = True

# --- Transfers ---
class TransferBase(BaseModel):
    from_location_id: int
    to_location_id: int
    status: str = "Draft"

class TransferCreate(TransferBase):
    pass

class Transfer(TransferBase):
    id: int
    created_by: Optional[int] = None

    class Config:
        from_attributes = True

class TransferLineBase(BaseModel):
    transfer_id: int
    product_id: int
    qty: float

class TransferLineCreate(TransferLineBase):
    pass

class TransferLine(TransferLineBase):
    id: int

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

