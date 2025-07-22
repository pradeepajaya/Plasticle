const Bin = require('../models/Bin');

// Listen for changes in the Machine collection
exports.watchChanges=() => {
  const changeStream = Bin.watch();

  changeStream.on('change', (change) => {
    // You can filter here for only "update" or "insert"
    if (change.operationType === 'update') {
    const updatedFields = change.updateDescription.updatedFields;

      // Check if 'assignedTo' was updated
      if ('collectorId' in updatedFields) {
        const newAssignedTo = updatedFields.collectorId;

        // Only emit if new value is not null/empty
        if (newAssignedTo !== null && newAssignedTo !== '') {
         if(global._io) {
            global._io.emit('machine-assigned', {
                binId: change.documentKey._id,
                assignedTo: newAssignedTo,
            
            });
        }
          console.log(`Bin assigned to ${newAssignedTo}, notification emitted.`);
        }
      }
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
