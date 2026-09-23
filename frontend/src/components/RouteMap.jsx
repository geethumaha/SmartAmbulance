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

import {
  useEffect,
  useState
} from "react";


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
// ROUTE CALCULATOR
// ==========================================

function RouteCalculator({
  start,
  destination,
  onRouteFound
}) {

  const map = useMap();

  const [routeCoordinates, setRouteCoordinates] =
    useState([]);

  const [routeStatus, setRouteStatus] =
    useState("🔄 Calculating road route...");


  // ==========================================
  // CALCULATE ROAD ROUTE USING OSRM
  // ==========================================

  const calculateRoute = async () => {

    if (
      !start ||
      !destination
    ) {
      return;
    }


    try {

      setRouteStatus(
        "🔄 Calculating road route..."
      );


      const startLatitude =
        Number(start[0]);

      const startLongitude =
        Number(start[1]);

      const destinationLatitude =
        Number(destination[0]);

      const destinationLongitude =
        Number(destination[1]);


      console.log(
        "🚑 Route start:",
        startLatitude,
        startLongitude
      );

      console.log(
        "🏥 Route destination:",
        destinationLatitude,
        destinationLongitude
      );


      // ==========================================
      // OSRM ROUTING URL
      // ==========================================

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${startLongitude},${startLatitude};` +
        `${destinationLongitude},${destinationLatitude}` +
        `?overview=full&geometries=geojson`;


      console.log(
        "🗺️ OSRM URL:",
        url
      );


      const response =
        await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json"
          }
        });


      if (!response.ok) {

        throw new Error(
          `OSRM HTTP error: ${response.status}`
        );

      }


      const data =
        await response.json();


      console.log(
        "🗺️ OSRM response:",
        data
      );


      if (
        data.code !== "Ok" ||
        !data.routes ||
        data.routes.length === 0
      ) {

        throw new Error(
          "OSRM could not find a road route"
        );

      }


      const route =
        data.routes[0];


      // ==========================================
      // DISTANCE + ETA
      // ==========================================

      if (onRouteFound) {

        onRouteFound({
          distance:
            route.distance,

          time:
            route.duration
        });

      }


      // ==========================================
      // CONVERT OSRM COORDINATES
      // OSRM:
      // [longitude, latitude]
      //
      // LEAFLET:
      // [latitude, longitude]
      // ==========================================

      const coordinates =
        route.geometry.coordinates.map(
          (point) => [
            Number(point[1]),
            Number(point[0])
          ]
        );


      console.log(
        "📍 Route points:",
        coordinates.length
      );


      if (
        coordinates.length === 0
      ) {

        throw new Error(
          "Route returned no coordinates"
        );

      }


      // ==========================================
      // DRAW ROUTE
      // ==========================================

      setRouteCoordinates(
        coordinates
      );


      setRouteStatus(
        "🟢 Road route found"
      );


      // ==========================================
      // FIT MAP TO COMPLETE ROUTE
      // ==========================================

      const bounds =
        L.latLngBounds(
          coordinates
        );


      map.fitBounds(
        bounds,
        {
          padding: [
            60,
            60
          ]
        }
      );


    } catch (error) {

      console.error(
        "❌ Route calculation error:",
        error
      );


      setRouteStatus(
        "⚠️ Road route could not be loaded"
      );

    }

  };


  // ==========================================
  // CALCULATE WHEN START / DESTINATION CHANGES
  // ==========================================

  useEffect(() => {

    calculateRoute();

  }, [
    start,
    destination
  ]);


  // ==========================================
  // REFRESH ROUTE EVERY 10 SECONDS
  // ==========================================

  useEffect(() => {

    if (
      !start ||
      !destination
    ) {
      return;
    }


    const interval =
      setInterval(() => {

        calculateRoute();

      }, 10000);


    return () => {

      clearInterval(
        interval
      );

    };

  }, [
    start,
    destination
  ]);


  return (
    <>
      {/* =====================================
          ACTUAL ROAD ROUTE
      ====================================== */}

      {routeCoordinates.length > 1 && (

        <Polyline
          positions={
            routeCoordinates
          }

          pathOptions={{
            color: "#2563eb",
            weight: 7,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round"
          }}
        />

      )}


      {/* =====================================
          ROUTE STATUS
      ====================================== */}

      <div
        style={{
          position: "absolute",
          bottom: "15px",
          left: "15px",
          zIndex: 1000,

          background: "white",

          padding:
            "10px 15px",

          borderRadius:
            "8px",

          boxShadow:
            "0 3px 10px rgba(0,0,0,0.2)",

          fontSize:
            "13px",

          fontWeight:
            "bold",

          color:
            routeStatus.includes("🟢")
              ? "#15803d"
              : routeStatus.includes("⚠️")
              ? "#dc2626"
              : "#1e3a5f"
        }}
      >
        {routeStatus}
      </div>

    </>
  );
}


// ==========================================
// ROUTE MAP
// ==========================================

function RouteMap({
  latitude,
  longitude,
  hospitalLatitude,
  hospitalLongitude,
  onRouteFound
}) {

  // ==========================================
  // AMBULANCE LOCATION
  // ==========================================

  const ambulanceLocation =
    latitude !== null &&
    longitude !== null

      ? [
          Number(latitude),
          Number(longitude)
        ]

      : [
          17.3934,
          78.4706
        ];


  // ==========================================
  // HOSPITAL LOCATION
  // ==========================================

  const hospitalLocation =
    hospitalLatitude !== null &&
    hospitalLongitude !== null

      ? [
          Number(hospitalLatitude),
          Number(hospitalLongitude)
        ]

      : null;


  return (

    <div
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "15px",
        overflow: "hidden",
        position: "relative"
      }}
    >

      <MapContainer
        center={
          ambulanceLocation
        }

        zoom={13}

        style={{
          width: "100%",
          height: "100%"
        }}
      >

        {/* =====================================
            OPENSTREETMAP
        ====================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =====================================
            AMBULANCE MARKER
        ====================================== */}

        <Marker
          position={
            ambulanceLocation
          }
        >

          <Popup>

            🚑 <strong>
              Ambulance
            </strong>

            <br />

            Current Location

            <br />

            Latitude:{" "}

            {latitude !== null
              ? Number(latitude).toFixed(6)
              : "Waiting..."}

            <br />

            Longitude:{" "}

            {longitude !== null
              ? Number(longitude).toFixed(6)
              : "Waiting..."}

          </Popup>

        </Marker>


        {/* =====================================
            HOSPITAL MARKER
        ====================================== */}

        {hospitalLocation && (

          <Marker
            position={
              hospitalLocation
            }
          >

            <Popup>

              🏥 <strong>
                Destination Hospital
              </strong>

              <br />

              Emergency Destination

              <br />

              Latitude:{" "}

              {hospitalLocation[0].toFixed(6)}

              <br />

              Longitude:{" "}

              {hospitalLocation[1].toFixed(6)}

            </Popup>

          </Marker>

        )}


        {/* =====================================
            ACTUAL ROAD ROUTE
        ====================================== */}

        {hospitalLocation && (

          <RouteCalculator

            start={
              ambulanceLocation
            }

            destination={
              hospitalLocation
            }

            onRouteFound={
              onRouteFound
            }

          />

        )}

      </MapContainer>

    </div>

  );
}


export default RouteMap;