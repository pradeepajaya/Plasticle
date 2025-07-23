const Bin = require('../models/Bin');
const Collector = require('../models/Collector');

// Listen for changes in the Machine collection
exports.watchChanges=() => {
  const changeStream = Bin.watch();

  changeStream.on('change', (change) => {
    // You can filter here for only "update" or "insert"
    if (change.operationType === 'update') {
    const updatedFields = change.updateDescription.updatedFields;

      // Check if 'assignedTo' was updated
      if ('collectorId' in updatedFields) {
        const newAssignedCollector = updatedFields.collectorId;

        const changedBinId = change.documentKey._id;
        //const changedBinId = change.documentKey.binId; 

        // const bin = (async (changedBinId) => {
        //   const bin = await Bin.findOne({ binId: changedBinId }, { locationName: 1, _id: 0 });
        //   console.log("Location Name:", bin.locationName);
        //   return bin;
        // })(changedBinId);


        async function getBinById(changedBinId) {
        const bin = await Bin.findOne({ binId: changedBinId }, { locationName: 1, _id: 0 });
  
          if (bin) {
            console.log("Location Name:", bin.locationName);
          } else {
            console.log("Bin not found");
          }

          return bin;
        }
        const bin = await getBinById(changedBinId);

        


        // const collectorUserId = (async (newAssignedCollector) => {
        //   const collectorUser = await Collector.findOne({ _id: newAssignedCollector }, { userId: 1, _id: 0 });
        //   console.log("Location Name:", collectorUser.userId);
        //   return collectorUser.userId;
        // })();
        
          
        // Only emit if new value is not null/empty
        if (newAssignedCollector !== null && newAssignedCollector !== '') {
         if(global._io) {
            global._io.emit('bin-assigned', {
                binId: changedBinId,
                locationName: bin.locationName,            
            });
        }
          //console.log(`Bin assigned to ${collectorUserId}, notification emitted.`);
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


//.to(collectorUserId)