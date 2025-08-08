# Ledger-Aegis Marketplace Integration Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the integrated Ledger-Aegis marketplace system, combining blockchain functionality with medical inventory management.

## Prerequisites

### Development Environment Setup

1. **Node.js and npm**
   ```bash
   node --version  # Should be 18.x or higher
   npm --version   # Should be 8.x or higher
   ```

2. **Hardhat (for smart contract deployment)**
   ```bash
   npm install -g hardhat
   ```

3. **MetaMask or similar Web3 wallet**

4. **Git**
   ```bash
   git --version
   ```

## Project Structure

```
ledger-clinic/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── InventoryTable.tsx (enhanced)
│   │   └── marketplace/
│   │       └── MarketplaceDashboard.tsx (new)
│   ├── contexts/
│   │   └── BlockchainContext.tsx (new)
│   └── App.tsx (updated)
├── contracts/
│   └── MedicalSupplyMarketplace.sol (new)
├── hardhat.config.js (new)
├── package.json (updated)
└── DEPLOYMENT_GUIDE.md
```

## Step 1: Install Dependencies

### Update package.json

Add the following dependencies to your `package.json`:

```json
{
  "dependencies": {
    "ethers": "^5.7.2",
    "@openzeppelin/contracts": "^4.8.0",
    "hardhat": "^2.12.0",
    "@nomiclabs/hardhat-ethers": "^2.2.0",
    "@nomiclabs/hardhat-waffle": "^2.0.3",
    "ethereum-waffle": "^3.4.4",
    "chai": "^4.3.6"
  }
}
```

### Install dependencies

```bash
cd ledger-clinic
npm install
```

## Step 2: Smart Contract Setup

### Create Hardhat Configuration

Create `hardhat.config.js` in the root directory:

```javascript
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Add your preferred testnet/mainnet configuration
    goerli: {
      url: process.env.GOERLI_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
```

### Create Environment Variables

Create `.env` file:

```env
PRIVATE_KEY=your_private_key_here
GOERLI_URL=your_goerli_rpc_url_here
MARKETPLACE_CONTRACT_ADDRESS=deployed_contract_address_here
```

## Step 3: Deploy Smart Contracts

### Compile Contracts

```bash
npx hardhat compile
```

### Deploy to Local Network

```bash
# Start local blockchain
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to Testnet

```bash
npx hardhat run scripts/deploy.js --network goerli
```

## Step 4: Update Application Configuration

### Update Blockchain Context

Update the contract address in `src/contexts/BlockchainContext.tsx`:

```typescript
const MARKETPLACE_CONTRACT_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS || "your_deployed_contract_address";
```

### Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const MedicalSupplyMarketplace = await hre.ethers.getContractFactory("MedicalSupplyMarketplace");
  const marketplace = await MedicalSupplyMarketplace.deploy();
  await marketplace.deployed();

  console.log("MedicalSupplyMarketplace deployed to:", marketplace.address);
  
  // Save the contract address for frontend use
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ MedicalSupplyMarketplace: marketplace.address }, undefined, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## Step 5: Frontend Integration

### Update App.tsx

Modify your main App component to include the blockchain provider and marketplace routes:

```typescript
import { BlockchainProvider } from "./contexts/BlockchainContext";
import { MarketplaceDashboard } from "./components/marketplace/MarketplaceDashboard";

// Wrap your app with BlockchainProvider
const App = () => (
  <BlockchainProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<MarketplaceDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </BlockchainProvider>
);
```

### Update Header Component

Add marketplace navigation to your header:

```typescript
// In Header.tsx
<nav className="flex items-center gap-4">
  <Link to="/" className="text-sm font-medium">Dashboard</Link>
  <Link to="/marketplace" className="text-sm font-medium">Marketplace</Link>
</nav>
```

## Step 6: Testing

### Unit Tests

Create tests for your smart contracts:

```bash
npx hardhat test
```

### Integration Tests

Test the marketplace functionality:

1. Connect wallet
2. Browse products
3. Make a purchase
4. Verify transaction on blockchain

### End-to-End Tests

Test complete user workflows:

```bash
npm run test:e2e
```

## Step 7: Production Deployment

### Frontend Deployment

#### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Environment Variables for Production

```
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=your_production_contract_address
REACT_APP_NETWORK_ID=1  # Mainnet
REACT_APP_RPC_URL=your_production_rpc_url
```

### Smart Contract Deployment

#### Mainnet Deployment

```bash
# Set mainnet configuration in hardhat.config.js
npx hardhat run scripts/deploy.js --network mainnet
```

#### Contract Verification

```bash
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS
```

## Step 8: Monitoring and Maintenance

### Blockchain Monitoring

1. **Transaction Monitoring**: Monitor failed transactions
2. **Gas Price Optimization**: Implement dynamic gas pricing
3. **Network Status**: Monitor blockchain network status

### Application Monitoring

1. **Error Tracking**: Implement Sentry for error tracking
2. **Performance Monitoring**: Monitor page load times
3. **User Analytics**: Track marketplace usage

### Security Considerations

1. **Smart Contract Audits**: Regular security audits
2. **Access Control**: Implement proper role-based access
3. **Emergency Procedures**: Plan for emergency situations

## Troubleshooting

### Common Issues

1. **MetaMask Connection Issues**
   - Ensure MetaMask is installed
   - Check network configuration
   - Verify account permissions

2. **Transaction Failures**
   - Check gas limits
   - Verify sufficient balance
   - Check network congestion

3. **Contract Interaction Errors**
   - Verify contract address
   - Check ABI compatibility
   - Ensure correct network

### Debug Commands

```bash
# Check contract deployment
npx hardhat verify --network goerli CONTRACT_ADDRESS

# Test local deployment
npx hardhat test

# Check gas estimates
npx hardhat run scripts/estimate-gas.js
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Implement React.lazy for marketplace components
2. **Caching**: Cache blockchain data appropriately
3. **Bundle Optimization**: Minimize bundle size

### Blockchain Optimization

1. **Batch Transactions**: Group multiple operations
2. **Gas Optimization**: Optimize smart contract functions
3. **Indexing**: Implement proper event indexing

## Security Checklist

- [ ] Smart contract audited
- [ ] Access controls implemented
- [ ] Emergency pause functionality
- [ ] Input validation
- [ ] Reentrancy protection
- [ ] Overflow protection
- [ ] Proper error handling

## Support and Documentation

### User Documentation

1. **Marketplace Guide**: How to use the marketplace
2. **Wallet Setup**: MetaMask configuration
3. **Troubleshooting**: Common issues and solutions

### Developer Documentation

1. **API Documentation**: Smart contract functions
2. **Integration Guide**: How to integrate with the system
3. **Deployment Guide**: This document

## Conclusion

This deployment guide provides a comprehensive approach to deploying the integrated Ledger-Aegis marketplace system. Follow each step carefully and ensure proper testing before production deployment.

For additional support, refer to the project documentation or contact the development team. 