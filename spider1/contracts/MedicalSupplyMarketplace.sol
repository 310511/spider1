// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MedicalSupplyMarketplace
 * @dev A blockchain marketplace for medical supplies with inventory tracking
 * @notice This contract manages the listing, purchasing, and tracking of medical supplies
 */
contract MedicalSupplyMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Structs
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address supplier;
        uint256 inventory;
        string category;
        bool isActive;
        bool isVerified;
        uint256 createdAt;
        uint256 expiryDate;
    }

    struct Order {
        uint256 id;
        uint256 productId;
        address buyer;
        address seller;
        uint256 quantity;
        uint256 totalPrice;
        OrderStatus status;
        uint256 createdAt;
        string transactionHash;
    }

    struct Supplier {
        address supplierAddress;
        string name;
        bool isVerified;
        uint256 totalProducts;
        uint256 totalSales;
        uint256 rating;
    }

    // Enums
    enum OrderStatus {
        Pending,
        Confirmed,
        Shipped,
        Delivered,
        Cancelled
    }

    // State variables
    Counters.Counter private _productIds;
    Counters.Counter private _orderIds;
    
    mapping(uint256 => Product) public products;
    mapping(uint256 => Order) public orders;
    mapping(address => Supplier) public suppliers;
    mapping(address => uint256[]) public supplierProducts;
    mapping(address => uint256[]) public userOrders;
    mapping(uint256 => uint256[]) public productOrders;

    // Events
    event ProductListed(uint256 indexed productId, address indexed supplier, string name, uint256 price);
    event ProductUpdated(uint256 indexed productId, uint256 newPrice, uint256 newInventory);
    event OrderCreated(uint256 indexed orderId, uint256 indexed productId, address indexed buyer, uint256 quantity);
    event OrderStatusUpdated(uint256 indexed orderId, OrderStatus status);
    event SupplierRegistered(address indexed supplierAddress, string name);
    event ProductVerified(uint256 indexed productId, bool verified);

    // Modifiers
    modifier onlySupplier() {
        require(suppliers[msg.sender].isVerified, "Not a verified supplier");
        _;
    }

    modifier productExists(uint256 productId) {
        require(products[productId].isActive, "Product does not exist or is inactive");
        _;
    }

    modifier orderExists(uint256 orderId) {
        require(orders[orderId].id != 0, "Order does not exist");
        _;
    }

    // Constructor
    constructor() {
        _productIds.increment(); // Start from 1
        _orderIds.increment(); // Start from 1
    }

    /**
     * @dev Register a new supplier
     * @param name Supplier name
     */
    function registerSupplier(string memory name) external {
        require(bytes(name).length > 0, "Supplier name cannot be empty");
        require(!suppliers[msg.sender].isVerified, "Supplier already registered");

        suppliers[msg.sender] = Supplier({
            supplierAddress: msg.sender,
            name: name,
            isVerified: true,
            totalProducts: 0,
            totalSales: 0,
            rating: 0
        });

        emit SupplierRegistered(msg.sender, name);
    }

    /**
     * @dev List a new product on the marketplace
     * @param name Product name
     * @param description Product description
     * @param price Product price in wei
     * @param initialInventory Initial inventory quantity
     * @param category Product category
     * @param expiryDate Product expiry date (timestamp)
     */
    function listProduct(
        string memory name,
        string memory description,
        uint256 price,
        uint256 initialInventory,
        string memory category,
        uint256 expiryDate
    ) external onlySupplier returns (uint256) {
        require(bytes(name).length > 0, "Product name cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(initialInventory > 0, "Initial inventory must be greater than 0");
        require(expiryDate > block.timestamp, "Expiry date must be in the future");

        uint256 productId = _productIds.current();
        _productIds.increment();

        products[productId] = Product({
            id: productId,
            name: name,
            description: description,
            price: price,
            supplier: msg.sender,
            inventory: initialInventory,
            category: category,
            isActive: true,
            isVerified: false,
            createdAt: block.timestamp,
            expiryDate: expiryDate
        });

        supplierProducts[msg.sender].push(productId);
        suppliers[msg.sender].totalProducts++;

        emit ProductListed(productId, msg.sender, name, price);
        return productId;
    }

    /**
     * @dev Purchase a product
     * @param productId Product ID to purchase
     * @param quantity Quantity to purchase
     */
    function purchaseProduct(uint256 productId, uint256 quantity) 
        external 
        payable 
        nonReentrant 
        productExists(productId) 
    {
        Product storage product = products[productId];
        require(quantity > 0, "Quantity must be greater than 0");
        require(product.inventory >= quantity, "Insufficient inventory");
        require(msg.value >= product.price * quantity, "Insufficient payment");

        uint256 orderId = _orderIds.current();
        _orderIds.increment();

        // Update inventory
        product.inventory -= quantity;

        // Create order
        orders[orderId] = Order({
            id: orderId,
            productId: productId,
            buyer: msg.sender,
            seller: product.supplier,
            quantity: quantity,
            totalPrice: product.price * quantity,
            status: OrderStatus.Pending,
            createdAt: block.timestamp,
            transactionHash: ""
        });

        // Update mappings
        userOrders[msg.sender].push(orderId);
        productOrders[productId].push(orderId);

        // Transfer payment to supplier
        payable(product.supplier).transfer(product.price * quantity);

        // Update supplier stats
        suppliers[product.supplier].totalSales += product.price * quantity;

        emit OrderCreated(orderId, productId, msg.sender, quantity);
    }

    /**
     * @dev Update product information (only by supplier)
     * @param productId Product ID to update
     * @param newPrice New price
     * @param newInventory New inventory quantity
     */
    function updateProduct(
        uint256 productId, 
        uint256 newPrice, 
        uint256 newInventory
    ) external onlySupplier productExists(productId) {
        Product storage product = products[productId];
        require(product.supplier == msg.sender, "Only supplier can update product");

        product.price = newPrice;
        product.inventory = newInventory;

        emit ProductUpdated(productId, newPrice, newInventory);
    }

    /**
     * @dev Update order status (only by supplier)
     * @param orderId Order ID to update
     * @param newStatus New order status
     * @param transactionHash Optional transaction hash for shipping
     */
    function updateOrderStatus(
        uint256 orderId, 
        OrderStatus newStatus, 
        string memory transactionHash
    ) external orderExists(orderId) {
        Order storage order = orders[orderId];
        Product storage product = products[order.productId];
        
        require(product.supplier == msg.sender, "Only supplier can update order status");
        require(order.status != OrderStatus.Delivered, "Order already delivered");
        require(order.status != OrderStatus.Cancelled, "Order already cancelled");

        order.status = newStatus;
        if (bytes(transactionHash).length > 0) {
            order.transactionHash = transactionHash;
        }

        emit OrderStatusUpdated(orderId, newStatus);
    }

    /**
     * @dev Verify a product (only by owner)
     * @param productId Product ID to verify
     * @param verified Verification status
     */
    function verifyProduct(uint256 productId, bool verified) 
        external 
        onlyOwner 
        productExists(productId) 
    {
        products[productId].isVerified = verified;
        emit ProductVerified(productId, verified);
    }

    /**
     * @dev Get product details
     * @param productId Product ID
     * @return Product struct
     */
    function getProduct(uint256 productId) external view returns (Product memory) {
        return products[productId];
    }

    /**
     * @dev Get order details
     * @param orderId Order ID
     * @return Order struct
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    /**
     * @dev Get supplier details
     * @param supplierAddress Supplier address
     * @return Supplier struct
     */
    function getSupplier(address supplierAddress) external view returns (Supplier memory) {
        return suppliers[supplierAddress];
    }

    /**
     * @dev Get all products by supplier
     * @param supplierAddress Supplier address
     * @return Array of product IDs
     */
    function getSupplierProducts(address supplierAddress) external view returns (uint256[] memory) {
        return supplierProducts[supplierAddress];
    }

    /**
     * @dev Get all orders by user
     * @param userAddress User address
     * @return Array of order IDs
     */
    function getUserOrders(address userAddress) external view returns (uint256[] memory) {
        return userOrders[userAddress];
    }

    /**
     * @dev Get all orders for a product
     * @param productId Product ID
     * @return Array of order IDs
     */
    function getProductOrders(uint256 productId) external view returns (uint256[] memory) {
        return productOrders[productId];
    }

    /**
     * @dev Get total number of products
     * @return Total product count
     */
    function getTotalProducts() external view returns (uint256) {
        return _productIds.current() - 1;
    }

    /**
     * @dev Get total number of orders
     * @return Total order count
     */
    function getTotalOrders() external view returns (uint256) {
        return _orderIds.current() - 1;
    }

    /**
     * @dev Emergency function to pause all operations (only by owner)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
        // This would pause all marketplace operations
    }

    /**
     * @dev Withdraw contract balance (only by owner)
     */
    function withdrawBalance() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
} 