const Bin = require('../models/Bin');
const userSocketMap = {};

exports.handleJoin = (socket) => {
  socket.on("join", ({ userId }) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });
};


// Listen for changes in the Machine collection
exports.watchChanges=() => {
  const changeStream = Bin.watch();

  changeStream.on('change',async (change) => {
    // You can filter here for only "update" or "insert"
    if (change.operationType === 'update') {
    const updatedFields = change.updateDescription.updatedFields;

      // Check if 'assignedTo' was updated
      if ('collectorId' in updatedFields) {
        const newAssignedCollector = updatedFields.collectorId;

        const changedBinId = change.documentKey._id;
        const bin = await Bin.findById(changedBinId, { locationName: 1, _id: 0 });
        console.log("Location Name:", bin ? bin.locationName : "Bin not found");
        
        
        // Only emit if new value is not null/empty
        if (newAssignedCollector !== null && newAssignedCollector !== '') {
          const socketId = userSocketMap[newAssignedCollector];
          if(global._io, socketId) {
            global._io.to(socketId).emit('bin-assigned', {
                binId: changedBinId,
                locationName: bin.locationName,            
            });
        }

      }
      }
    }
  });

}



exports.handleDisconnect = (socket) => {
  socket.on("disconnect", () => {
    for (const [userId, sid] of Object.entries(userSocketMap)) {
      if (sid === socket.id) {
        delete userSocketMap[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
};

exports.getSocketIdByUserId = (userId) => {
  return userSocketMap[userId];
};























// module.exports = (io) => {
  

//   io.on("connection", (socket) => {
//     console.log('Socket connected:', socket.id);

//     socket.on("joinCollector", ({ userId }) => {
//       console.log("Collector joined:", userId);
      
//       socket.emit("welcome", {
//         message: `Welcome collector ${userId}!`,
//       });
      
//     });
  
//   });
  
//   io.on("disconnect", () => {
//     console.log('Socket disconnected:', socket.id);
//   });

// }


//.to(collectorUserId)