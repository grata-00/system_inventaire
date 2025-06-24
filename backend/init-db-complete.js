
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initCompleteDatabase() {
  let connection;
  
  try {
    // Connexion à MySQL sans spécifier de base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connexion à MySQL établie');

    // Créer la base de données si elle n'existe pas
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'systemair'}`);
    console.log(`✅ Base de données ${process.env.DB_NAME || 'systemair'} créée/vérifiée`);

    // Utiliser la base de données
    await connection.execute(`USE ${process.env.DB_NAME || 'systemair'}`);

    // Supprimer les tables existantes dans l'ordre correct (en raison des clés étrangères)
    const dropTables = [
      'DROP TABLE IF EXISTS purchase_orders',
      'DROP TABLE IF EXISTS purchase_requests', 
      'DROP TABLE IF EXISTS delivery_products',
      'DROP TABLE IF EXISTS deliveries',
      'DROP TABLE IF EXISTS stocks',
      'DROP TABLE IF EXISTS products',
      'DROP TABLE IF EXISTS projects',
      'DROP TABLE IF EXISTS notifications',
      'DROP TABLE IF EXISTS users'
    ];

    for (const dropTable of dropTables) {
      await connection.execute(dropTable);
    }
    console.log('✅ Tables existantes supprimées');

    // Créer les tables dans l'ordre correct
    const tables = [
      // Table users (doit être créée en premier car référencée par d'autres tables)
      `CREATE TABLE users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        role ENUM('admin', 'commercial', 'magasinier', 'directeur_general', 'directeur_commercial', 'directeur_financier', 'logistique', 'responsable_achat', 'service_facturation') NOT NULL DEFAULT 'commercial',
        isActive BOOLEAN DEFAULT FALSE,
        activatedBy VARCHAR(36),
        activatedAt DATETIME,
        signature TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (activatedBy) REFERENCES users(id) ON DELETE SET NULL
      )`,

      // Table products
      `CREATE TABLE products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        category VARCHAR(100),
        reference VARCHAR(100),
        location VARCHAR(255),
        price DECIMAL(15,2),
        supplier VARCHAR(255),
        status ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') DEFAULT 'available',
        image VARCHAR(500),
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        createdBy VARCHAR(36),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      )`,

      // Table projects
      `CREATE TABLE projects (
        id VARCHAR(36) PRIMARY KEY,
        orderNumber VARCHAR(100) UNIQUE NOT NULL,
        commercialName VARCHAR(255) NOT NULL,
        pricedBy VARCHAR(255) NOT NULL,
        clientName VARCHAR(255) NOT NULL,
        projectName VARCHAR(255) NOT NULL,
        orderDescription TEXT,
        quantity VARCHAR(100),
        orderAmount DECIMAL(15,2) NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        expectedSalesCoefficient DECIMAL(10,4) NOT NULL,
        effectiveSalesCoefficient DECIMAL(10,4) NOT NULL,
        poundRate DECIMAL(10,4) NOT NULL,
        dollarRate DECIMAL(10,4) NOT NULL,
        transportAmount DECIMAL(15,2) DEFAULT 0,
        paymentMethod ENUM('virement', 'cheque', 'en_compte', 'espece') NULL,
        effectiveDeliveryDate DATE NOT NULL,
        remarks TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        createdBy VARCHAR(36) NOT NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Table purchase_requests avec système d'approbation multiple
      `CREATE TABLE purchase_requests (
        id VARCHAR(36) PRIMARY KEY,
        requestNumber VARCHAR(50) UNIQUE NOT NULL,
        projectName VARCHAR(255) NOT NULL,
        requestedProducts JSON NOT NULL,
        totalEstimatedCost DECIMAL(15,2),
        quantity INT NOT NULL,
        deliveryDate DATE,
        estimationDate DATE,
        priority ENUM('Basse', 'Normale', 'Haute', 'Urgente') DEFAULT 'Normale',
        status ENUM('En attente', 'En cours d\\'approbation', 'Approuvée', 'Rejetée', 'Commandée') DEFAULT 'En attente',
        notes TEXT,
        rejectionReason TEXT,
        requestedBy VARCHAR(36) NOT NULL,
        approvedBy VARCHAR(36),
        approvedAt DATETIME,
        approvals JSON DEFAULT ('[]'),
        approvalCount INT DEFAULT 0,
        isFullyApproved BOOLEAN DEFAULT FALSE,
        requiredApprovalsCount INT DEFAULT 3,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (requestedBy) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
      )`,

      // Table purchase_orders
      `CREATE TABLE purchase_orders (
        id VARCHAR(36) PRIMARY KEY,
        orderNumber VARCHAR(100) UNIQUE NOT NULL,
        supplier VARCHAR(255) NOT NULL,
        products JSON NOT NULL,
        totalAmount DECIMAL(15,2) NOT NULL,
        status ENUM('Brouillon', 'Envoyée', 'Reçue', 'Annulée') DEFAULT 'Brouillon',
        orderDate DATE NOT NULL,
        expectedDeliveryDate DATE,
        actualDeliveryDate DATE,
        notes TEXT,
        purchaseRequestId VARCHAR(36),
        createdBy VARCHAR(36) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (purchaseRequestId) REFERENCES purchase_requests(id) ON DELETE SET NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Table deliveries
      `CREATE TABLE deliveries (
        id VARCHAR(36) PRIMARY KEY,
        deliveryNumber VARCHAR(50) UNIQUE,
        projectName VARCHAR(255) NOT NULL,
        clientName VARCHAR(255) NOT NULL,
        commercialId VARCHAR(36),
        deliveryAddress TEXT,
        plannedDeliveryDate DATE,
        actualDeliveryDate DATE,
        status ENUM('pending', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
        driverName VARCHAR(255),
        vehicleInfo VARCHAR(255),
        notes TEXT,
        createdBy VARCHAR(36),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (commercialId) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      )`,

      // Table delivery_products
      `CREATE TABLE delivery_products (
        id VARCHAR(36) PRIMARY KEY,
        deliveryId VARCHAR(36) NOT NULL,
        productName VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        initialStock INT,
        FOREIGN KEY (deliveryId) REFERENCES deliveries(id) ON DELETE CASCADE
      )`,

      // Table stocks
      `CREATE TABLE stocks (
        id VARCHAR(36) PRIMARY KEY,
        productId VARCHAR(36) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        location VARCHAR(255),
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updatedBy VARCHAR(36) NOT NULL,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Table notifications
      `CREATE TABLE notifications (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('new_project', 'new_delivery', 'new_order', 'status_update', 'approval_request') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        targetRole ENUM('admin', 'commercial', 'magasinier', 'directeur_general', 'directeur_commercial', 'directeur_financier', 'logistique', 'responsable_achat', 'service_facturation'),
        targetUserId VARCHAR(36),
        sourceId VARCHAR(36),
        sourceType VARCHAR(50),
        isRead BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        createdBy VARCHAR(36),
        FOREIGN KEY (targetUserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      )`
    ];

    for (const table of tables) {
      await connection.execute(table);
    }
    console.log('✅ Toutes les tables ont été créées');

    // Créer les utilisateurs par défaut avec des mots de passe hashés
    const adminPassword = await bcrypt.hash('admin123', 10);
    const directeurGeneralPassword = await bcrypt.hash('directeur123', 10);
    const directeurCommercialPassword = await bcrypt.hash('commercial123', 10);
    const directeurFinancierPassword = await bcrypt.hash('financier123', 10);
    const responsableAchatPassword = await bcrypt.hash('achat123', 10);
    const commercialPassword = await bcrypt.hash('commercial123', 10);

    const defaultUsers = [
      ['admin-001', 'admin@systemair.ma', adminPassword, 'Admin', 'Système', 'admin', true],
      ['directeur-general-001', 'dg@systemair.ma', directeurGeneralPassword, 'Directeur', 'Général', 'directeur_general', true],
      ['directeur-commercial-001', 'dc@systemair.ma', directeurCommercialPassword, 'Directeur', 'Commercial', 'directeur_commercial', true],
      ['directeur-financier-001', 'df@systemair.ma', directeurFinancierPassword, 'Directeur', 'Financier', 'directeur_financier', true],
      ['responsable-achat-001', 'achat@systemair.ma', responsableAchatPassword, 'Responsable', 'Achat', 'responsable_achat', true],
      ['commercial-001', 'commercial@systemair.ma', commercialPassword, 'Commercial', 'Test', 'commercial', true]
    ];

    for (const user of defaultUsers) {
      await connection.execute(
        `INSERT IGNORE INTO users (id, email, password, firstName, lastName, role, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        user
      );
    }

    console.log('✅ Utilisateurs par défaut créés');

    // Données d'exemple pour les produits
    const sampleProducts = [
      ['prod-001', 'Ventilateur axial 500mm', 25, 'Ventilation', 'AX500-001', 'Zone A-1', 1250.00, 'Systemair France', 'available', null, 'admin-001'],
      ['prod-002', 'Conduit flexible Ø200', 150, 'Conduits', 'FLEX200-001', 'Zone B-2', 45.50, 'DuctWork Maroc', 'available', null, 'admin-001'],
      ['prod-003', 'Filtre G4 592x592', 80, 'Filtration', 'G4-592', 'Zone C-1', 35.00, 'FilterTech', 'available', null, 'admin-001']
    ];

    for (const product of sampleProducts) {
      await connection.execute(
        `INSERT IGNORE INTO products (id, name, quantity, category, reference, location, price, supplier, status, image, createdBy) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        product
      );
    }

    console.log('✅ Produits d\'exemple créés');

    console.log('🎉 Initialisation complète de la base de données terminée !');
    console.log('');
    console.log('👥 Utilisateurs créés :');
    console.log('   - Admin: admin@systemair.ma / admin123');
    console.log('   - Directeur Général: dg@systemair.ma / directeur123');
    console.log('   - Directeur Commercial: dc@systemair.ma / commercial123');
    console.log('   - Directeur Financier: df@systemair.ma / financier123');
    console.log('   - Responsable Achat: achat@systemair.ma / achat123');
    console.log('   - Commercial: commercial@systemair.ma / commercial123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initCompleteDatabase();
