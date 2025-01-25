const Property = require('../models/propertyModel'); // Make sure Property model is required

async function markPropertyAsRented() {
  const now = new Date();
  console.log(`Checking properties where rentDueDate <= ${now} and status is 'available'`);

  try {
    // Fetch and log all properties for debugging
    const properties = await Property.find({});
    //console.log('All properties in the database:', properties);

    // Your original query to update properties
    const propertiesToUpdate = await Property.find({
      rentDueDate: { $lte: now },
      availabilityStatus: 'Available',
    });

    //console.log('Properties to update:', propertiesToUpdate);

    if (propertiesToUpdate.length > 0) {
      // Perform update
      const updateResult = await Property.updateMany(
        { rentDueDate: { $lte: now }, availabilityStatus: 'Available' },
        { availabilityStatus: 'Rented Out' }
      );
      //console.log(`Marked ${updateResult.modifiedCount} properties as rented.`);
    } else {
      console.log('No properties found to update.');
    }

    return propertiesToUpdate;
  } catch (error) {
    console.error('Error updating property statuses:', error);
  }
}

module.exports = { markPropertyAsRented };
