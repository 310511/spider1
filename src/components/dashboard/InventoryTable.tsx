import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Package, Calendar, AlertCircle, ShoppingCart, Shield, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useState } from "react";

const categories = [
  "Antibiotics",
  "Consumables", 
  "Diabetes Care",
  "Equipment",
  "Pain Management",
  "Cardiovascular",
  "Respiratory",
  "Other"
];

export const InventoryTable = () => {
  const { address, syncInventoryToMarketplace, addAppNotification } = useBlockchain();
  const { inventoryItems, addInventoryItem, deleteInventoryItem } = useInventory();
  const [syncingItems, setSyncingItems] = useState<Set<number>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    stock: "",
    threshold: "",
    expiry: "",
    supplier: "",
    price: ""
  });

  const handleListOnMarketplace = async (item: any) => {
    if (!address) {
      addAppNotification("Please connect your wallet to list items on the marketplace.", "error");
      return;
    }

    setSyncingItems(prev => new Set(prev).add(item.id));
    
    try {
      await syncInventoryToMarketplace({
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        stock: item.stock,
        threshold: item.threshold,
        expiry: item.expiry,
        supplier: item.supplier,
        status: item.status,
        price: item.price,
        blockchainVerified: item.blockchainVerified
      });
    } finally {
      setSyncingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleViewOnMarketplace = (item: any) => {
    // TODO: Navigate to marketplace product page
    console.log("View on marketplace:", item);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.stock || !newItem.threshold || !newItem.supplier || !newItem.price) {
      addAppNotification("Please fill in all required fields.", "error");
      return;
    }

    const stock = parseInt(newItem.stock);
    const threshold = parseInt(newItem.threshold);
    const price = parseFloat(newItem.price);

    if (isNaN(stock) || isNaN(threshold) || isNaN(price)) {
      addAppNotification("Please enter valid numbers for stock, threshold, and price.", "error");
      return;
    }

    const status = stock <= threshold ? (stock <= threshold * 0.5 ? "critical" : "low") : "good";

    const newInventoryItem = {
      name: newItem.name,
      category: newItem.category,
      stock: stock,
      threshold: threshold,
      expiry: newItem.expiry || "N/A",
      supplier: newItem.supplier,
      status: status,
      price: price,
      blockchainVerified: false
    };

    addInventoryItem(newInventoryItem);
    addAppNotification("Item added to inventory successfully!", "success");
    
    // Reset form
    setNewItem({
      name: "",
      category: "",
      stock: "",
      threshold: "",
      expiry: "",
      supplier: "",
      price: ""
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteItem = (itemId: number) => {
    deleteInventoryItem(itemId);
    addAppNotification("Item removed from inventory.", "success");
  };

  const handleInputChange = (field: string, value: string) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Paracetamol 500mg"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select value={newItem.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    className="col-span-3"
                    placeholder="Current stock level"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="threshold" className="text-right">
                    Threshold
                  </Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newItem.threshold}
                    onChange={(e) => handleInputChange("threshold", e.target.value)}
                    className="col-span-3"
                    placeholder="Restocking threshold"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry" className="text-right">
                    Expiry
                  </Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={newItem.expiry}
                    onChange={(e) => handleInputChange("expiry", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">
                    Supplier
                  </Label>
                  <Input
                    id="supplier"
                    value={newItem.supplier}
                    onChange={(e) => handleInputChange("supplier", e.target.value)}
                    className="col-span-3"
                    placeholder="Supplier name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="col-span-3"
                    placeholder="Price per unit"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventoryItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'critical' ? 'bg-red-100 text-red-800' :
                    item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.status}
                  </span>
                  <span>Stock: {item.stock}/{item.threshold}</span>
                  <span>${item.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.blockchainVerified && (
                  <Shield className="h-4 w-4 text-green-600" title="Blockchain Verified" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleListOnMarketplace(item)}
                  disabled={syncingItems.has(item.id)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {syncingItems.has(item.id) ? "Syncing..." : "List"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewOnMarketplace(item)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};