const socketController = require('../controllers/socketCon');

module.exports = (io) => {
  
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    // socket.on("joinCollector", ({ userId }) => {
    // console.log("Collector joined:", userId); })
    // userSocketMap[userId] = socket.id;
    //socketController.handleJoin(socket);
    socketController.watchChanges(socket);
    //socketController.handleDisconnect(socket);
   

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });

    
  });
  global._io = io;
}