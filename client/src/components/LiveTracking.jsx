import { useState, useEffect } from "react";
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  LoadScript,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const LiveTracking = ({ pickupLocation, destinationLocation }) => {
  const source = pickupLocation;
  const destination = destinationLocation;

  const [center, setCenter] = useState({
    lat: source?.lat || 21.2266205,
    lng: source?.lng || 72.8312383,
  });
  const [map, setMap] = useState(null);
  const [directionRoutePoints, setDirectionRoutePoints] = useState(null);
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    if (source?.lat && source?.lng && map) {
      map.panTo({ lat: source.lat, lng: source.lng });
      setCenter({ lat: source.lat, lng: source.lng });
    }
  }, [source, map]);

  useEffect(() => {
    if (destination?.lat && destination?.lng && map) {
      setCenter({ lat: destination.lat, lng: destination.lng });
    }
  }, [destination, map]);

  useEffect(() => {
    if (isApiLoaded && source && destination && map) {
      directionRoute();
    }
  }, [isApiLoaded, source, destination, map]);

  const directionRoute = () => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded yet.");
      return;
    }

    const DirectionsService = new window.google.maps.DirectionsService();
    DirectionsService.route(
      {
        origin: { lat: source.lat, lng: source.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: window.google?.maps?.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google?.maps?.DirectionsStatus.OK) {
          setDirectionRoutePoints(result);
          startVehicleTracking(result.routes[0].overview_path);
        } else {
          console.error("Error fetching directions:", status);
        }
      }
    );
  };

  const startVehicleTracking = (path) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < path.length) {
        setVehicleLocation({ lat: path[index].lat(), lng: path[index].lng() });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <LoadScript
      googleMapsApiKey={"AIzaSyAy1EmmZYXtEjbDPvV7gIW0Qs2oD6WKi2o"} // Replace with your actual API key
      onLoad={() => setIsApiLoaded(true)}
      onError={() => console.error("Error loading Google Maps API")}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={(map) => setMap(map)}
        options={{ mapId: "4113717585f11867", mapTypeId: "terrain" }}
      >
        {isApiLoaded && source?.lat && source?.lng && (
          <MarkerF
            position={{ lat: source.lat, lng: source.lng }}
            icon={{
              url: "/source.png",
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}

        {isApiLoaded && destination?.lat && destination?.lng && (
          <MarkerF
            position={{ lat: destination.lat, lng: destination.lng }}
            icon={{
              url: "/dest.png",
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}

        {isApiLoaded && vehicleLocation && (
          <MarkerF
            position={vehicleLocation}
            icon={{
              url: "/car.png",
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}
        {directionRoutePoints && (
          <DirectionsRenderer directions={directionRoutePoints} />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveTracking;
