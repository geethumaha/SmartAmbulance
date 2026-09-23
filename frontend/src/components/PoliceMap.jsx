import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});


// Default Vijayawada location
const defaultLocation = [
  16.5062,
  80.6480
];


// Component to automatically move the map
// when ambulance locations change
function MapUpdater({ trips }) {

  const map = useMap();

  if (trips.length > 0) {

    const firstTrip = trips[0];

    const latitude =
      firstTrip.currentLocation?.latitude;

    const longitude =
      firstTrip.currentLocation?.longitude;

    if (
      latitude !== undefined &&
      longitude !== undefined
    ) {

      map.setView(
        [latitude, longitude],
        15
      );

    }

  }

  return null;
}


// Main Police Map
function PoliceMap({ trips }) {

  const firstTrip = trips[0];

  const initialCenter =
    firstTrip?.currentLocation?.latitude !== undefined &&
    firstTrip?.currentLocation?.longitude !== undefined
      ? [
          firstTrip.currentLocation.latitude,
          firstTrip.currentLocation.longitude
        ]
      : defaultLocation;


  return (

    <div
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "12px",
        overflow: "hidden"
      }}
    >

      <MapContainer
        center={initialCenter}
        zoom={13}
        style={{
          width: "100%",
          height: "100%"
        }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <MapUpdater
          trips={trips}
        />


        {trips.map((trip) => {

          const latitude =
            trip.currentLocation?.latitude;

          const longitude =
            trip.currentLocation?.longitude;


          if (
            latitude === undefined ||
            longitude === undefined
          ) {
            return null;
          }


          return (

            <Marker
              key={trip._id}
              position={[
                latitude,
                longitude
              ]}
            >

              <Popup>

                <div>

                  <h3
                    style={{
                      marginTop: 0,
                      color: "#1e3a5f"
                    }}
                  >
                    🚑 {trip.ambulanceId}
                  </h3>


                  <p>
                    <strong>
                      Priority:
                    </strong>{" "}
                    {trip.priority}
                  </p>


                  <p>
                    <strong>
                      Hospital:
                    </strong>{" "}
                    {trip.hospital}
                  </p>


                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    <span
                      style={{
                        color: "#15803d",
                        fontWeight: "bold"
                      }}
                    >
                      ACTIVE
                    </span>
                  </p>


                  <p>
                    <strong>
                      Latitude:
                    </strong>{" "}
                    {latitude.toFixed(6)}
                  </p>


                  <p>
                    <strong>
                      Longitude:
                    </strong>{" "}
                    {longitude.toFixed(6)}
                  </p>

                </div>

              </Popup>

            </Marker>

          );

        })}

      </MapContainer>

    </div>

  );

}


export default PoliceMap;