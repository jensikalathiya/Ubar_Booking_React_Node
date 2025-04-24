import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  LoadScript,
  OverlayView,
} from "@react-google-maps/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [directionRoutePoints, setDirectionRoutePoints] = useState(null);
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const userInteractedRef = useRef(false);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    map.addListener("dragstart", () => {
      userInteractedRef.current = true;
    });
    map.addListener("zoom_changed", () => {
      userInteractedRef.current = true;
    });
  }, []);

  // Fetch the initial route
  useEffect(() => {
    if (
      isApiLoaded &&
      pickupLocation &&
      destinationLocation &&
      !directionRoutePoints
    ) {
      directionRoute(pickupLocation, destinationLocation);
    }
  }, [isApiLoaded, pickupLocation, destinationLocation, directionRoutePoints]);

  // Update route when vehicle moves significantly
  useEffect(() => {
    if (vehicleLocation && destinationLocation) {
      if (haversineDistance(vehicleLocation, destinationLocation) > 0.05) {
        updateVehicleRoute(vehicleLocation, destinationLocation);
      }
    }
  }, [vehicleLocation, destinationLocation]);

  // Compute and set route directions
  const directionRoute = useCallback((origin, destination) => {
    if (!window.google || !window.google.maps) return;

    const DirectionsService = new window.google.maps.DirectionsService();
    DirectionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionRoutePoints(result);
          if (result.routes[0]?.overview_path) {
            startVehicleTracking(result.routes[0].overview_path);
          }
        }
      }
    );
  }, []);

  // Update route only if vehicle moves significantly
  const updateVehicleRoute = useCallback((currentLocation, destination) => {
    if (!window.google || !window.google.maps) return;

    const DirectionsService = new window.google.maps.DirectionsService();
    DirectionsService.route(
      {
        origin: currentLocation,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionRoutePoints(result);
        }
      }
    );
  }, []);

  // Move vehicle along the route
  const startVehicleTracking = useCallback(
    (path) => {
      if (!path || path.length === 0) return;

      let index = 0;
      const interval = setInterval(() => {
        if (index < path.length) {
          const newLocation = {
            lat: path[index].lat(),
            lng: path[index].lng(),
          };

          setVehicleLocation((prev) => {
            if (
              prev?.lat === newLocation.lat &&
              prev?.lng === newLocation.lng
            ) {
              return prev;
            }
            return newLocation;
          });

          if (index < path.length - 1) {
            const nextLocation = {
              lat: path[index + 1].lat(),
              lng: path[index + 1].lng(),
            };
            const heading =
              window.google?.maps?.geometry?.spherical?.computeHeading(
                new window.google.maps.LatLng(newLocation.lat, newLocation.lng),
                new window.google.maps.LatLng(
                  nextLocation.lat,
                  nextLocation.lng
                )
              );
            setRotation(heading);
          }

          // if (!userInteractedRef.current && mapRef.current) {
          //   mapRef.current.panTo(newLocation);
          // }

          if (haversineDistance(newLocation, destinationLocation) < 0.1) {
            clearInterval(interval);
            endRide();
          }

          index++;
        } else {
          clearInterval(interval);
        }
      }, 2000);
    },
    [destinationLocation]
  );

  // Calculate distance between two coordinates
  const haversineDistance = (coords1, coords2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coords1.lat)) *
        Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // End ride API call
  const endRide = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
        { rideId: ride._id },
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

  return (
    <LoadScript
      googleMapsApiKey={"AIzaSyAS8JYpv6qUnBV80q0LHtCqgSUH_40BJbM"}
      onLoad={() => setIsApiLoaded(true)}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={pickupLocation || { lat: 21.2266205, lng: 72.8312383 }}
        zoom={13}
        onLoad={handleMapLoad}
      >
        {isApiLoaded && pickupLocation?.lat && pickupLocation?.lng && (
          <MarkerF
            position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
            icon={{
              url: pin,
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}

        {isApiLoaded &&
          destinationLocation?.lat &&
          destinationLocation?.lng && (
            <MarkerF
              position={{
                lat: destinationLocation.lat,
                lng: destinationLocation.lng,
              }}
              icon={{
                url: location,
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            />
          )}

        {ride && vehicleLocation && (
          <OverlayView
            position={vehicleLocation}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`, // Center and rotate the image
                width: "40px",
                height: "40px",
                position: "absolute", // Ensures it aligns correctly
              }}
            >
              <img
                src={
                  ride?.vehicleType === "car"
                    ? Car
                    : ride.vehicleType === "moto"
                    ? Bike
                    : ride.vehicleType === "auto"
                    ? Auto
                    : Car
                }
                alt="Vehicle"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </OverlayView>
        )}

        {useMemo(
          () =>
            directionRoutePoints && (
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
            ),
          [directionRoutePoints]
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveTracking;
