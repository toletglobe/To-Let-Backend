const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
const Property = require("./models/propertyModel");
const dotenv = require("dotenv");

dotenv.config();

//Connection to db
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `MongoDB connected! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
connectDB();

//function to update the empty nearbylocations field

const readCSVAndUpdateDB = async (csvFilePath) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", async (row) => {
        const areaFromCSV = row.Area;
  
        const nearbyLocations = row.NeighbouringAreas.split(",").map((location) => location.trim());
  
        try {
          const property = await Property.findOne({ area: areaFromCSV });
  
          if (property) {
            await Property.updateOne(
              { area: areaFromCSV },
              { $set: { nearbyLocations: nearbyLocations } }
            );
            console.log(`Updated property with area: ${areaFromCSV}`);
          } else {
            console.log(`No property found with area: ${areaFromCSV}`);
          }
        } catch (error) {
          console.error("Error during update:", error);
        }
      })
      .on("end", () => {
        console.log("All rows processed and updates committed.");
      });
  };
  const csvFilePath = "./property.csv";
readCSVAndUpdateDB(csvFilePath);

