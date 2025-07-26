const Bin = require('../models/Bin');
const Collector = require('../models/Collector');
const userSocketMap = {};




// Listen for changes in the Machine collection
exports.watchChanges=(socket) => {
  
  socket.on("joinCollector", ({ userId }) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });
  
  
  const changeStream = Bin.watch();
  changeStream.on('change',async (change) => {
    // You can filter here for only "update" or "insert"
    if (change.operationType === 'update') {
    const updatedFields = change.updateDescription.updatedFields;
      console.log("Change detected in Bin collection:", change);
      // Check if 'assignedTo' was updated
      if ('status' in updatedFields && updatedFields.status === 'assigned') {
        //const newAssignedCollector = updatedFields.collectorId;

        const changedBinId = change.documentKey._id;
        const bin = await Bin.findById(changedBinId, { locationName: 1, collectorId:1, _id: 0 });
        console.log("Location Name:", bin ? bin.locationName : "Bin not found");
        
        const newAssignedCollector = bin.collectorId.toString();
        const collectorId = await Collector.findById(newAssignedCollector).select('userId');
        const collectorUserId = collectorId?.userId?.toString();
        console.log("New assigned collector:", collectorUserId);

        // Only emit if new value is not null/empty
        if (newAssignedCollector !== null && newAssignedCollector !== '') {
          //userSocketMap[userId] = socket.id;
          console.log("User socket map:", userSocketMap);
          const socketId = userSocketMap[collectorUserId];
          console.log("Socket ID for collector:", socketId);
          if(global._io && socketId) {
            global._io.to(socketId).emit('bin-assigned', {
                binId: changedBinId,
                locationName: bin.locationName,            
            });
        }

      }
      }
    }
  });


  socket.on("disconnect", () => {
    for (const [userId, sid] of Object.entries(userSocketMap)) {
      if (sid === socket.id) {
        delete userSocketMap[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });











}

exports.handleJoin = (socket) => {
  
};

exports.handleDisconnect = (socket) => {
  
};

// exports.getSocketIdByUserId = (userId) => {
//   return userSocketMap[userId];
// };























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