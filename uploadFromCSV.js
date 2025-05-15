const mongoose = require("mongoose");
const csvtojson = require("csvtojson");
const Property = require("./models/propertyModel"); // Assuming the Property model is in 'models/Property'
const dotenv = require("dotenv");

dotenv.config();
let pincodeData = [];
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
const loadPincodeData = async () => {
  pincodeData = await csvtojson().fromFile("pincode_data.csv");
  console.log("Pincode data loaded successfully");
};

connectDB()
  .then(() => {
    console.log("Ready to process CSV and upload to MongoDB");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

const convertToJson = async () => {
  const jsonArray = await csvtojson().fromFile("./properties.csv");
  return jsonArray;
};
const getPincode = (city, locality) => {
  const result = pincodeData.find(
    (entry) => entry.city === city && entry.locality === locality
  );
  return result ? result.pincode : null;
};
(async () => {
  try {
    const jsonArray = await convertToJson();

    // Process the jsonArray
    const properties = await Promise.all(
      jsonArray.map(async (item) => {
        item = {
          ...item,
          pincode: Number(item.pincode),
          images:
            item.images !== "NA"
              ? item.images
                  .split(/[,\s]+/)
                  .map((url) => {
                    url = url.trim();
                    console.log("Processing URL:", url); // Debug log
                    const match = url.match(
                      /(?:open\?id=|id=|\/d\/)([a-zA-Z0-9_-]+)/
                    );
                    console.log("Match result:", match); // Debug log
                    if (match) {
                      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=s4000`;
                    } else {
                      console.log("No match found for URL:", url); // Debug log
                      return url;
                    }
                  })
                  .filter(Boolean) // Remove any empty strings
              : [
                  "https://res.cloudinary.com/dxhgvsse5/image/upload/v1738442372/defaultHouse_mtutmq.jpg",
                ],
          videos:
            item.videos !== "NA"
              ? item.videos
                  .split(/[,\s]+/)
                  .map((url) => {
                    url = url.trim();
                    console.log("Processing URL:", url); // Debug log
                    const match = url.match(
                      /(?:open\?id=|id=|\/d\/)([a-zA-Z0-9_-]+)/
                    );
                    console.log("Match result:", match); // Debug log
                    if (match) {
                      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=4000`;
                    } else {
                      console.log("No match found for URL:", url); // Debug log
                      return url;
                    }
                  })
                  .filter(Boolean) // Remove any empty strings
              : [],
          appliances:
            item.appliances !== "NA"
              ? item.appliances.split(",").map((s) => s.trim())
              : [],
          amenities:
            item.amenities !== "NA"
              ? item.amenities.split(",").map((s) => s.trim())
              : [],
        };

        // console.log(item);

        const formattedRent = isNaN(Number(item.rent))
          ? "NA"
          : Number(item.rent);
        const formattedSecurity = isNaN(Number(item.security))
          ? "NA"
          : Number(item.security);
        const formattedBhk = isNaN(Number(item.bhk)) ? "NA" : Number(item.bhk);
        const formattedSquareFeetArea = isNaN(Number(item.squareFeetArea))
          ? "NA"
          : Number(item.squareFeetArea);

        // Create property data object
        const data = {
          userId: "000000000000000000000000",
          firstName: item.firstName,
          lastName: item.lastName,
          ownersContactNumber: item.ownersContactNumber,
          ownersAlternateContactNumber: item.ownersAlternateContactNumber,
          pincode: item.pincode,
          city: item.city,
          locality: item.locality,
          area: item.area,
          address: item.address,
          spaceType: item.spaceType,
          propertyType: item.propertyType,
          // petsAllowed: "NA",
          preference: item.preference,
          bachelors: item.bachelors,
          type: item.type,
          bhk: formattedBhk,
          floor: item.floor,
          nearestLandmark: item.nearestLandmark,
          typeOfWashroom: item.typeOfWashroom,
          // coolingFacility: item.coolingFacility,
          // carParking: item.carParking,
          rent: formattedRent,
          security: formattedSecurity,
          images: item.images,
          videos: item.videos,
          squareFeetArea: formattedSquareFeetArea,
          // locationLink: "NA",
          latitude: 26.8467,
          longitude: 80.9462,
          appliances: item.appliances,
          amenities: item.amenities,
          // addressVerification: item.addressVerification,
          // availabilityStatus: item.availabilityStatus,
          availabilityStatus: "Rented Out",
          aboutTheProperty: item.aboutTheProperty,
        };

        // console.log(data);

        // Save property to the database
        const property = await Property.create(data);
        console.log("Property created");

        // return property;
      })
    );

    console.log(`${properties.length} properties created successfully.`);
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
