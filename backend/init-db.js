
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// async function initDatabase() {
//   let connection;
  
//   try {
//     // Connexion à MySQL sans spécifier de base de données
//     connection = await mysql.createConnection({
//       host: process.env.DB_HOST || 'localhost',
//       port: process.env.DB_PORT || 3306,
//       user: process.env.DB_USER || 'root',
//       password: process.env.DB_PASSWORD || ''
//     });

//     console.log('✅ Connexion à MySQL établie');

//     // Créer la base de données si elle n'existe pas
//     await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'systemair'}`);
//     console.log(`✅ Base de données ${process.env.DB_NAME || 'systemair'} créée/vérifiée`);

//     // Utiliser la base de données
//     await connection.execute(`USE ${process.env.DB_NAME || 'systemair'}`);

//     // Créer les tables
//     const tables = [
//       // Table users
//       `CREATE TABLE IF NOT EXISTS users (
//         id VARCHAR(36) PRIMARY KEY,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         firstName VARCHAR(100) NOT NULL,
//         lastName VARCHAR(100) NOT NULL,
//         role ENUM('admin', 'commercial', 'magasinier', 'directeur_general', 'directeur_commercial', 'directeur_financier', 'logistique', 'responsable_achat', 'service_facturation') NOT NULL DEFAULT 'commercial',
//         isActive BOOLEAN DEFAULT FALSE,
//         activatedBy VARCHAR(36),
//         activatedAt DATETIME,
//         signature TEXT,
//         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       )`,

//       // Table products
//       `CREATE TABLE IF NOT EXISTS products (
//         id VARCHAR(36) PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         quantity INT NOT NULL DEFAULT 0,
//         category VARCHAR(100),
//         reference VARCHAR(100),
//         location VARCHAR(255),
//         status ENUM('En stock', 'Stock limité', 'Rupture de stock') DEFAULT 'En stock',
//         imageUrl VARCHAR(500),
//         lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         createdBy VARCHAR(36),
//         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FOREIGN KEY (createdBy) REFERENCES users(id)
//       )`,

//       // Table projects
//       `CREATE TABLE IF NOT EXISTS projects (
//         id VARCHAR(36) PRIMARY KEY,
//         projectName VARCHAR(255) NOT NULL,
//         clientName VARCHAR(255) NOT NULL,
//         commercial VARCHAR(255) NOT NULL,
//         products JSON,
//         totalAmount DECIMAL(10,2),
//         status ENUM('En cours', 'Terminé', 'Annulé') DEFAULT 'En cours',
//         createdBy VARCHAR(36),
//         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FOREIGN KEY (createdBy) REFERENCES users(id)
//       )`,

//       // Table purchase_requests
//       `CREATE TABLE IF NOT EXISTS purchase_requests (
//         id VARCHAR(36) PRIMARY KEY,
//         requestNumber VARCHAR(50) UNIQUE NOT NULL,
//         projectName VARCHAR(255) NOT NULL,
//         requestedProducts JSON NOT NULL,
//         totalEstimatedCost DECIMAL(10,2),
//         priority ENUM('Normale', 'Urgente', 'Critique') DEFAULT 'Normale',
//         status ENUM('En attente', 'Approuvée', 'Rejetée') DEFAULT 'En attente',
//         requestedBy VARCHAR(36) NOT NULL,
//         approvedBy VARCHAR(36),
//         approvedAt DATETIME,
//         rejectionReason TEXT,
//         notes TEXT,
//         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FOREIGN KEY (requestedBy) REFERENCES users(id),
//         FOREIGN KEY (approvedBy) REFERENCES users(id)
//       )`,

//       // Table deliveries
//       `CREATE TABLE IF NOT EXISTS deliveries (
//         id VARCHAR(36) PRIMARY KEY,
//         deliveryNumber VARCHAR(50) UNIQUE NOT NULL,
//         projectName VARCHAR(255) NOT NULL,
//         clientName VARCHAR(255) NOT NULL,
//         products JSON NOT NULL,
//         totalQuantity INT NOT NULL,
//         deliveryDate DATETIME NOT NULL,
//         status ENUM('Préparée', 'En transit', 'Livrée') DEFAULT 'Préparée',
//         driverName VARCHAR(255),
//         vehicleInfo VARCHAR(255),
//         notes TEXT,
//         signature TEXT,
//         createdBy VARCHAR(36),
//         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FOREIGN KEY (createdBy) REFERENCES users(id)
//       )`
//     ];

//     for (const table of tables) {
//       await connection.execute(table);
//     }

//     console.log('✅ Toutes les tables ont été créées');

//     // Créer l'utilisateur admin par défaut
//     const adminId = 'admin-' + Date.now();
//     const bcrypt = require('bcryptjs');
//     const hashedPassword = await bcrypt.hash('admin123', 10);

//     await connection.execute(
//       `INSERT IGNORE INTO users (id, email, password, firstName, lastName, role, isActive) 
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [adminId, 'admin@systemair.ma', hashedPassword, 'Admin', 'Système', 'admin', true]
//     );

//     console.log('✅ Utilisateur admin créé (admin@systemair.ma / admin123)');
//     console.log('🎉 Initialisation de la base de données terminée avec succès !');

//   } catch (error) {
//     console.error('❌ Erreur lors de l\'initialisation:', error);
//   } finally {
//     if (connection) {
//       await connection.end();
//     }
//   }
// }

// initDatabase();

const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
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
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'systemair_db'}\``);
    console.log(`✅ Base de données ${process.env.DB_NAME || 'systemair_db'} créée/vérifiée`);

    // Fermer la connexion actuelle et se reconnecter avec la base de données spécifiée
    await connection.end();
    
    // Nouvelle connexion avec la base de données spécifiée
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'systemair_db'
    });

    console.log(`✅ Connecté à la base de données ${process.env.DB_NAME || 'systemair_db'}`);

    // Créer les tables
    const tables = [
      // Table users
      `CREATE TABLE IF NOT EXISTS users (
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
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Table products
      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        category VARCHAR(100),
        reference VARCHAR(100),
        location VARCHAR(255),
        status ENUM('En stock', 'Stock limité', 'Rupture de stock') DEFAULT 'En stock',
        imageUrl VARCHAR(500),
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        createdBy VARCHAR(36),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )`,

      // Table projects
      `CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        projectName VARCHAR(255) NOT NULL,
        clientName VARCHAR(255) NOT NULL,
        commercial VARCHAR(255) NOT NULL,
        products JSON,
        totalAmount DECIMAL(10,2),
        status ENUM('En cours', 'Terminé', 'Annulé') DEFAULT 'En cours',
        createdBy VARCHAR(36),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )`,

      // Table purchase_requests
      `CREATE TABLE IF NOT EXISTS purchase_requests (
        id VARCHAR(36) PRIMARY KEY,
        requestNumber VARCHAR(50) UNIQUE NOT NULL,
        projectName VARCHAR(255) NOT NULL,
        requestedProducts JSON NOT NULL,
        totalEstimatedCost DECIMAL(10,2),
        priority ENUM('Normale', 'Urgente', 'Critique') DEFAULT 'Normale',
        status ENUM('En attente', 'Approuvée', 'Rejetée') DEFAULT 'En attente',
        requestedBy VARCHAR(36) NOT NULL,
        approvedBy VARCHAR(36),
        approvedAt DATETIME,
        rejectionReason TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (requestedBy) REFERENCES users(id),
        FOREIGN KEY (approvedBy) REFERENCES users(id)
      )`,

      // Table deliveries
      `CREATE TABLE IF NOT EXISTS deliveries (
        id VARCHAR(36) PRIMARY KEY,
        deliveryNumber VARCHAR(50) UNIQUE NOT NULL,
        projectName VARCHAR(255) NOT NULL,
        clientName VARCHAR(255) NOT NULL,
        products JSON NOT NULL,
        totalQuantity INT NOT NULL,
        deliveryDate DATETIME NOT NULL,
        status ENUM('Préparée', 'En transit', 'Livrée') DEFAULT 'Préparée',
        driverName VARCHAR(255),
        vehicleInfo VARCHAR(255),
        notes TEXT,
        signature TEXT,
        createdBy VARCHAR(36),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )`
    ];

    for (const table of tables) {
      await connection.execute(table);
    }

    console.log('✅ Toutes les tables ont été créées');

    // Créer l'utilisateur admin par défaut
    const adminId = 'admin-' + Date.now();
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await connection.execute(
      `INSERT IGNORE INTO users (id, email, password, firstName, lastName, role, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [adminId, 'admin@systemair.ma', hashedPassword, 'Admin', 'Système', 'admin', true]
    );

    console.log('✅ Utilisateur admin créé (admin@systemair.ma / admin123)');
    console.log('🎉 Initialisation de la base de données terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();