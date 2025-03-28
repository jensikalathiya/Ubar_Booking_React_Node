const axios = require("axios");
const captainModel = require("../models/captain.model");

module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return {
        ltd: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No routes found");
      }

      return response.data.rows[0].elements[0];
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("Query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    // console.log("Autocomplete API Response:", response.data); // Log the full response

    if (response.data.status === "OK") {
      const placeDetailsPromises = response.data.predictions.map(
        async (prediction) => {
          // Fetch details for each prediction
          const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${prediction.place_id}&key=${apiKey}`;
          const detailsResponse = await axios.get(placeDetailsUrl);

          if (detailsResponse.data.status === "OK") {
            const placeDetails = detailsResponse.data.result;
            const location = {
              name: prediction.description,
              lat: placeDetails.geometry.location.lat,
              lng: placeDetails.geometry.location.lng,
            };
            return location;
          } else {
            throw new Error("Unable to fetch place details");
          }
        }
      );

      // Resolve all promises
      const locations = await Promise.all(placeDetailsPromises);
      return locations.filter((location) => location); // Filter out null/undefined locations
    } else {
      throw new Error(`Unable to fetch suggestions: ${response.data.status}`);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
  const captains = await captainModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[ltd, lng], radius / 6371],
      },
    },
  });

  return captains;
};
