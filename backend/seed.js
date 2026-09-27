import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import User from './models/User.js';
import Product from './models/Product.js';
import Supplier from './models/Supplier.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import StockMovement from './models/StockMovement.js';
import Notification from './models/Notification.js';

dotenv.config();

const ORG_NAME = 'Demo Corp';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Clearing old demo data...');
    // Clear only Demo Corp data so we don't nuke actual user data
    await User.deleteMany({ organization: ORG_NAME });
    await Product.deleteMany({ organization: ORG_NAME });
    await Supplier.deleteMany({ organization: ORG_NAME });
    await PurchaseOrder.deleteMany({ organization: ORG_NAME });
    await StockMovement.deleteMany({ organization: ORG_NAME });
    await Notification.deleteMany({ organization: ORG_NAME });

    console.log('Creating demo admin user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'admin',
      organization: ORG_NAME
    });

    console.log('Creating suppliers...');
    const supplier1 = await Supplier.create({
      name: 'Global Foods Inc',
      contactPerson: 'Jane Doe',
      email: 'jane@globalfoods.com',
      phone: '555-0101',
      address: '123 Warehouse Row, NY',
      averageDeliveryDays: 3,
      reliabilityScore: 94,
      organization: ORG_NAME,
      user: adminUser._id
    });

    const supplier2 = await Supplier.create({
      name: 'Prime Electronics',
      contactPerson: 'John Smith',
      email: 'john@primeelec.com',
      phone: '555-0102',
      address: '456 Tech Park, CA',
      averageDeliveryDays: 7,
      reliabilityScore: 88,
      organization: ORG_NAME,
      user: adminUser._id
    });

    const supplier3 = await Supplier.create({
      name: 'Acme Logistics',
      contactPerson: 'Sarah Connor',
      email: 'sarah@acme.com',
      phone: '555-0103',
      address: '789 Route Ave, TX',
      averageDeliveryDays: 2,
      reliabilityScore: 98,
      organization: ORG_NAME,
      user: adminUser._id
    });

    console.log('Creating products...');
    const p1 = await Product.create({
      name: 'Basmati Rice 25kg',
      sku: 'FOOD-001',
      category: 'Groceries',
      description: 'Premium long grain basmati rice',
      price: 45.00,
      currentStock: 142,
      reorderPoint: 50,
      safetyStock: 100,
      supplier: supplier1._id,
      organization: ORG_NAME,
      user: adminUser._id
    });

    const p2 = await Product.create({
      name: 'Sunflower Oil 15L',
      sku: 'FOOD-002',
      category: 'Groceries',
      description: 'Refined sunflower cooking oil',
      price: 32.50,
      currentStock: 18,
      reorderPoint: 30,
      safetyStock: 50,
      supplier: supplier1._id,
      organization: ORG_NAME,
      user: adminUser._id
    });

    const p3 = await Product.create({
      name: 'Wireless Keyboard',
      sku: 'ELEC-001',
      category: 'Electronics',
      description: 'Mechanical wireless keyboard',
      price: 85.00,
      currentStock: 120,
      reorderPoint: 40,
      safetyStock: 80,
      supplier: supplier2._id,
      organization: ORG_NAME,
      user: adminUser._id
    });

    const p4 = await Product.create({
      name: 'USB-C Cable 2m',
      sku: 'ELEC-002',
      category: 'Electronics',
      description: 'Fast charging braided cable',
      price: 12.00,
      currentStock: 4,
      reorderPoint: 100,
      safetyStock: 200,
      supplier: supplier2._id,
      organization: ORG_NAME,
      user: adminUser._id
    });

    console.log('Creating purchase orders...');
    await PurchaseOrder.create({
      supplier: supplier1._id,
      items: [
        { product: p2._id, quantity: 50, unitPrice: 30.00 }
      ],
      totalAmount: 1500.00,
      status: 'shipped',
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      organization: ORG_NAME,
      user: adminUser._id
    });

    await PurchaseOrder.create({
      supplier: supplier2._id,
      items: [
        { product: p4._id, quantity: 200, unitPrice: 10.00 }
      ],
      totalAmount: 2000.00,
      status: 'pending',
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      organization: ORG_NAME,
      user: adminUser._id
    });

    console.log('Creating stock movements...');
    await StockMovement.create({
      product: p1._id,
      type: 'in',
      quantity: 100,
      previousStock: 42,
      newStock: 142,
      reason: 'Supplier Shipment',
      user: adminUser._id,
      organization: ORG_NAME
    });

    await StockMovement.create({
      product: p3._id,
      type: 'out',
      quantity: 10,
      previousStock: 130,
      newStock: 120,
      reason: 'Sale',
      user: adminUser._id,
      organization: ORG_NAME
    });

    console.log('Creating notifications...');
    await Notification.create({
      type: 'LOW_STOCK',
      priority: 'HIGH',
      message: 'USB-C Cable 2m has dropped below reorder point (4 < 100).',
      productId: p4._id,
      read: false,
      organization: ORG_NAME
    });

    await Notification.create({
      type: 'SUPPLIER_DELAY',
      priority: 'MEDIUM',
      message: 'Your demo environment has been successfully provisioned.',
      read: true,
      organization: ORG_NAME
    });

    console.log('Demo data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error?.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
};

seedDatabase();
