
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const http = require('http');
// const socketIo = require('socket.io');
// const path = require('path');
// require('dotenv').config();

// // Import database and models
// const { syncDatabase } = require('./models');

// const app = express();
// const server = http.createServer(app);

// // ✅ Liste des origines autorisées - UPDATED to include port 8081
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:8080",
//   "http://localhost:8081", // Added this port
//   "http://localhost:3001",
//   "http://127.0.0.1:5173",
//   "http://127.0.0.1:8080",
//   "http://127.0.0.1:8081" // Added this port
// ];

// // ✅ Configuration de Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// // ✅ Middlewares sécurité & CORS
// app.use(helmet());
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.warn("❌ CORS bloqué pour l'origine :", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true
// }));

// // ✅ Limitation des requêtes
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100
// });
// app.use('/api/', limiter);

// // ✅ Body parser
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // ✅ Fichiers statiques (images)
// app.use('/uploads', (req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// }, express.static(path.join(__dirname, 'public/uploads')));

// // ✅ Partage de socket.io avec toutes les routes
// app.set('io', io);

// // ✅ Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/projects', require('./routes/projects'));
// app.use('/api/purchases', require('./routes/purchases'));
// app.use('/api/purchase-requests', require('./routes/purchase_requests')); // Nouvelle route
// app.use('/api/purchase-orders', require('./routes/purchase_orders'));
// app.use('/api/deliveries', require('./routes/deliveries'));
// app.use('/api/materials', require('./routes/materials'));
// app.use('/api/stocks', require('./routes/stocks'));
// app.use('/api/notifications', require('./routes/notifications'));

// // ✅ Socket.IO
// require('./api/socket')(io);

// // ✅ Test API
// app.get('/api', (req, res) => {
//   res.json({ 
//     success: true,
//     message: 'Systemair API is running',
//     version: '1.0.0',
//     endpoints: {
//       auth: '/api/auth',
//       users: '/api/users',
//       products: '/api/products',
//       projects: '/api/projects',
//       purchases: '/api/purchases',
//       'purchase-requests': '/api/purchase-requests',
//       'purchase-orders': '/api/purchase-orders',
//       deliveries: '/api/deliveries',
//       materials: '/api/materials',
//       stocks: '/api/stocks',
//       notifications: '/api/notifications'
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     message: 'Systemair API is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // ✅ Middleware erreur globale
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     success: false, 
//     error: 'Erreur interne du serveur' 
//   });
// });

// // ✅ Route 404
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     error: 'Route non trouvée' 
//   });
// });

// // ✅ Démarrage serveur
// const PORT = process.env.PORT || 3001;

// const startServer = async () => {
//   try {
//     await syncDatabase();
//     server.listen(PORT, () => {
//       console.log(`🚀 Serveur démarré sur le port ${PORT}`);
//       console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
//       console.log(`🖼️ Images accessibles via http://localhost:${PORT}/uploads/<filename>`);
//     });
//   } catch (error) {
//     console.error('❌ Erreur lors du démarrage du serveur:', error);
//     process.exit(1);
//   }
// };

// startServer();

// module.exports = { app, io };

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import database and models
const { syncDatabase } = require('./models');

const app = express();
const server = http.createServer(app);

// ✅ Liste des origines autorisées - UPDATED to include port 8081
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081", // Added this port
  "http://localhost:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081" // Added this port
];

// ✅ Configuration de Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ Middlewares sécurité & CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS bloqué pour l'origine :", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Limitation des requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ✅ Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Fichiers statiques (images) - Configuration CORS complète et debug amélioré
app.use('/uploads', (req, res, next) => {
  console.log(`📸 Image request: ${req.method} ${req.url}`);
  
  // Headers CORS pour les images
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📸 Preflight request handled for:', req.url);
    res.sendStatus(200);
    return;
  }
  
  next();
}, express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res, path) => {
    console.log(`📸 Serving static file: ${path}`);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Debug middleware pour vérifier les fichiers disponibles
app.get('/uploads/*', (req, res, next) => {
  const fs = require('fs');
  const requestedFile = path.join(__dirname, 'public', req.path);
  
  console.log(`📸 Checking file existence: ${requestedFile}`);
  
  fs.access(requestedFile, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`❌ File not found: ${requestedFile}`);
      return res.status(404).json({ 
        success: false, 
        error: 'File not found',
        requestedPath: req.path,
        fullPath: requestedFile
      });
    } else {
      console.log(`✅ File exists: ${requestedFile}`);
      next();
    }
  });
});

// ✅ Partage de socket.io avec toutes les routes
app.set('io', io);

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/purchase-requests', require('./routes/purchase_requests')); // Nouvelle route
app.use('/api/purchase-orders', require('./routes/purchase_orders'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/test', require('./routes/test')); // Route de test ajoutée

// ✅ Socket.IO
require('./api/socket')(io);

// ✅ Test API
app.get('/api', (req, res) => {
  res.json({ 
    success: true,
    message: 'Systemair API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      projects: '/api/projects',
      purchases: '/api/purchases',
      'purchase-requests': '/api/purchase-requests',
      'purchase-orders': '/api/purchase-orders',
      deliveries: '/api/deliveries',
      materials: '/api/materials',
      stocks: '/api/stocks',
      notifications: '/api/notifications',
      test: '/api/test'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Systemair API is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ Middleware erreur globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Erreur interne du serveur' 
  });
});

// ✅ Route 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route non trouvée' 
  });
});

// ✅ Démarrage serveur
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await syncDatabase();
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
      console.log(`🖼️ Images accessibles via http://localhost:${PORT}/uploads/<filename>`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };