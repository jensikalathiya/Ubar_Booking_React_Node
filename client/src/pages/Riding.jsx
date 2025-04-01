import { Link, useLocation } from "react-router-dom"; // Added useLocation
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import LiveTracking from "../components/LiveTracking";

const Riding = () => {
  const location = useLocation();
  const { ride } = location.state || {}; // Retrieve ride data
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  socket.on("ride-ended", () => {
    navigate("/home");
  });

  return (
    <div className="h-screen">
      <Link
        to="/home"
        className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full"
      >
        <i className="text-lg font-medium ri-home-5-line"></i>
      </Link>
      <div className="h-1/2">
        <LiveTracking
          ride={ride}
          pickupLocation={ride.pickup}
          destinationLocation={ride.destination}
        />
      </div>
      <div className="h-1/2 p-4">
        <div className="flex items-center justify-between">
          {ride?.vehicleType === "car" ? (
            <img
              className="h-20"
              src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
              alt=""
            />
          ) : ride?.vehicleType === "moto" ? (
            <img
              className="h-20"
              src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png"
              alt=""
            />
          ) : ride?.vehicleType === "auto" ? (
            <img
              className="h-20"
              src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
              alt=""
            />
          ) : (
            <img
              className="h-20"
              src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
              alt=""
            />
          )}
          <div className="text-right">
            <h2 className="text-lg font-medium capitalize">
              {ride?.captain?.fullname?.firstname}
            </h2>
            <h4 className="text-xl font-semibold -mt-1 -mb-1">
              {ride?.captain.vehicle.plate}
            </h4>
            <p className="text-sm text-gray-600">
              {ride?.vehicleType === "car" ? (
                <span>Car</span>
              ) : ride?.vehicleType === "moto" ? (
                <span>Bike</span>
              ) : ride?.vehicleType === "auto" ? (
                <span>Auto</span>
              ) : (
                <span>Car</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-between flex-col items-center">
          <div className="w-full mt-5">
            <div className="flex items-center gap-5 p-3 border-b-2">
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className="text-lg font-medium">Drop Off Location</h3>
                <p className="text-sm -mt-1 text-gray-600">
                  {ride?.destination?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 p-3">
              <i className="ri-currency-line"></i>
              <div>
                <h3 className="text-lg font-medium">₹{ride?.fare} </h3>
                <p className="text-sm -mt-1 text-gray-600">Cash Cash</p>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg">
          Make a Payment
        </button>
      </div>
    </div>
  );
};

export default Riding;
