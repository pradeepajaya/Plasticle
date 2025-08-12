const Bin = require('../models/Bin');
const Collector = require('../models/Collector');
const TaskHandler = require('../models/TaskHandler');
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
        const bin = await Bin.findById(changedBinId, { location: 1, locationName:1, collectorId:1, _id: 0 });
        console.log("Location Name:", bin ? bin.location : "Bin not found");
        

        
        const newAssignedCollector = bin.collectorId;
                  

        

        // Only emit if new value is not null/empty
        if (newAssignedCollector !== null && newAssignedCollector !== '' && newAssignedCollector !== undefined) {
          const newAssignedCollectorId = newAssignedCollector.toString();
          const collectorId = await Collector.findById(newAssignedCollectorId).select('userId');
          
          const collectorUserId = collectorId?.userId?.toString();
          console.log("New assigned collector:", collectorUserId);
          const socketId = userSocketMap[collectorUserId];
          //console.log("Socket ID for collector:", socketId);

          if(global._io && socketId) {
            global._io.to(socketId).emit('bin-assigned', {
              binId: changedBinId,
              location: bin.location || bin.locationName,            
            });
            //console.log(bin.location)
            console.log(`Notification emitted for ${collectorUserId} with ${socketId}`)
          }

        }else{
          const TaskHandlerDoc = await  TaskHandler.findOne({ assignedBins: changedBinId });
          const taskHandlerId =TaskHandlerDoc.userId.toString();
          const socketId = userSocketMap[taskHandlerId];
          console.log(taskHandlerId)
          if(global._io && socketId) {
            global._io.to(socketId).emit('bin-assigned', {
              binId: changedBinId,
              location: bin.location || bin.locationName,            
            });
            
            console.log(`Notification emitted for ${taskHandlerId} with ${socketId}`)
          }


        }
      }
    } // Optional delay to ensure all updates are processed
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

  socket.on("bin-rejected", async ({ userId, binId }) => {
    try {
      await Bin.findByIdAndUpdate(binId, {
        $unset: { collectorId: "" },
        status: "full",
      });
      console.log(`Collector ${userId} rejected bin ${binId}`);
    } catch (error) {
      console.error("Error resetting rejected bin:", error);
    }
  });


}
























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