#!/usr/bin/env python3
"""
Alerts Service for Clinic Inventory Management System
Handles low stock and expiry alerts with scheduled jobs
"""

import sys
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
from enum import Enum

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from pydantic import BaseModel

class AlertType(str, Enum):
    LOW_STOCK = "low_stock"
    EXPIRY = "expiry"

class AlertStatus(str, Enum):
    ACTIVE = "active"
    DISMISSED = "dismissed"

class Alert(BaseModel):
    alert_id: str
    item_id: str
    item_name: str
    type: AlertType
    message: str
    created_at: datetime
    status: AlertStatus = AlertStatus.ACTIVE
    severity: str = "medium"  # low, medium, high, critical

class MedicalSupply(BaseModel):
    id: str
    name: str
    current_stock: int
    threshold_quantity: int
    expiry_date: Optional[datetime]
    supplier_id: str
    supplier_name: str
    unit: str = "units"

class AlertsService:
    def __init__(self):
        self.alerts: List[Alert] = []
        self.medical_supplies: List[MedicalSupply] = []
        self.scheduler = BackgroundScheduler()
        self._setup_scheduled_jobs()
        self._load_sample_data()
    
    def _setup_scheduled_jobs(self):
        """Setup scheduled jobs for daily alert checks"""
        # Run daily at 9:00 AM
        self.scheduler.add_job(
            func=self._check_low_stock_alerts,
            trigger=CronTrigger(hour=9, minute=0),
            id='low_stock_check',
            name='Daily Low Stock Check',
            replace_existing=True
        )
        
        # Run daily at 9:30 AM
        self.scheduler.add_job(
            func=self._check_expiry_alerts,
            trigger=CronTrigger(hour=9, minute=30),
            id='expiry_check',
            name='Daily Expiry Check',
            replace_existing=True
        )
        
        # Start the scheduler
        self.scheduler.start()
    
    def _load_sample_data(self):
        """Load sample medical supplies data"""
        self.medical_supplies = [
            MedicalSupply(
                id="ms_001",
                name="Paracetamol 500mg",
                current_stock=15,
                threshold_quantity=20,
                expiry_date=datetime.now() + timedelta(days=25),
                supplier_id="sup_001",
                supplier_name="MediPharm Ltd"
            ),
            MedicalSupply(
                id="ms_002",
                name="Ibuprofen 400mg",
                current_stock=8,
                threshold_quantity=25,
                expiry_date=datetime.now() + timedelta(days=45),
                supplier_id="sup_002",
                supplier_name="HealthCare Supplies"
            ),
            MedicalSupply(
                id="ms_003",
                name="Bandages (10cm)",
                current_stock=5,
                threshold_quantity=30,
                expiry_date=datetime.now() + timedelta(days=60),
                supplier_id="sup_003",
                supplier_name="First Aid Pro"
            ),
            MedicalSupply(
                id="ms_004",
                name="Antibiotic Cream",
                current_stock=12,
                threshold_quantity=15,
                expiry_date=datetime.now() + timedelta(days=15),
                supplier_id="sup_001",
                supplier_name="MediPharm Ltd"
            ),
            MedicalSupply(
                id="ms_005",
                name="Gauze Pads",
                current_stock=3,
                threshold_quantity=20,
                expiry_date=datetime.now() + timedelta(days=90),
                supplier_id="sup_003",
                supplier_name="First Aid Pro"
            )
        ]
    
    def _check_low_stock_alerts(self):
        """Check for low stock items and create alerts"""
        print(f"[{datetime.now()}] Checking for low stock alerts...")
        
        for supply in self.medical_supplies:
            if supply.current_stock <= supply.threshold_quantity:
                # Check if alert already exists
                existing_alert = self._get_existing_alert(supply.id, AlertType.LOW_STOCK)
                
                if not existing_alert:
                    alert = Alert(
                        alert_id=f"alert_{len(self.alerts) + 1}",
                        item_id=supply.id,
                        item_name=supply.name,
                        type=AlertType.LOW_STOCK,
                        message=f"Low stock alert: {supply.name} has {supply.current_stock} {supply.unit} remaining (threshold: {supply.threshold_quantity})",
                        created_at=datetime.now(),
                        severity="high" if supply.current_stock == 0 else "medium"
                    )
                    self.alerts.append(alert)
                    print(f"Created low stock alert for {supply.name}")
    
    def _check_expiry_alerts(self):
        """Check for items expiring soon and create alerts"""
        print(f"[{datetime.now()}] Checking for expiry alerts...")
        
        expiry_threshold = datetime.now() + timedelta(days=30)
        
        for supply in self.medical_supplies:
            if supply.expiry_date and supply.expiry_date <= expiry_threshold:
                # Check if alert already exists
                existing_alert = self._get_existing_alert(supply.id, AlertType.EXPIRY)
                
                if not existing_alert:
                    days_until_expiry = (supply.expiry_date - datetime.now()).days
                    
                    alert = Alert(
                        alert_id=f"alert_{len(self.alerts) + 1}",
                        item_id=supply.id,
                        item_name=supply.name,
                        type=AlertType.EXPIRY,
                        message=f"Expiry alert: {supply.name} expires in {days_until_expiry} days on {supply.expiry_date.strftime('%Y-%m-%d')}",
                        created_at=datetime.now(),
                        severity="critical" if days_until_expiry <= 7 else "high" if days_until_expiry <= 14 else "medium"
                    )
                    self.alerts.append(alert)
                    print(f"Created expiry alert for {supply.name}")
    
    def _get_existing_alert(self, item_id: str, alert_type: AlertType) -> Optional[Alert]:
        """Check if an alert already exists for the given item and type"""
        for alert in self.alerts:
            if (alert.item_id == item_id and 
                alert.type == alert_type and 
                alert.status == AlertStatus.ACTIVE):
                return alert
        return None
    
    def get_all_alerts(self) -> List[Alert]:
        """Get all active alerts"""
        return [alert for alert in self.alerts if alert.status == AlertStatus.ACTIVE]
    
    def get_alerts_by_type(self, alert_type: AlertType) -> List[Alert]:
        """Get alerts filtered by type"""
        return [alert for alert in self.alerts 
                if alert.type == alert_type and alert.status == AlertStatus.ACTIVE]
    
    def dismiss_alert(self, alert_id: str) -> bool:
        """Dismiss an alert by setting its status to dismissed"""
        for alert in self.alerts:
            if alert.alert_id == alert_id:
                alert.status = AlertStatus.DISMISSED
                return True
        return False
    
    def get_medical_supplies(self) -> List[MedicalSupply]:
        """Get all medical supplies"""
        return self.medical_supplies
    
    def update_stock(self, item_id: str, new_quantity: int) -> bool:
        """Update stock quantity for a medical supply"""
        for supply in self.medical_supplies:
            if supply.id == item_id:
                supply.current_stock = new_quantity
                return True
        return False
    
    def add_medical_supply(self, supply: MedicalSupply) -> bool:
        """Add a new medical supply"""
        self.medical_supplies.append(supply)
        return True
    
    def get_supply_by_id(self, item_id: str) -> Optional[MedicalSupply]:
        """Get medical supply by ID"""
        for supply in self.medical_supplies:
            if supply.id == item_id:
                return supply
        return None
    
    def run_manual_check(self):
        """Manually trigger alert checks (for testing)"""
        self._check_low_stock_alerts()
        self._check_expiry_alerts()
    
    def get_alert_statistics(self) -> Dict[str, Any]:
        """Get alert statistics"""
        total_alerts = len(self.alerts)
        active_alerts = len([a for a in self.alerts if a.status == AlertStatus.ACTIVE])
        low_stock_alerts = len([a for a in self.alerts if a.type == AlertType.LOW_STOCK and a.status == AlertStatus.ACTIVE])
        expiry_alerts = len([a for a in self.alerts if a.type == AlertType.EXPIRY and a.status == AlertStatus.ACTIVE])
        
        return {
            "total_alerts": total_alerts,
            "active_alerts": active_alerts,
            "low_stock_alerts": low_stock_alerts,
            "expiry_alerts": expiry_alerts,
            "dismissed_alerts": total_alerts - active_alerts
        }

# Global instance
alerts_service = AlertsService() 