import { useState, useEffect } from "react";
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  LoadScript,
} from "@react-google-maps/api";
import axios from "axios"; // Make sure to import axios
import { useNavigate } from "react-router-dom"; // Import useNavigate if you're using react-router

import pin from "../assets/pin.png";
import location from "../assets/location.png";
import Car from "../assets/Car.png";
import Bike from "../assets/Bike.png";
import Auto from "../assets/Auto.png";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const LiveTracking = ({ ride, pickupLocation, destinationLocation }) => {
  const [map, setMap] = useState(null);
  const [directionRoutePoints, setDirectionRoutePoints] = useState(null);
  let source = pickupLocation;
  const destination = destinationLocation;
  const [center, setCenter] = useState({
    lat: source?.lat || 21.2266205,
    lng: source?.lng || 72.8312383,
  });
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0); // State for vehicle rotation
  const navigate = useNavigate();

  // Haversine distance function
  const haversineDistance = (coords1, coords2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const lat1 = coords1.lat;
    const lon1 = coords1.lng;
    const lat2 = coords2.lat;
    const lon2 = coords2.lng;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  };

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
          // Check if overview_path exists and is an array
          if (result.routes[0]?.overview_path && Array.isArray(result.routes[0].overview_path)) {
            startVehicleTracking(result.routes[0].overview_path);
          } else {
            console.error("No valid overview_path found in directions result.");
          }
          setLoading(false);
        } else {
          console.error("Error fetching directions:", status);
          setLoading(false);
        }
      }
    );
  };
  
  const startVehicleTracking = (path) => {
    if (!path || !Array.isArray(path) || path.length === 0) {
      console.error("Invalid path provided to startVehicleTracking.");
      return; // Exit if path is invalid
    }
  
    let index = 0;
    const interval = setInterval(() => {
      if (index < path.length) {
        const currentLocation = {
          lat: path[index].lat(),
          lng: path[index].lng(),
        };
        setVehicleLocation(currentLocation);
        source = currentLocation;
  
        // Calculate the next location for heading
        if (index < path.length - 1) {
          const nextLocation = {
            lat: path[index + 1].lat(),
            lng: path[index + 1].lng(),
          };
          const heading = window.google.maps.geometry.spherical.computeHeading(
            new window.google.maps.LatLng(
              currentLocation.lat,
              currentLocation.lng
            ),
            new window.google.maps.LatLng(nextLocation.lat, nextLocation.lng)
          );
          setRotation(heading);
        }
  
        // Pan the map to the vehicle's current location
        if (map) {
          map.panTo(currentLocation);
        }
  
        // Check if the vehicle has reached the destination
        if (haversineDistance(currentLocation, destination) < 0.1) {
          clearInterval(interval);
          endRide();
        }
  
        index++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
  
    return interval; // Return the interval ID for cleanup
  };

  const endRide = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
        {
          rideId: ride._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        navigate("/captain-home");
      }
    } catch (error) {
      console.error("Error ending ride:", error);
    }
  };

  useEffect(() => {
    let interval;
    if (isApiLoaded && source && destination && map) {
      directionRoute();
      interval = startVehicleTracking(
        directionRoutePoints?.routes[0]?.overview_path
      );
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isApiLoaded, source, destination, map]);



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
              url: pin,
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}

        {isApiLoaded && destination?.lat && destination?.lng && (
          <MarkerF
            position={{ lat: destination.lat, lng: destination.lng }}
            icon={{
              url: location,
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}

        {isApiLoaded && ride && vehicleLocation && (
          <MarkerF
            position={vehicleLocation}
            icon={{
              url:
                ride?.vehicleType === "car"
                  ? Car
                  : ride.vehicleType === "moto"
                  ? Bike
                  : ride.vehicleType === "auto"
                  ? Auto
                  : Car,
              scaledSize: new window.google.maps.Size(40, 40),
              rotation: rotation,
            }}
          />
        )}
        {directionRoutePoints && (
          <DirectionsRenderer
            directions={directionRoutePoints}
            options={{
              suppressMarkers: true, // Removes the default "A" and "B" markers
              polylineOptions: {
                strokeColor: "black", // Change color to black
                strokeOpacity: 1.0,
                strokeWeight: 2,
              },
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveTracking;
