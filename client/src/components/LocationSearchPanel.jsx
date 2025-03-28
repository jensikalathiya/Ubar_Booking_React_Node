import { useContext } from "react";
import { LocationContext } from "../context/LocationContext";

const LocationSearchPanel = ({
  suggestions,
  setPickup,
  setDestination,
  activeField,
}) => {
  const { setDestinationLocation, setPickupLocation } =
    useContext(LocationContext);

  const handleSuggestionClick = (suggestion) => {
    if (activeField === "pickup") {
      setPickup(suggestion);
      setPickupLocation(suggestion);
    } else if (activeField === "destination") {
      setDestination(suggestion);
      setDestinationLocation(suggestion);
    }
    // setVehiclePanel(true)
    // setPanelOpen(false)
  };

  return (
    <div>
      {/* Display fetched suggestions */}
      {suggestions.map((elem, idx) => (
        <div
          key={idx}
          onClick={() => handleSuggestionClick(elem)}
          className="flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start"
        >
          <h2 className="bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full">
            <i className="ri-map-pin-fill"></i>
          </h2>
          <h4 className="font-medium">{elem.name}</h4>
        </div>
      ))}
    </div>
  );
};

export default LocationSearchPanel;
