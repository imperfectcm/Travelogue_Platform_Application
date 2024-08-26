import { nationArray } from "../countries";
import vision from "@google-cloud/vision";

export async function photoRecognition(fileName: string) {
  // Performs landmark detection on the local file
  const client = new vision.ImageAnnotatorClient({
    keyFilename: "./unique-serenity-424107-g2-a6259afebf5c.json",
  });

  try {
    const landmarkDetectionresult = await client.landmarkDetection(fileName);
    if (landmarkDetectionresult[0].landmarkAnnotations.length === 0) {
      return false;
    } else {
      const latLng =
        landmarkDetectionresult[0].landmarkAnnotations[0].locations[0];

      let landMarkName: string =
        landmarkDetectionresult[0].landmarkAnnotations[0].description;

      let lat = latLng.latLng?.latitude;
      let lng = latLng.latLng?.longitude;

      let address = await getAddressByLatLng(lat, lng);

      return { address, landMarkName };
    }
  } catch (error) {
    return error;
  }
}

export async function getCountryNamefromAddress(address: string) {
  if (typeof address === "string") {
    const addressWordArray: string[] = address.split(", ");
    console.log("words", addressWordArray);

    for (let nation of nationArray) {
      for (let addressWord of addressWordArray) {
        if (addressWord == nation) {
          console.log("word", addressWord);
          return nation;
        }
      }
    }
  } else {
    return false;
  }
}

export async function getAddressByLatLng(lat: any, lng: any) {
  const googleMapsClient = require("@google/maps").createClient({
    key: process.env.GOOGLE_MAPS_API_KEY,
    Promise: Promise, // Use native Promises
  });

  try {
    const response = await googleMapsClient
      .reverseGeocode({ latlng: { lat, lng } })
      .asPromise();
    const result = response.json.results[0];
    const address = result.formatted_address;

    return address;
  } catch (error) {
    console.log("Error from getCountryNamebyLatLng:", error);
    return;
  }
}
