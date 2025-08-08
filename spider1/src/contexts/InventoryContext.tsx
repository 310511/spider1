import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  expiry: string;
  supplier: string;
  status: 'low' | 'good' | 'critical';
  price?: number;
  blockchainVerified?: boolean;
}

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: number, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: number) => void;
  getInventoryItem: (id: number) => InventoryItem | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialInventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    stock: 45,
    threshold: 50,
    expiry: "2024-12-15",
    supplier: "PharmaCorp",
    status: "low",
    price: 45.99,
    blockchainVerified: true
  },
  {
    id: 2,
    name: "Surgical Gloves (Box)",
    category: "Consumables",
    stock: 156,
    threshold: 100,
    expiry: "2025-06-20",
    supplier: "MedSupply Co",
    status: "good",
    price: 23.50,
    blockchainVerified: true
  },
  {
    id: 3,
    name: "Insulin Pens",
    category: "Diabetes Care",
    stock: 12,
    threshold: 25,
    expiry: "2024-09-30",
    supplier: "DiabetesCare Ltd",
    status: "critical",
    price: 89.99,
    blockchainVerified: false
  },
  {
    id: 4,
    name: "Blood Pressure Monitors",
    category: "Equipment",
    stock: 8,
    threshold: 5,
    expiry: "N/A",
    supplier: "TechMed Solutions",
    status: "good",
    price: 129.99,
    blockchainVerified: true
  },
  {
    id: 5,
    name: "Paracetamol 500mg",
    category: "Pain Management",
    stock: 25,
    threshold: 30,
    expiry: "2025-03-15",
    supplier: "PharmaCorp",
    status: "low",
    price: 12.99,
    blockchainVerified: true
  }
];

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryData);

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newId = Math.max(...inventoryItems.map(item => item.id), 0) + 1;
    const newItem: InventoryItem = {
      ...item,
      id: newId
    };
    setInventoryItems(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (id: number, updates: Partial<InventoryItem>) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteInventoryItem = (id: number) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
  };

  const getInventoryItem = (id: number) => {
    return inventoryItems.find(item => item.id === id);
  };

  const value: InventoryContextType = {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getInventoryItem
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}; 