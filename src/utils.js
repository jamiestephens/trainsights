import { fetchAllTrains } from "amtrak";
import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(__dirname, "trainData.json");
const DATA_EXPIRATION_MINUTES = 15;

const fetchAndStoreTrains = async () => {
  try {
    const currentTime = Date.now();
    let trainsData = null;

    if (fs.existsSync(DATA_FILE_PATH)) {
      const stats = fs.statSync(DATA_FILE_PATH);
      const lastModifiedTime = stats.mtimeMs;

      if (
        currentTime - lastModifiedTime <=
        DATA_EXPIRATION_MINUTES * 60 * 1000
      ) {
        // Data is not expired, read from file
        console.log("Accessing train data from the stored file.");
        trainsData = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      }
    }

    if (!trainsData) {
      // Data is expired or file doesn't exist, fetch and store new data
      console.log("Fetching train data from the API.");
      trainsData = await fetchAllTrains();
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(trainsData));
    }

    return trainsData;
  } catch (error) {
    console.error("Error fetching and storing trains data:", error);
    return null;
  }
};

export { fetchAndStoreTrains };
