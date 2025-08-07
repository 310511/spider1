import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Shield } from "lucide-react";

interface MetaMaskGuideProps {
  onClose: () => void;
}

export const MetaMaskGuide: React.FC<MetaMaskGuideProps> = ({ onClose }) => {
  const openMetaMaskWebsite = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Install MetaMask
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            MetaMask is required to connect your wallet and use the marketplace features. 
            It's a secure wallet for managing your cryptocurrency and interacting with blockchain applications.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Steps to install MetaMask:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit the official MetaMask website</li>
              <li>Click "Download" and choose your browser</li>
              <li>Install the extension</li>
              <li>Create a new wallet or import existing one</li>
              <li>Return here and click "Connect Wallet"</li>
            </ol>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={openMetaMaskWebsite} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download MetaMask
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Security Note:</p>
            <p>
              Never share your private keys or seed phrase with anyone. 
              MetaMask will never ask for your password or private keys.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 