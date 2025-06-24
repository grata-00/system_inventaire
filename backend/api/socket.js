
module.exports = (io) => {
  console.log('🔗 Configuration Socket.IO initialisée');

  io.on('connection', (socket) => {
    console.log(`👤 Utilisateur connecté: ${socket.id}`);

    // Événement de déconnexion
    socket.on('disconnect', () => {
      console.log(`👤 Utilisateur déconnecté: ${socket.id}`);
    });

    // Rejoindre une room spécifique (par exemple pour les notifications par rôle)
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`👤 ${socket.id} a rejoint la room: ${room}`);
    });

    // Quitter une room
    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`👤 ${socket.id} a quitté la room: ${room}`);
    });

    // Événements personnalisés pour les mises à jour temps réel
    socket.on('inventory_update', (data) => {
      socket.broadcast.emit('inventory_updated', data);
    });

    socket.on('delivery_update', (data) => {
      socket.broadcast.emit('delivery_updated', data);
    });

    socket.on('purchase_request_update', (data) => {
      socket.broadcast.emit('purchase_request_updated', data);
    });
  });

  // Fonction utilitaire pour émettre des notifications globales
  const emitGlobalNotification = (event, data) => {
    io.emit(event, data);
  };

  // Fonction utilitaire pour émettre des notifications à un rôle spécifique
  const emitToRole = (role, event, data) => {
    io.to(role).emit(event, data);
  };

  return {
    emitGlobalNotification,
    emitToRole
  };
};
