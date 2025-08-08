import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Bug, Wallet, AlertCircle } from "lucide-react";
import { useBlockchain } from "@/contexts/BlockchainContext";

interface WalletDebugProps {
  onClose: () => void;
}

export const WalletDebug: React.FC<WalletDebugProps> = ({ onClose }) => {
  const { 
    address, 
    signer, 
    provider, 
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshWalletConnection,
    addAppNotification 
  } = useBlockchain();

  const checkMetaMaskStatus = () => {
    const hasEthereum = typeof window.ethereum !== 'undefined';
    const isConnected = address !== null;
    
    return {
      hasEthereum,
      isConnected,
      address,
      hasSigner: signer !== null,
      hasProvider: provider !== null,
      isLoading
    };
  };

  const handleTestConnection = async () => {
    try {
      addAppNotification("Testing wallet connection...", "info");
      await connectWallet();
    } catch (error) {
      console.error("Test connection failed:", error);
      addAppNotification("Test connection failed", "error");
    }
  };

  const handleForceRefresh = async () => {
    try {
      addAppNotification("Force refreshing connection...", "info");
      await refreshWalletConnection();
    } catch (error) {
      console.error("Force refresh failed:", error);
      addAppNotification("Force refresh failed", "error");
    }
  };

  const status = checkMetaMaskStatus();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            Wallet Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Connection Status:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span>MetaMask Available:</span>
                <Badge variant={status.hasEthereum ? "default" : "destructive"}>
                  {status.hasEthereum ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Connected:</span>
                <Badge variant={status.isConnected ? "default" : "secondary"}>
                  {status.isConnected ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Loading:</span>
                <Badge variant={status.isLoading ? "default" : "secondary"}>
                  {status.isLoading ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Signer:</span>
                <Badge variant={status.hasSigner ? "default" : "secondary"}>
                  {status.hasSigner ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Provider:</span>
                <Badge variant={status.hasProvider ? "default" : "secondary"}>
                  {status.hasProvider ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {status.address && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Connected Address:</h4>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                {status.address}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Actions:</h4>
            <div className="flex gap-2">
              <Button 
                onClick={handleTestConnection} 
                size="sm" 
                disabled={status.isLoading}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Test Connect
              </Button>
              <Button 
                onClick={handleForceRefresh} 
                size="sm" 
                variant="outline"
                disabled={status.isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Refresh
              </Button>
              <Button 
                onClick={disconnectWallet} 
                size="sm" 
                variant="destructive"
                disabled={status.isLoading}
              >
                Disconnect
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Troubleshooting Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Make sure MetaMask is unlocked</li>
              <li>Try refreshing the page</li>
              <li>Check if MetaMask is on the correct network</li>
              <li>Try disconnecting and reconnecting</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 