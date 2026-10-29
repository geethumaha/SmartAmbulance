import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

// Traffic signal icon
const trafficSignalIcon = L.divIcon({
  className: "traffic-signal-marker",
  html: `
    <div style="
      width:30px;
      height:30px;
      border:2px solid white;
      border-radius:50%;
      background:#dc2626;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:17px;
      box-shadow:0 2px 7px rgba(0,0,0,.4);
    ">🚦</div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Automatically adjust the map to show the route
function RouteMapController({ start, destination, route }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !destination) return;

    const points = [start, destination];

    if (route?.length) {
      points.push(...route);
    }

    map.fitBounds(L.latLngBounds(points), {
      padding: [40, 40],
      maxZoom: 15
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [start, destination, route, map]);

  return null;
}

// Main RouteMap component
function RouteMap({
  latitude,
  longitude,
  hospitalLatitude,
  hospitalLongitude,
  onRouteFound,
  tripId,
  ambulanceId,
  priority
}) {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeStatus, setRouteStatus] = useState(
    "Waiting for route..."
  );

  const [trafficSignals, setTrafficSignals] = useState([]);
  const [signalStatus, setSignalStatus] = useState("");

  const start =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined
      ? [Number(latitude), Number(longitude)]
      : null;

  const destination =
    hospitalLatitude !== null &&
    hospitalLatitude !== undefined &&
    hospitalLongitude !== null &&
    hospitalLongitude !== undefined
      ? [
          Number(hospitalLatitude),
          Number(hospitalLongitude)
        ]
      : null;
        // Calculate the best route from the ambulance to the hospital
  useEffect(() => {
    if (!start || !destination) {
      setRouteCoordinates([]);
      setTrafficSignals([]);

      setRouteStatus(
        "Waiting for ambulance and hospital locations..."
      );

      return;
    }

    let cancelled = false;

    const findRoute = async () => {
      try {
        setRouteStatus("Finding best emergency route...");
        setTrafficSignals([]);
        setSignalStatus("");

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start[1]},${start[0]};` +
          `${destination[1]},${destination[0]}` +
          `?overview=full&geometries=geojson&steps=true`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `OSRM request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("No route found");
        }

        const route = data.routes[0];

        // Convert [longitude, latitude] to [latitude, longitude].
        // Leaflet uses [latitude, longitude].
        const coordinates = route.geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        if (cancelled) return;

        setRouteCoordinates(coordinates);
        setRouteStatus("Emergency route active");

        // Send route information to the parent component.
        if (onRouteFound) {
          onRouteFound({
            distance: route.distance,
            time: route.duration,
            coordinates
          });
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Route calculation error:", error);

        setRouteStatus("Unable to calculate route");
      }
    };

    findRoute();

    return () => {
      cancelled = true;
    };
  }, [
    latitude,
    longitude,
    hospitalLatitude,
    hospitalLongitude,
    onRouteFound
  ]);  // Detect traffic signals along the calculated route
  useEffect(() => {
    if (
      !tripId ||
      !ambulanceId ||
      routeCoordinates.length === 0
    ) {
      return;
    }

    let cancelled = false;

    const findTrafficSignals = async () => {
      try {
        setSignalStatus(
          "Finding traffic signals along route..."
        );

        const response = await axios.post(
          "http://localhost:5000/api/trips/route-junctions",
          {
            tripId,
            ambulanceId,
            priority: priority || "Critical",
            routeCoordinates,

            // Coordinates are in [latitude, longitude] format.
            coordinateOrder: "latlon"
          },
          {
            timeout: 60000
          }
        );

        if (cancelled) return;

        const signals = Array.isArray(
          response.data?.junctions
        )
          ? response.data.junctions
          : [];

        setTrafficSignals(signals);

        if (signals.length > 0) {
          setSignalStatus(
            `Found ${signals.length} traffic signal(s)`
          );
        } else {
          setSignalStatus(
            response.data?.message ||
              "No traffic signals found for this route"
          );
        }

        console.log(
          "Route traffic-signal detection response:",
          response.data
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Traffic-signal detection request failed:",
          error.response?.data || error.message
        );

        setTrafficSignals([]);

        setSignalStatus(
          error.response?.data?.message ||
            "Could not load traffic signals. Check backend terminal."
        );
      }
    };

    findTrafficSignals();

    return () => {
      cancelled = true;
    };
  }, [
    tripId,
    ambulanceId,
    priority,
    routeCoordinates
  ]);

  // Wait until ambulance and hospital locations are available.
  if (!start || !destination) {
    return (
      <div
        style={{
          height: "350px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          borderRadius: "12px",
          color: "#64748b"
        }}
      >
        📍 Waiting for ambulance and hospital locations...
      </div>
    );
  }
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
        center={start}
        zoom={14}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        {/* Map tiles */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Automatically fit the map to the route */}
        <RouteMapController
          start={start}
          destination={destination}
          route={routeCoordinates}
        />

        {/* Ambulance marker */}
        <Marker position={start}>
          <Popup>
            🚑 <strong>Ambulance</strong>
            <br />
            Starting location
          </Popup>
        </Marker>

        {/* Hospital marker */}
        <Marker position={destination}>
          <Popup>
            🏥 <strong>Hospital</strong>
            <br />
            Emergency destination
          </Popup>
        </Marker>

        {/* Draw the ambulance route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: "#2563eb",
              weight: 6,
              opacity: 0.85
            }}
          />
        )}

        {/* Display detected traffic signal markers */}
        {trafficSignals.map((signal, index) => {
          const signalLat = Number(signal.latitude);
          const signalLng = Number(signal.longitude);

          if (
            !Number.isFinite(signalLat) ||
            !Number.isFinite(signalLng)
          ) {
            return null;
          }

          return (
            <Marker
              key={
                signal.junctionId ||
                signal.id ||
                `${signalLat}-${signalLng}-${index}`
              }
              position={[signalLat, signalLng]}
              icon={trafficSignalIcon}
            >
              <Popup>
                <strong>
                  🚦{" "}
                  {signal.junctionName ||
                    signal.name ||
                    `Traffic Signal ${index + 1}`}
                </strong>

                <br />

                Source: {signal.source || "Traffic signal data"}

                <br />

                Distance from route:{" "}
                {signal.distanceFromRoute ?? "N/A"} m

                <br />

                Route progress:{" "}
                {signal.routeProgress ?? "N/A"}%

                <br />

                Police:{" "}
                {signal.policeOfficer || "Officer not assigned"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Route and traffic signal status */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 1000,
          background: "white",
          padding: "8px 14px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          fontSize: "13px",
          fontWeight: "bold",
          color: "#1e3a5f",
          maxWidth: "75%"
        }}
      >
        <div>🛣️ {routeStatus}</div>

        {tripId && (
          <div
            style={{
              marginTop: 4,
              fontWeight: "normal"
            }}
          >
            🚦{" "}
            {signalStatus ||
              "Waiting to detect signals..."}
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteMap;