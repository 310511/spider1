import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ethers } from "ethers";

// Types for marketplace integration
export interface ProductListing {
  id: string;
  name: string;
  description: string;
  price: number;
  supplier: string;
  category: string;
  imageUrl: string;
  blockchainVerified: boolean;
  inventoryLevel: number;
  contractAddress: string;
  rating?: number;
}

export interface Order {
  id: string;
  productId: string;
  buyerAddress: string;
  sellerAddress: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  transactionHash: string;
  createdAt: number;
}

export interface InventoryItem {
  id: string;
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

export type NotificationType = "success" | "error" | "info";

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
}

interface IBlockchainContext {
  // Wallet and connection
  address: string | null;
  signer: ethers.Signer | null;
  provider: ethers.providers.Web3Provider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshWalletConnection: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Notifications
  appNotifications: AppNotification[];
  addAppNotification: (message: string, type?: NotificationType) => void;
  
  // Marketplace functionality
  marketplaceContract: ethers.Contract | null;
  createProductListing: (product: ProductListing) => Promise<boolean>;
  purchaseProduct: (productId: string, quantity: number) => Promise<boolean>;
  getProductListings: () => Promise<ProductListing[]>;
  getUserOrders: (address: string) => Promise<Order[]>;
  
  // Inventory integration
  syncInventoryToMarketplace: (inventoryItem: InventoryItem) => Promise<void>;
  updateInventoryFromBlockchain: (productId: string) => Promise<void>;
  
  // Aegis-inspired liquidity features
  createLiquidityPool: (regionName: string) => Promise<boolean>;
  stakeInPool: (amount: string) => Promise<boolean>;
  unstakeFromPool: (lpAmount: string) => Promise<boolean>;
  getLiquidityPools: () => Promise<any[]>;
}

const defaultBlockchainContextState: IBlockchainContext = {
  address: null,
  signer: null,
  provider: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isLoading: false,
  setIsLoading: () => {},
  appNotifications: [],
  addAppNotification: () => {},
  marketplaceContract: null,
  createProductListing: async () => false,
  purchaseProduct: async () => false,
  getProductListings: async () => [],
  getUserOrders: async () => [],
  syncInventoryToMarketplace: async () => {},
  updateInventoryFromBlockchain: async () => {},
  createLiquidityPool: async () => false,
  stakeInPool: async () => false,
  unstakeFromPool: async () => false,
  getLiquidityPools: async () => [],
};

const BlockchainContext = createContext<IBlockchainContext>(defaultBlockchainContextState);

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [marketplaceContract, setMarketplaceContract] = useState<ethers.Contract | null>(null);

  // Mock data for demonstration
  const mockProductListings: ProductListing[] = [
    {
      id: "1",
      name: "Amoxicillin 500mg",
      description: "Broad-spectrum antibiotic for bacterial infections",
      price: 45.99,
      supplier: "PharmaCorp",
      category: "Antibiotics",
      imageUrl: "https://via.placeholder.com/150",
      blockchainVerified: true,
      inventoryLevel: 150,
      contractAddress: "0x1234567890123456789012345678901234567890",
      rating: 4.5
    },
    {
      id: "2",
      name: "Surgical Gloves (Box of 100)",
      description: "Latex-free surgical gloves for medical procedures",
      price: 23.50,
      supplier: "MedSupply Co",
      category: "Consumables",
      imageUrl: "https://via.placeholder.com/150",
      blockchainVerified: true,
      inventoryLevel: 75,
      contractAddress: "0x2345678901234567890123456789012345678901",
      rating: 4.8
    },
    {
      id: "3",
      name: "Blood Pressure Monitor",
      description: "Digital automatic blood pressure monitor",
      price: 129.99,
      supplier: "TechMed Solutions",
      category: "Equipment",
      imageUrl: "https://via.placeholder.com/150",
      blockchainVerified: true,
      inventoryLevel: 12,
      contractAddress: "0x3456789012345678901234567890123456789012",
      rating: 4.6
    },
    {
      id: "4",
      name: "Insulin Pens",
      description: "Disposable insulin delivery pens",
      price: 89.99,
      supplier: "DiabetesCare Ltd",
      category: "Diabetes Care",
      imageUrl: "https://via.placeholder.com/150",
      blockchainVerified: false,
      inventoryLevel: 8,
      contractAddress: "0x4567890123456789012345678901234567890123",
      rating: 4.3
    }
  ];

  const mockOrders: Order[] = [
    {
      id: "order1",
      productId: "1",
      buyerAddress: "0x1234567890123456789012345678901234567890",
      sellerAddress: "0x2345678901234567890123456789012345678901",
      quantity: 10,
      totalPrice: 459.90,
      status: 'confirmed',
      transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      createdAt: Date.now() - 86400000 // 1 day ago
    }
  ];

  const addAppNotification = useCallback((message: string, type: NotificationType = "info") => {
    const notification: AppNotification = {
      id: Date.now().toString(),
      message,
      type,
    };
    setAppNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setAppNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const connectWallet = useCallback(async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      addAppNotification("MetaMask is not installed. Please install MetaMask to use the marketplace.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // First, check if we're already connected
      const currentAccounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      let accounts;
      if (currentAccounts.length > 0) {
        // We already have accounts, use them
        accounts = currentAccounts;
        console.log("Using existing accounts:", accounts);
      } else {
        // Request account access
        accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        console.log("Requested new accounts:", accounts);
      }

      if (accounts.length === 0) {
        addAppNotification("No accounts found. Please unlock MetaMask.", "error");
        return;
      }

      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Get the connected address
      const connectedAddress = await signer.getAddress();
      
      // Set state
      setProvider(provider);
      setSigner(signer);
      setAddress(connectedAddress);
      
      addAppNotification("Wallet connected successfully!", "success");
      
      // Check if we're on the right network (optional)
      const network = await provider.getNetwork();
      console.log("Connected to network:", network);
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      
      if (error.code === 4001) {
        addAppNotification("Connection rejected by user.", "error");
      } else if (error.code === -32002) {
        addAppNotification("Please check MetaMask and try again.", "error");
      } else {
        addAppNotification("Failed to connect wallet. Please try again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [addAppNotification]);

  const refreshWalletConnection = useCallback(async () => {
    console.log("Refreshing wallet connection...");
    
    // Clear current state first
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setMarketplaceContract(null);
    
    // Wait a moment for state to clear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try to reconnect
    await connectWallet();
  }, [connectWallet]);

  const disconnectWallet = useCallback(() => {
    try {
      // Clear all state
      setAddress(null);
      setSigner(null);
      setProvider(null);
      setMarketplaceContract(null);
      
      // Force a small delay to ensure state is cleared
      setTimeout(() => {
        addAppNotification("Wallet disconnected successfully.", "info");
      }, 100);
      
      console.log("Wallet disconnected, state cleared");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      addAppNotification("Error disconnecting wallet.", "error");
    }
  }, [addAppNotification]);

  const createProductListing = useCallback(async (product: ProductListing): Promise<boolean> => {
    if (!signer || !address) {
      addAppNotification("Please connect your wallet first.", "error");
      return false;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual smart contract interaction
      console.log("Creating product listing:", product);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addAppNotification("Product listed successfully on blockchain!", "success");
      return true;
    } catch (error) {
      console.error("Error creating product listing:", error);
      addAppNotification("Failed to create product listing.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer, address, addAppNotification]);

  const purchaseProduct = useCallback(async (productId: string, quantity: number): Promise<boolean> => {
    if (!signer || !address) {
      addAppNotification("Please connect your wallet first.", "error");
      return false;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual smart contract interaction
      console.log("Purchasing product:", productId, "quantity:", quantity);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      addAppNotification("Purchase completed successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error purchasing product:", error);
      addAppNotification("Failed to complete purchase.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer, address, addAppNotification]);

  const getProductListings = useCallback(async (): Promise<ProductListing[]> => {
    try {
      // TODO: Fetch from blockchain
      return mockProductListings;
    } catch (error) {
      console.error("Error fetching product listings:", error);
      return [];
    }
  }, []);

  const getUserOrders = useCallback(async (userAddress: string): Promise<Order[]> => {
    try {
      // TODO: Fetch from blockchain
      return mockOrders.filter(order => order.buyerAddress === userAddress);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  }, []);

  const syncInventoryToMarketplace = useCallback(async (inventoryItem: InventoryItem): Promise<void> => {
    if (!address) {
      addAppNotification("Please connect your wallet to sync inventory.", "error");
      return;
    }

    try {
      // TODO: Implement inventory to blockchain sync
      console.log("Syncing inventory to marketplace:", inventoryItem);
      addAppNotification("Inventory synced to marketplace successfully!", "success");
    } catch (error) {
      console.error("Error syncing inventory:", error);
      addAppNotification("Failed to sync inventory to marketplace.", "error");
    }
  }, [address, addAppNotification]);

  const updateInventoryFromBlockchain = useCallback(async (productId: string): Promise<void> => {
    try {
      // TODO: Update local inventory from blockchain transaction
      console.log("Updating inventory from blockchain for product:", productId);
    } catch (error) {
      console.error("Error updating inventory from blockchain:", error);
      addAppNotification("Failed to update inventory from blockchain.", "error");
    }
  }, [addAppNotification]);

  // Aegis-inspired liquidity features
  const createLiquidityPool = useCallback(async (regionName: string): Promise<boolean> => {
    if (!signer || !address) {
      addAppNotification("Please connect your wallet first.", "error");
      return false;
    }

    setIsLoading(true);
    try {
      // TODO: Implement liquidity pool creation
      console.log("Creating liquidity pool for region:", regionName);
      addAppNotification("Liquidity pool created successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error creating liquidity pool:", error);
      addAppNotification("Failed to create liquidity pool.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer, address, addAppNotification]);

  const stakeInPool = useCallback(async (amount: string): Promise<boolean> => {
    if (!signer || !address) {
      addAppNotification("Please connect your wallet first.", "error");
      return false;
    }

    setIsLoading(true);
    try {
      // TODO: Implement staking
      console.log("Staking amount:", amount);
      addAppNotification("Successfully staked in pool!", "success");
      return true;
    } catch (error) {
      console.error("Error staking in pool:", error);
      addAppNotification("Failed to stake in pool.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer, address, addAppNotification]);

  const unstakeFromPool = useCallback(async (lpAmount: string): Promise<boolean> => {
    if (!signer || !address) {
      addAppNotification("Please connect your wallet first.", "error");
      return false;
    }

    setIsLoading(true);
    try {
      // TODO: Implement unstaking
      console.log("Unstaking LP tokens:", lpAmount);
      addAppNotification("Successfully unstaked from pool!", "success");
      return true;
    } catch (error) {
      console.error("Error unstaking from pool:", error);
      addAppNotification("Failed to unstake from pool.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer, address, addAppNotification]);

  const getLiquidityPools = useCallback(async (): Promise<any[]> => {
    try {
      // TODO: Fetch from blockchain
      return [];
    } catch (error) {
      console.error("Error fetching liquidity pools:", error);
      return [];
    }
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            
            setProvider(provider);
            setSigner(signer);
            setAddress(address);
            console.log("Auto-connected to existing wallet:", address);
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };

    checkExistingConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Accounts changed:", accounts);
        
        if (accounts.length === 0) {
          // User disconnected all accounts
          console.log("No accounts available, disconnecting wallet");
          disconnectWallet();
        } else if (accounts[0] !== address) {
          // User switched to a different account
          console.log("Account changed from", address, "to", accounts[0]);
          setAddress(accounts[0]);
          addAppNotification("Account changed.", "info");
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, disconnectWallet, addAppNotification]);

  const contextValue = useMemo(() => ({
    address,
    signer,
    provider,
    connectWallet,
    disconnectWallet,
    refreshWalletConnection,
    isLoading,
    setIsLoading,
    appNotifications,
    addAppNotification,
    marketplaceContract,
    createProductListing,
    purchaseProduct,
    getProductListings,
    getUserOrders,
    syncInventoryToMarketplace,
    updateInventoryFromBlockchain,
    createLiquidityPool,
    stakeInPool,
    unstakeFromPool,
    getLiquidityPools,
  }), [
    address,
    signer,
    provider,
    connectWallet,
    disconnectWallet,
    refreshWalletConnection,
    isLoading,
    appNotifications,
    addAppNotification,
    marketplaceContract,
    createProductListing,
    purchaseProduct,
    getProductListings,
    getUserOrders,
    syncInventoryToMarketplace,
    updateInventoryFromBlockchain,
    createLiquidityPool,
    stakeInPool,
    unstakeFromPool,
    getLiquidityPools,
  ]);

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}; 