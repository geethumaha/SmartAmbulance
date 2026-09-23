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
  useRef,
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


  const [
    routeCoordinates,
    setRouteCoordinates
  ] = useState([]);


  const [
    routeStatus,
    setRouteStatus
  ] = useState("Calculating route...");


  const lastRouteLocation =
    useRef(null);


  // ==========================================
  // CALCULATE ROUTE
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
        "🔄 Updating route..."
      );


      const startLongitude =
        start[1];

      const startLatitude =
        start[0];

      const destinationLongitude =
        destination[1];

      const destinationLatitude =
        destination[0];


      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${startLongitude},${startLatitude};` +
        `${destinationLongitude},${destinationLatitude}` +
        `?overview=full&geometries=geojson`;


      const response =
        await fetch(url);


      if (!response.ok) {

        throw new Error(
          "Routing service unavailable"
        );

      }


      const data =
        await response.json();


      if (
        data.code !== "Ok" ||
        !data.routes ||
        data.routes.length === 0
      ) {

        throw new Error(
          "No route found"
        );

      }


      const route =
        data.routes[0];


      // ==========================================
      // DISTANCE + ETA
      // ==========================================

      onRouteFound({

        distance:
          route.distance,

        time:
          route.duration

      });


      // ==========================================
      // ROAD COORDINATES
      // ==========================================

      const coordinates =
        route.geometry.coordinates.map(
          (point) => [
            point[1],
            point[0]
          ]
        );


      setRouteCoordinates(
        coordinates
      );


      setRouteStatus(
        "🟢 Route updated"
      );


      // ==========================================
      // FIT MAP TO ROUTE
      // ==========================================

      if (
        coordinates.length > 0
      ) {

        const bounds =
          L.latLngBounds(
            coordinates
          );


        map.fitBounds(
          bounds,
          {
            padding: [
              40,
              40
            ]
          }
        );

      }

    } catch (error) {

      console.error(
        "Route calculation error:",
        error
      );


      setRouteStatus(
        "⚠️ Route update failed"
      );

    }

  };


  // ==========================================
  // INITIAL ROUTE + GPS CHANGE
  // ==========================================

  useEffect(() => {

    if (
      !start ||
      !destination
    ) {

      return;

    }


    // ------------------------------------------
    // CHECK GPS MOVEMENT
    // ------------------------------------------

    let shouldRecalculate = true;


    if (
      lastRouteLocation.current
    ) {

      const previous =
        lastRouteLocation.current;


      const latitudeDifference =
        Math.abs(
          start[0] -
          previous[0]
        );


      const longitudeDifference =
        Math.abs(
          start[1] -
          previous[1]
        );


      // Recalculate when GPS moves
      // approximately more than 20 metres.

      if (
        latitudeDifference <
          0.0002 &&
        longitudeDifference <
          0.0002
      ) {

        shouldRecalculate = false;

      }

    }


    if (
      shouldRecalculate
    ) {

      lastRouteLocation.current =
        start;


      calculateRoute();

    }


  }, [
    start,
    destination
  ]);


  // ==========================================
  // AUTOMATIC ROUTE REFRESH
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

        lastRouteLocation.current =
          start;


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
          ROUTE LINE
      ====================================== */}

      {routeCoordinates.length > 0 && (

        <Polyline

          positions={
            routeCoordinates
          }

          pathOptions={{
            color: "#2563eb",
            weight: 6,
            opacity: 0.85
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
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.2)",
          fontSize: "13px",
          fontWeight: "bold"
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


  const ambulanceLocation =
    latitude !== null &&
    longitude !== null

      ? [
          latitude,
          longitude
        ]

      : [
          16.5062,
          80.6480
        ];


  const hospitalLocation =
    hospitalLatitude !== null &&
    hospitalLongitude !== null

      ? [
          hospitalLatitude,
          hospitalLongitude
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

        <TileLayer

          attribution="&copy; OpenStreetMap contributors"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />


        {/* =====================================
            AMBULANCE
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

            Latitude:
            {" "}

            {latitude !== null
              ? latitude.toFixed(6)
              : "Waiting..."}

            <br />

            Longitude:
            {" "}

            {longitude !== null
              ? longitude.toFixed(6)
              : "Waiting..."}

          </Popup>

        </Marker>


        {/* =====================================
            HOSPITAL
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

            </Popup>

          </Marker>

        )}


        {/* =====================================
            DYNAMIC ROUTE
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