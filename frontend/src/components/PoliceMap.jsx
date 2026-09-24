import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


// ==========================================
// DEFAULT LEAFLET ICON
// ==========================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});


// ==========================================
// HOSPITAL LOCATIONS
// ==========================================

const hospitalLocations = {

  "City Hospital": {
    latitude: 17.3850,
    longitude: 78.4867
  },

  "Apollo Hospital": {
    latitude: 17.4254,
    longitude: 78.4111
  },

  "Government General Hospital": {
    latitude: 17.3895,
    longitude: 78.4760
  }

};


// ==========================================
// HOSPITAL ICON
// ==========================================

const hospitalIcon = L.divIcon({

  className: "",

  html: `
    <div style="
      width: 42px;
      height: 42px;
      background: white;
      border: 3px solid #dc2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 25px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
    ">
      🏥
    </div>
  `,

  iconSize: [42, 42],

  iconAnchor: [21, 21]

});


// ==========================================
// MAP UPDATER
// ==========================================

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
        [
          Number(latitude),
          Number(longitude)
        ],
        13
      );

    }

  }

  return null;
}


// ==========================================
// POLICE MAP
// ==========================================

function PoliceMap({ trips }) {

  const firstTrip = trips[0];

  const initialCenter =
    firstTrip?.currentLocation?.latitude !== undefined &&
    firstTrip?.currentLocation?.longitude !== undefined
      ? [
          Number(
            firstTrip.currentLocation.latitude
          ),

          Number(
            firstTrip.currentLocation.longitude
          )
        ]
      : [
          17.3850,
          78.4867
        ];


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

        {/* ==================================
            OPENSTREETMAP
        ================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <MapUpdater
          trips={trips}
        />


        {/* ==================================
            AMBULANCES + DESTINATIONS
        ================================== */}

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


          const ambulancePosition = [
            Number(latitude),
            Number(longitude)
          ];


          const hospital =
            hospitalLocations[
              trip.hospital
            ] ||
            hospitalLocations[
              "City Hospital"
            ];


          const hospitalPosition = [
            Number(hospital.latitude),
            Number(hospital.longitude)
          ];


          return (

            <div key={trip._id}>

              {/* ==================================
                  AMBULANCE MARKER
              ================================== */}

              <Marker
                position={
                  ambulancePosition
                }
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
                        Destination:
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
                      {Number(latitude).toFixed(6)}
                    </p>

                    <p>
                      <strong>
                        Longitude:
                      </strong>{" "}
                      {Number(longitude).toFixed(6)}
                    </p>

                  </div>

                </Popup>

              </Marker>


              {/* ==================================
                  🏥 DESTINATION HOSPITAL PIN
              ================================== */}

              <Marker
                position={
                  hospitalPosition
                }
                icon={hospitalIcon}
              >

                <Popup>

                  <div
                    style={{
                      minWidth: "180px"
                    }}
                  >

                    <h3
                      style={{
                        marginTop: 0,
                        color: "#dc2626"
                      }}
                    >
                      🏥 {trip.hospital}
                    </h3>

                    <p
                      style={{
                        marginBottom: "8px"
                      }}
                    >
                      <strong>
                        Destination Hospital
                      </strong>
                    </p>

                    <p>
                      Ambulance:{" "}
                      <strong>
                        {trip.ambulanceId}
                      </strong>
                    </p>

                    <p>
                      Latitude:{" "}
                      {hospital.latitude.toFixed(6)}
                    </p>

                    <p>
                      Longitude:{" "}
                      {hospital.longitude.toFixed(6)}
                    </p>

                  </div>

                </Popup>

              </Marker>


              {/* ==================================
                  BLUE ROUTE / CONNECTION LINE
              ================================== */}

              <Polyline
                positions={[
                  ambulancePosition,
                  hospitalPosition
                ]}
                pathOptions={{
                  color: "#2563eb",
                  weight: 5,
                  opacity: 0.9
                }}
              />

            </div>

          );

        })}

      </MapContainer>

    </div>

  );

}


export default PoliceMap;