const Machine = require('../models/Machine');

module.exports = (io) => {
  const changeStream = Machine.watch();

  changeStream.on('change', (change) => {
    // You can filter here for only "update" or "insert"
    if (change.operationType === 'update') {
    const updatedFields = change.updateDescription.updatedFields;

      // Check if 'assignedTo' was updated
      if ('assignedTo' in updatedFields) {
        const newAssignedTo = updatedFields.assignedTo;

        // Only emit if new value is not null/empty
        if (newAssignedTo !== null && newAssignedTo !== '') {
          io.emit('machine-assigned', {
            machineId: change.documentKey._id,
            assignedTo: newAssignedTo
          });
          console.log(`Machine assigned to ${newAssignedTo}, notification emitted.`);
        }
      }
    }
  });
};