
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import { useEffect, useState } from "react";
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

// Predefined hospitals are used only when a trip has no saved
// destination coordinates and its name matches one of these.
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

const ambulanceIcon = L.divIcon({
  className: "ambulance-map-icon",
  html: `
    <div style="
      width:44px;
      height:44px;
      background:white;
      border:3px solid #2563eb;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:27px;
      box-shadow:0 3px 12px rgba(0,0,0,0.3);
    ">🚑</div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

const hospitalIcon = L.divIcon({
  className: "hospital-map-icon",
  html: `
    <div style="
      width:42px;
      height:42px;
      background:white;
      border:3px solid #dc2626;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:25px;
      box-shadow:0 3px 10px rgba(0,0,0,0.3);
    ">🏥</div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21]
});

// Accept either {latitude, longitude} or {lat, lng}.
function readCoordinates(location) {
  if (!location) return null;

  const latitude = Number(
    location.latitude ?? location.lat
  );
  const longitude = Number(
    location.longitude ?? location.lng
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function getTripStart(trip) {
  // Preserve the original trip start so the complete route
  // remains visible while the ambulance moves.
  return (
    readCoordinates(trip.startLocation) ||
    readCoordinates(trip.startLocation?.coordinates) ||
    readCoordinates(trip.currentLocation)
  );
}

function getTripDestination(trip) {
  const savedDestination = readCoordinates({
    latitude: trip.hospitalLatitude,
    longitude: trip.hospitalLongitude
  });

  if (savedDestination) {
    return savedDestination;
  }

  return hospitalLocations[trip.hospital] || null;
}

function MapViewController({ trips, routes }) {
  const map = useMap();

  useEffect(() => {
    const points = [];

    trips.forEach((trip) => {
      const current = readCoordinates(trip.currentLocation);
      const destination = getTripDestination(trip);

      if (current) {
        points.push([current.latitude, current.longitude]);
      }

      if (destination) {
        points.push([
          destination.latitude,
          destination.longitude
        ]);
      }
    });

    Object.values(routes).forEach((route) => {
      if (Array.isArray(route)) {
        points.push(...route);
      }
    });

    if (points.length === 1) {
      map.setView(points[0], 14);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        padding: [40, 40],
        maxZoom: 15
      });
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [trips, routes, map]);

  return null;
}

function PoliceMap({ trips = [] }) {
  const [routes, setRoutes] = useState({});
  const [routeMessages, setRouteMessages] = useState({});

  // Draw the complete road route from the original start
  // to the selected destination, not current GPS to destination.
  useEffect(() => {
    let cancelled = false;

    async function findRoutes() {
      const newRoutes = {};
      const newMessages = {};

      for (const trip of trips) {
        const start = getTripStart(trip);
        const destination = getTripDestination(trip);

        if (!start || !destination) {
          newMessages[trip._id] =
            "Missing start or destination coordinates";
          continue;
        }

        try {
          const url =
            "https://router.project-osrm.org/route/v1/driving/" +
            `${start.longitude},${start.latitude};` +
            `${destination.longitude},${destination.latitude}` +
            "?overview=full&geometries=geojson";

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(
              `Routing service returned ${response.status}`
            );
          }

          const data = await response.json();

          if (
            data.code !== "Ok" ||
            !data.routes ||
            data.routes.length === 0
          ) {
            newMessages[trip._id] =
              "No road route was found for this trip";
            continue;
          }

          newRoutes[trip._id] =
            data.routes[0].geometry.coordinates.map(
              ([longitude, latitude]) => [
                latitude,
                longitude
              ]
            );

          newMessages[trip._id] = "";
        } catch (error) {
          console.error(
            "Police route calculation failed:",
            trip.ambulanceId,
            error
          );

          newMessages[trip._id] =
            "Could not load the road route";
        }
      }

      if (!cancelled) {
        setRoutes(newRoutes);
        setRouteMessages(newMessages);
      }
    }

    if (trips.length > 0) {
      findRoutes();
    } else {
      setRoutes({});
      setRouteMessages({});
    }

    return () => {
      cancelled = true;
    };
  }, [trips]);


  const firstTripLocation = readCoordinates(
    trips[0]?.currentLocation
  );

  const initialCenter = firstTripLocation
    ? [
        firstTripLocation.latitude,
        firstTripLocation.longitude
      ]
    : [18.1067, 83.3956];

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
        zoom={12}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController
          trips={trips}
          routes={routes}
        />

        {trips.map((trip) => {
          const current = readCoordinates(
            trip.currentLocation
          );

          const destination = getTripDestination(trip);

          if (!current) return null;

          const ambulancePosition = [
            current.latitude,
            current.longitude
          ];

          return (
            <div key={trip._id}>
              {/* LIVE AMBULANCE POSITION */}
              <Marker
                position={ambulancePosition}
                icon={ambulanceIcon}
              >
                <Popup>
                  <strong>🚑 {trip.ambulanceId}</strong>
                  <p>Priority: {trip.priority}</p>
                  <p>Destination: {trip.hospital}</p>
                  <p>Status: {trip.status}</p>
                  <p>Live ambulance position</p>
                </Popup>
              </Marker>

              {/* SELECTED HOSPITAL */}
              {destination && (
                <Marker
                  position={[
                    destination.latitude,
                    destination.longitude
                  ]}
                  icon={hospitalIcon}
                >
                  <Popup>
                    <strong>🏥 {trip.hospital}</strong>
                    <p>
                      Destination for {trip.ambulanceId}
                    </p>
                  </Popup>
                </Marker>
              )}

              {/* COMPLETE ROAD ROUTE: START TO HOSPITAL */}
              {routes[trip._id]?.length > 0 && (
                <Polyline
                  positions={routes[trip._id]}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 6,
                    opacity: 0.95
                  }}
                />
              )}

              {/* ROUTE STATUS */}
              {routeMessages[trip._id] && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    bottom: "15px",
                    left: "15px",
                    background: "white",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                  }}
                >
                  {trip.ambulanceId}: {routeMessages[trip._id]}
                </div>
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default PoliceMap;
