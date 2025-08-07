#!/usr/bin/env python3
"""
Purchase Order Service for Clinic Inventory Management System
Handles auto-generation of purchase orders when stock falls below threshold
"""

import sys
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
from enum import Enum

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pydantic import BaseModel

class PurchaseOrderStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    CONFIRMED = "confirmed"
    RECEIVED = "received"
    CANCELLED = "cancelled"

class PurchaseOrder(BaseModel):
    order_id: str
    item_id: str
    item_name: str
    quantity: int
    supplier_id: str
    supplier_name: str
    supplier_email: Optional[str] = None
    status: PurchaseOrderStatus = PurchaseOrderStatus.PENDING
    created_at: datetime
    sent_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    received_at: Optional[datetime] = None
    notes: Optional[str] = None
    unit_price: Optional[float] = None
    total_amount: Optional[float] = None

class Supplier(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    default_order_quantity: int = 50
    minimum_order_quantity: int = 10
    lead_time_days: int = 7

class PurchaseOrderService:
    def __init__(self):
        self.purchase_orders: List[PurchaseOrder] = []
        self.suppliers: List[Supplier] = []
        self._load_sample_data()
    
    def _load_sample_data(self):
        """Load sample suppliers data"""
        self.suppliers = [
            Supplier(
                id="sup_001",
                name="MediPharm Ltd",
                email="orders@medipharm.com",
                phone="+1-555-0123",
                address="123 Medical Drive, Pharma City, PC 12345",
                default_order_quantity=100,
                minimum_order_quantity=25,
                lead_time_days=5
            ),
            Supplier(
                id="sup_002",
                name="HealthCare Supplies",
                email="purchasing@healthcare-supplies.com",
                phone="+1-555-0456",
                address="456 Health Avenue, Medical District, MD 67890",
                default_order_quantity=75,
                minimum_order_quantity=15,
                lead_time_days=7
            ),
            Supplier(
                id="sup_003",
                name="First Aid Pro",
                email="orders@firstaidpro.com",
                phone="+1-555-0789",
                address="789 Safety Street, Emergency Town, ET 11111",
                default_order_quantity=50,
                minimum_order_quantity=10,
                lead_time_days=3
            )
        ]
    
    def get_supplier_by_id(self, supplier_id: str) -> Optional[Supplier]:
        """Get supplier by ID"""
        for supplier in self.suppliers:
            if supplier.id == supplier_id:
                return supplier
        return None
    
    def _calculate_order_quantity(self, current_stock: int, threshold_quantity: int, 
                                default_order_quantity: int) -> int:
        """Calculate the order quantity based on current stock and threshold"""
        # Calculate how much we need to reach threshold + buffer
        needed_quantity = (threshold_quantity * 2) - current_stock
        
        # Ensure we meet minimum order quantity
        if needed_quantity < default_order_quantity:
            needed_quantity = default_order_quantity
        
        return max(needed_quantity, 10)  # Minimum order of 10 units
    
    def create_purchase_order(self, item_id: str, item_name: str, 
                            current_stock: int, threshold_quantity: int,
                            supplier_id: str) -> Optional[PurchaseOrder]:
        """Create a new purchase order for low stock items"""
        
        # Check if there's already a pending order for this item
        existing_order = self._get_pending_order(item_id)
        if existing_order:
            print(f"Purchase order already pending for {item_name}")
            return existing_order
        
        # Get supplier information
        supplier = self.get_supplier_by_id(supplier_id)
        if not supplier:
            print(f"Supplier not found: {supplier_id}")
            return None
        
        # Calculate order quantity
        order_quantity = self._calculate_order_quantity(
            current_stock, threshold_quantity, supplier.default_order_quantity
        )
        
        # Create purchase order
        purchase_order = PurchaseOrder(
            order_id=f"po_{len(self.purchase_orders) + 1:04d}",
            item_id=item_id,
            item_name=item_name,
            quantity=order_quantity,
            supplier_id=supplier_id,
            supplier_name=supplier.name,
            supplier_email=supplier.email,
            status=PurchaseOrderStatus.PENDING,
            created_at=datetime.now(),
            notes=f"Auto-generated order due to low stock. Current stock: {current_stock}, Threshold: {threshold_quantity}"
        )
        
        self.purchase_orders.append(purchase_order)
        print(f"Created purchase order {purchase_order.order_id} for {item_name}")
        
        return purchase_order
    
    def _get_pending_order(self, item_id: str) -> Optional[PurchaseOrder]:
        """Check if there's already a pending order for the given item"""
        for order in self.purchase_orders:
            if (order.item_id == item_id and 
                order.status in [PurchaseOrderStatus.PENDING, PurchaseOrderStatus.SENT]):
                return order
        return None
    
    def get_all_purchase_orders(self) -> List[PurchaseOrder]:
        """Get all purchase orders"""
        return self.purchase_orders
    
    def get_purchase_orders_by_status(self, status: PurchaseOrderStatus) -> List[PurchaseOrder]:
        """Get purchase orders filtered by status"""
        return [order for order in self.purchase_orders if order.status == status]
    
    def get_purchase_order_by_id(self, order_id: str) -> Optional[PurchaseOrder]:
        """Get purchase order by ID"""
        for order in self.purchase_orders:
            if order.order_id == order_id:
                return order
        return None
    
    def update_order_status(self, order_id: str, new_status: PurchaseOrderStatus, 
                          notes: Optional[str] = None) -> bool:
        """Update the status of a purchase order"""
        order = self.get_purchase_order_by_id(order_id)
        if not order:
            return False
        
        order.status = new_status
        
        # Update timestamps based on status
        if new_status == PurchaseOrderStatus.SENT:
            order.sent_at = datetime.now()
        elif new_status == PurchaseOrderStatus.CONFIRMED:
            order.confirmed_at = datetime.now()
        elif new_status == PurchaseOrderStatus.RECEIVED:
            order.received_at = datetime.now()
        
        if notes:
            order.notes = notes
        
        return True
    
    def send_order_to_supplier(self, order_id: str) -> bool:
        """Mark order as sent to supplier"""
        return self.update_order_status(order_id, PurchaseOrderStatus.SENT)
    
    def confirm_order(self, order_id: str) -> bool:
        """Mark order as confirmed by supplier"""
        return self.update_order_status(order_id, PurchaseOrderStatus.CONFIRMED)
    
    def receive_order(self, order_id: str) -> bool:
        """Mark order as received"""
        return self.update_order_status(order_id, PurchaseOrderStatus.RECEIVED)
    
    def cancel_order(self, order_id: str, reason: Optional[str] = None) -> bool:
        """Cancel a purchase order"""
        notes = f"Cancelled: {reason}" if reason else "Order cancelled"
        return self.update_order_status(order_id, PurchaseOrderStatus.CANCELLED, notes)
    
    def generate_email_content(self, order: PurchaseOrder) -> str:
        """Generate email content for purchase order"""
        email_content = f"""
Dear {order.supplier_name},

Please find below our purchase order for medical supplies:

PURCHASE ORDER: {order.order_id}
Date: {order.created_at.strftime('%Y-%m-%d')}

ITEM DETAILS:
- Item: {order.item_name}
- Quantity: {order.quantity} units
- Order Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}

Please confirm receipt of this order and provide delivery timeline.

Contact Information:
- Email: clinic@example.com
- Phone: +1-555-9999

Thank you for your prompt attention to this matter.

Best regards,
Clinic Inventory Management System
        """
        return email_content.strip()
    
    def get_order_statistics(self) -> Dict[str, Any]:
        """Get purchase order statistics"""
        total_orders = len(self.purchase_orders)
        pending_orders = len([o for o in self.purchase_orders if o.status == PurchaseOrderStatus.PENDING])
        sent_orders = len([o for o in self.purchase_orders if o.status == PurchaseOrderStatus.SENT])
        confirmed_orders = len([o for o in self.purchase_orders if o.status == PurchaseOrderStatus.CONFIRMED])
        received_orders = len([o for o in self.purchase_orders if o.status == PurchaseOrderStatus.RECEIVED])
        cancelled_orders = len([o for o in self.purchase_orders if o.status == PurchaseOrderStatus.CANCELLED])
        
        return {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "sent_orders": sent_orders,
            "confirmed_orders": confirmed_orders,
            "received_orders": received_orders,
            "cancelled_orders": cancelled_orders
        }
    
    def get_suppliers(self) -> List[Supplier]:
        """Get all suppliers"""
        return self.suppliers
    
    def add_supplier(self, supplier: Supplier) -> bool:
        """Add a new supplier"""
        self.suppliers.append(supplier)
        return True
    
    def auto_generate_orders_for_low_stock(self, medical_supplies: List[Any]) -> List[PurchaseOrder]:
        """Auto-generate purchase orders for all low stock items"""
        generated_orders = []
        
        for supply in medical_supplies:
            if supply.current_stock <= supply.threshold_quantity:
                order = self.create_purchase_order(
                    item_id=supply.id,
                    item_name=supply.name,
                    current_stock=supply.current_stock,
                    threshold_quantity=supply.threshold_quantity,
                    supplier_id=supply.supplier_id
                )
                if order:
                    generated_orders.append(order)
        
        return generated_orders

# Global instance
purchase_order_service = PurchaseOrderService() 