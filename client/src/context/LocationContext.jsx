import React, { createContext, useState } from "react";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);

  return (
    <LocationContext.Provider
      value={{ destinationLocation, setDestinationLocation, pickupLocation, setPickupLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};