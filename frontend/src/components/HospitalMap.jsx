import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


// ==========================================
// FIX LEAFLET MARKER ICONS
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
// HOSPITAL MAP
// ==========================================

function HospitalMap({
  latitude,
  longitude,
  ambulanceId
}) {

  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return (
      <div
        style={{
          height: "350px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f8fafc",
          borderRadius: "12px",
          color: "#64748b"
        }}
      >
        📍 Waiting for ambulance location...
      </div>
    );
  }


  const position = [
    Number(latitude),
    Number(longitude)
  ];


  return (

    <div
      style={{
        width: "100%",
        height: "350px",
        borderRadius: "12px",
        overflow: "hidden",
        marginTop: "20px"
      }}
    >

      <MapContainer
        center={position}
        zoom={15}
        style={{
          width: "100%",
          height: "100%"
        }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <Marker position={position}>

          <Popup>

            <strong>
              🚑 {ambulanceId}
            </strong>

            <br />

            Live Ambulance Location

            <br />

            Latitude:
            {" "}
            {Number(latitude).toFixed(6)}

            <br />

            Longitude:
            {" "}
            {Number(longitude).toFixed(6)}

          </Popup>

        </Marker>

      </MapContainer>

    </div>

  );
}


export default HospitalMap;