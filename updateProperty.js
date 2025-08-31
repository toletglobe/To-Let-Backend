const mongoose = require("mongoose");
const csvtojson = require("csvtojson");
const Property = require("./models/propertyModel");
const dotenv = require("dotenv");

dotenv.config();

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

connectDB()
  .then(() => {
    console.log("Ready to process CSV and update properties in MongoDB");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

const convertToJson = async () => {
  const jsonArray = await csvtojson().fromFile("./propertiesWithOwnerLoc.csv");
  return jsonArray;
};

// Function to map CSV owner residence values to database enum values
const mapOwnerResidenceToEnum = (csvValue) => {
  if (!csvValue) return null;

  const value = csvValue.toLowerCase().trim();

  if (value.includes("same property")) {
    return "Lives in same property";
  } else if (value.includes("different property")) {
    return "Lives in different property";
  } else if (value.includes("different city")) {
    return "Lives in different city";
  }

  return null;
};

const updateProperties = async () => {
  try {
    const csvData = await convertToJson();
    console.log(`Loaded ${csvData.length} records from CSV`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;

    for (const record of csvData) {
      const firstName = record["First Name"]?.trim();
      const lastName = record["Last Name"]?.trim();
      const ownerResidence = record["Owner Current residence"]?.trim();

      // Skip if no first name or owner residence data
      if (!firstName || !ownerResidence) {
        skippedCount++;
        continue;
      }

      // Map the CSV value to database enum value
      const mappedOwnerLocation = mapOwnerResidenceToEnum(ownerResidence);

      if (!mappedOwnerLocation) {
        console.log(
          `Skipping record with unmapped owner residence: "${ownerResidence}"`
        );
        skippedCount++;
        continue;
      }

      // Build query for matching properties
      let query = { firstName: firstName };

      // Add lastName to query if it exists and is not "NA"
      if (lastName && lastName !== "NA") {
        query.lastName = lastName;
      }

      // Find properties matching the firstname + lastname combination
      const properties = await Property.find(query);

      if (properties.length === 0) {
        console.log(`No properties found for: ${firstName} ${lastName || ""}`);
        notFoundCount++;
        continue;
      }

      // Update all matching properties
      const updateResult = await Property.updateMany(query, {
        ownerLocation: mappedOwnerLocation,
      });

      updatedCount += updateResult.modifiedCount;
      console.log(
        `Updated ${updateResult.modifiedCount} properties for: ${firstName} ${
          lastName || ""
        } -> ${mappedOwnerLocation}`
      );
    }

    console.log("\n=== Update Summary ===");
    console.log(`Total CSV records processed: ${csvData.length}`);
    console.log(`Properties updated: ${updatedCount}`);
    console.log(`Properties not found: ${notFoundCount}`);
    console.log(`Records skipped: ${skippedCount}`);
  } catch (error) {
    console.error("Error updating properties:", error);
  }
};

(async () => {
  try {
    await updateProperties();
  } catch (error) {
    console.error("Error processing CSV:", error);
  } finally {
    // Close the database connection
    try {
      await mongoose.connection.close();
      console.log("Database connection closed successfully.");
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  }
})();
