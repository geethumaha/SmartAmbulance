import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";

import "leaflet/dist/leaflet.css";

// =====================================================
// LEAFLET ICON FIX
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

// =====================================================
// MAP CENTER UPDATE
// =====================================================

function MapCenterUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.setView(position, 16, {
      animate: true
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [map, position]);

  return null;
}

// =====================================================
// AMBULANCE MAP
// =====================================================

function AmbulanceMap({
  latitude,
  longitude
}) {

  const hasLocation =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const position = hasLocation
    ? [
        Number(latitude),
        Number(longitude)
      ]
    : [17.3850, 78.4867];

  return (
    <div
      style={{
        width: "100%",
        height: "350px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative"
      }}
    >

      <MapContainer
        center={position}
        zoom={hasLocation ? 16 : 12}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%"
        }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater
          position={
            hasLocation
              ? position
              : null
          }
        />

        {hasLocation && (
          <Marker position={position}>

            <Popup>

              <div
                style={{
                  minWidth: "180px"
                }}
              >

                <strong>
                  🚑 Live Ambulance
                </strong>

                <br />

                <span>
                  Current GPS Location
                </span>

                <br />
                <br />

                <strong>
                  Latitude:
                </strong>{" "}
                {Number(latitude).toFixed(6)}

                <br />

                <strong>
                  Longitude:
                </strong>{" "}
                {Number(longitude).toFixed(6)}

              </div>

            </Popup>

          </Marker>
        )}

      </MapContainer>

      {!hasLocation && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 1000,
            background: "white",
            padding: "10px 14px",
            borderRadius: "8px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.2)",
            fontSize: "13px",
            color: "#475569"
          }}
        >
          📍 Waiting for current GPS location...
        </div>
      )}

    </div>
  );
}

export default AmbulanceMap;