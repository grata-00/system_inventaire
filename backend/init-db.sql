
-- Script d'initialisation de la base de données Systemair
-- À exécuter dans MySQL pour créer toutes les tables nécessaires

DROP DATABASE IF EXISTS systemair;
CREATE DATABASE systemair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE systemair;

-- Table des utilisateurs
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role ENUM('admin', 'commercial', 'magasinier', 'directeur_general', 'directeur_commercial', 'directeur_financier', 'logistique', 'responsable_achat', 'service_facturation') NOT NULL DEFAULT 'commercial',
  isActive BOOLEAN DEFAULT FALSE,
  activatedBy VARCHAR(36) NULL,
  activatedAt TIMESTAMP NULL,
  signature TEXT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (activatedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des projets
CREATE TABLE projects (
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
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(36) NOT NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des matériels/produits
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(12,2),
  supplier VARCHAR(255),
  location VARCHAR(255),
  reference VARCHAR(100),
  status ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') DEFAULT 'available',
  image VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(36) NOT NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des demandes d'achat
CREATE TABLE purchase_requests (
  id VARCHAR(36) PRIMARY KEY,
  productName VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  urgency ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  justification TEXT NOT NULL,
  projectId VARCHAR(36) NULL,
  status ENUM('pending', 'approved', 'rejected', 'ordered') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(36) NOT NULL,
  approvedBy VARCHAR(36) NULL,
  approvedAt TIMESTAMP NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
);

-- Table des bons de commande
CREATE TABLE purchase_orders (
  id VARCHAR(36) PRIMARY KEY,
  purchaseRequestId VARCHAR(36) NOT NULL,
  orderNumber VARCHAR(100) UNIQUE NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  status ENUM('draft', 'sent', 'received', 'cancelled') DEFAULT 'draft',
  orderDate DATE NOT NULL,
  expectedDeliveryDate DATE,
  actualDeliveryDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(36) NOT NULL,
  FOREIGN KEY (purchaseRequestId) REFERENCES purchase_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des livraisons
CREATE TABLE deliveries (
  id VARCHAR(36) PRIMARY KEY,
  projectName VARCHAR(255) NOT NULL,
  clientName VARCHAR(255) NOT NULL,
  deliveryAddress TEXT NOT NULL,
  plannedDeliveryDate DATE NOT NULL,
  actualDeliveryDate DATE,
  status ENUM('pending', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
  signatureName VARCHAR(255),
  signatureDate DATE,
  signatureComments TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(36) NOT NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des produits dans les livraisons
CREATE TABLE delivery_products (
  id VARCHAR(36) PRIMARY KEY,
  deliveryId VARCHAR(36) NOT NULL,
  productName VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  initialStock INT,
  FOREIGN KEY (deliveryId) REFERENCES deliveries(id) ON DELETE CASCADE
);

-- Table des stocks
CREATE TABLE stocks (
  id VARCHAR(36) PRIMARY KEY,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  location VARCHAR(255),
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updatedBy VARCHAR(36) NOT NULL,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des notifications
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('new_project', 'new_delivery', 'new_order', 'status_update') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  targetRole ENUM('admin', 'commercial', 'magasinier', 'directeur_general', 'directeur_commercial', 'directeur_financier', 'logistique', 'responsable_achat', 'service_facturation'),
  targetUserId VARCHAR(36),
  sourceId VARCHAR(36),
  sourceType VARCHAR(50),
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (targetUserId) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertion de l'utilisateur administrateur par défaut
INSERT INTO users (id, email, password, firstName, lastName, role, isActive, createdAt) 
VALUES (
  'admin-default-001', 
  'admin@systemair.ma', 
  '$2a$10$rQJ8jJE5F1Pq2K7L.wV7e.8YtP4xVzWn9yUzZ3qFk5.WGx8.HhxS.', -- mot de passe: admin123
  'Admin', 
  'Système', 
  'admin', 
  TRUE, 
  NOW()
);

-- Données d'exemple pour les catégories de produits courantes
INSERT INTO products (id, name, category, quantity, price, supplier, location, reference, status, createdBy) VALUES
('prod-001', 'Ventilateur axial 500mm', 'Ventilation', 25, 1250.00, 'Systemair France', 'Zone A-1', 'AX500-001', 'available', 'admin-default-001'),
('prod-002', 'Conduit flexible Ø200', 'Conduits', 150, 45.50, 'DuctWork Maroc', 'Zone B-2', 'FLEX200-001', 'available', 'admin-default-001'),
('prod-003', 'Filtre G4 592x592', 'Filtration', 80, 35.00, 'FilterTech', 'Zone C-1', 'G4-592', 'available', 'admin-default-001');

-- Données d'exemple pour les notifications
INSERT INTO notifications (id, type, title, message, targetRole, isRead, createdAt) VALUES
('notif-001', 'status_update', 'Système initialisé', 'La base de données Systemair a été initialisée avec succès', 'admin', FALSE, NOW());

COMMIT;
