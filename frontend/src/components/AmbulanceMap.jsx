import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

function AmbulanceMap({ latitude, longitude }) {

  // Default location while GPS is loading
  const defaultLocation = [16.5062, 80.6480];

  const position =
    latitude !== null && longitude !== null
      ? [latitude, longitude]
      : defaultLocation;

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
        borderRadius: "12px",
        overflow: "hidden"
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
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {latitude !== null && longitude !== null && (

          <Marker position={position}>

            <Popup>
              🚑 <strong>Ambulance Location</strong>
              <br />
              Latitude: {latitude.toFixed(6)}
              <br />
              Longitude: {longitude.toFixed(6)}
            </Popup>

          </Marker>

        )}

      </MapContainer>

    </div>
  );
}

export default AmbulanceMap;