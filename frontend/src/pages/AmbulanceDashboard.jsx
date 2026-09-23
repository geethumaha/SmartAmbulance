import {
  useEffect,
  useState,
  useCallback
} from "react";

import axios from "axios";

import AmbulanceMap from "../components/AmbulanceMap";
import RouteMap from "../components/RouteMap";


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
// AMBULANCE DASHBOARD
// ==========================================

function AmbulanceDashboard() {


  // ==========================================
  // TRIP STATE
  // ==========================================

  const [
    tripStarted,
    setTripStarted
  ] = useState(false);


  const [
    tripId,
    setTripId
  ] = useState(null);


  // ==========================================
  // EMERGENCY STATE
  // ==========================================

  const [
    priority,
    setPriority
  ] = useState("Critical");


  const [
    hospital,
    setHospital
  ] = useState("City Hospital");


  // ==========================================
  // GPS STATE
  // ==========================================

  const [
    location,
    setLocation
  ] = useState({
    latitude: null,
    longitude: null
  });


  const [
    gpsStatus,
    setGpsStatus
  ] = useState(
    "Checking GPS..."
  );


  // ==========================================
  // TRIP MESSAGE
  // ==========================================

  const [
    tripMessage,
    setTripMessage
  ] = useState("");


  // ==========================================
  // ROUTE INFORMATION
  // ==========================================

  const [
    routeDistance,
    setRouteDistance
  ] = useState(null);


  const [
    routeTime,
    setRouteTime
  ] = useState(null);


  // ==========================================
  // LIVE GPS LOCATION
  // ==========================================

  useEffect(() => {

    if (!navigator.geolocation) {

      setGpsStatus(
        "GPS not supported"
      );

      return;

    }


    const watchId =
      navigator.geolocation.watchPosition(

        (position) => {

          setLocation({

            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude

          });


          setGpsStatus(
            "Active"
          );

        },


        (error) => {

          console.error(
            "GPS Error:",
            error
          );


          setGpsStatus(
            "Location permission required"
          );

        },


        {

          enableHighAccuracy: true,

          maximumAge: 5000,

          timeout: 10000

        }

      );


    return () => {

      navigator.geolocation.clearWatch(
        watchId
      );

    };

  }, []);


  // ==========================================
  // SEND LIVE LOCATION TO BACKEND
  // ==========================================

  useEffect(() => {

    if (
      !tripStarted ||
      !tripId
    ) {

      return;

    }


    if (
      location.latitude === null ||
      location.longitude === null
    ) {

      return;

    }


    const updateLocation =
      async () => {

        try {

          await axios.put(

            `http://localhost:5000/api/trips/update-location/${tripId}`,

            {

              latitude:
                location.latitude,

              longitude:
                location.longitude

            }

          );


          console.log(

            "Live ambulance location sent:",

            location.latitude,

            location.longitude

          );

        } catch (error) {

          console.error(

            "Location update error:",

            error

          );

        }

      };


    updateLocation();


  }, [
    location,
    tripStarted,
    tripId
  ]);


  // ==========================================
  // GET SELECTED HOSPITAL
  // ==========================================

  const selectedHospital =
    hospitalLocations[hospital] || null;


  // ==========================================
  // ROUTE FOUND CALLBACK
  // ==========================================

  const handleRouteFound =
    useCallback((route) => {

      if (!route) {
        return;
      }


      setRouteDistance(
        route.distance
      );


      setRouteTime(
        route.time
      );


    }, []);


  // ==========================================
  // FORMAT DISTANCE
  // ==========================================

  const formatDistance =
    (meters) => {

      if (
        meters === null ||
        meters === undefined
      ) {

        return "Calculating...";

      }


      const kilometers =
        meters / 1000;


      if (
        kilometers < 1
      ) {

        return `${Math.round(meters)} m`;

      }


      return `${kilometers.toFixed(1)} km`;

    };


  // ==========================================
  // FORMAT ETA
  // ==========================================

  const formatETA =
    (seconds) => {

      if (
        seconds === null ||
        seconds === undefined
      ) {

        return "Calculating...";

      }


      const minutes =
        Math.round(
          seconds / 60
        );


      if (
        minutes < 1
      ) {

        return "Less than 1 min";

      }


      if (
        minutes === 1
      ) {

        return "1 minute";

      }


      return `${minutes} minutes`;

    };


  // ==========================================
  // START EMERGENCY TRIP
  // ==========================================

  const startTrip =
    async () => {

      setTripMessage("");


      // CHECK GPS

      if (
        location.latitude === null ||
        location.longitude === null
      ) {

        setTripMessage(
          "❌ GPS location is not available yet"
        );

        return;

      }


      try {

        const response =
          await axios.post(

            "http://localhost:5000/api/trips/start",

            {

              ambulanceId:
                "AMB-001",

              priority:
                priority,

              hospital:
                hospital,

              latitude:
                location.latitude,

              longitude:
                location.longitude

            }

          );


        console.log(

          "Trip created:",

          response.data.trip

        );


        // SAVE TRIP ID

        setTripId(
          response.data.trip._id
        );


        // START TRIP

        setTripStarted(
          true
        );


        // RESET ROUTE

        setRouteDistance(
          null
        );


        setRouteTime(
          null
        );


        setTripMessage(
          "✅ Emergency trip started successfully"
        );


      } catch (error) {

        console.error(

          "Start trip error:",

          error

        );


        if (
          error.response
        ) {

          setTripMessage(

            `❌ ${error.response.data.message}`

          );

        } else {

          setTripMessage(
            "❌ Cannot connect to backend"
          );

        }

      }

    };


  // ==========================================
  // END EMERGENCY TRIP
  // ==========================================

  const stopTrip =
    async () => {

      setTripMessage("");


      if (!tripId) {

        setTripStarted(
          false
        );

        return;

      }


      try {

        const response =
          await axios.put(

            `http://localhost:5000/api/trips/end/${tripId}`

          );


        console.log(

          "Trip completed:",

          response.data.trip

        );


        setTripStarted(
          false
        );


        setTripId(
          null
        );


        setRouteDistance(
          null
        );


        setRouteTime(
          null
        );


        setTripMessage(
          "✅ Emergency trip completed successfully"
        );


      } catch (error) {

        console.error(

          "End trip error:",

          error

        );


        if (
          error.response
        ) {

          setTripMessage(

            `❌ ${error.response.data.message}`

          );

        } else {

          setTripMessage(
            "❌ Cannot connect to backend"
          );

        }

      }

    };


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div style={styles.page}>


      {/* =====================================
          HEADER
      ====================================== */}

      <header
        style={styles.header}
      >

        <div
          style={styles.headerLeft}
        >

          <div
            style={styles.logo}
          >
            🚑
          </div>


          <div>

            <h1
              style={styles.title}
            >
              Smart Ambulance
            </h1>


            <p
              style={styles.subtitle}
            >
              Ambulance Control Dashboard
            </p>

          </div>

        </div>


        <div
          style={styles.status}
        >

          <span
            style={styles.statusDot}
          />

          System Online

        </div>

      </header>


      <main
        style={styles.main}
      >


        {/* =====================================
            WELCOME
        ====================================== */}

        <section
          style={styles.welcomeCard}
        >

          <div>

            <h2
              style={styles.welcomeTitle}
            >
              Welcome, Ambulance Team 🚑
            </h2>


            <p
              style={styles.welcomeText}
            >
              Manage your emergency trip,
              GPS location, priority and
              hospital coordination.
            </p>

          </div>


          <div
            style={styles.ambulanceNumber}
          >

            <span>
              Ambulance ID
            </span>


            <strong>
              AMB-001
            </strong>

          </div>

        </section>


        {/* =====================================
            STAT CARDS
        ====================================== */}

        <section
          style={styles.statsGrid}
        >


          {/* GPS */}

          <div
            style={styles.statCard}
          >

            <div
              style={styles.statIcon}
            >
              📍
            </div>


            <div>

              <p
                style={styles.statLabel}
              >
                GPS Status
              </p>


              <h3
                style={styles.statValue}
              >
                {gpsStatus}
              </h3>

            </div>

          </div>


          {/* EMERGENCY */}

          <div
            style={styles.statCard}
          >

            <div
              style={styles.statIcon}
            >
              🚨
            </div>


            <div>

              <p
                style={styles.statLabel}
              >
                Emergency
              </p>


              <h3
                style={styles.statValue}
              >
                {priority}
              </h3>

            </div>

          </div>


          {/* ETA */}

          <div
            style={styles.statCard}
          >

            <div
              style={styles.statIcon}
            >
              ⏱️
            </div>


            <div>

              <p
                style={styles.statLabel}
              >
                ETA
              </p>


              <h3
                style={styles.statValue}
              >
                {formatETA(
                  routeTime
                )}
              </h3>

            </div>

          </div>


          {/* HOSPITAL */}

          <div
            style={styles.statCard}
          >

            <div
              style={styles.statIcon}
            >
              🏥
            </div>


            <div>

              <p
                style={styles.statLabel}
              >
                Hospital
              </p>


              <h3
                style={styles.statValue}
              >
                {hospital}
              </h3>

            </div>

          </div>

        </section>


        {/* =====================================
            ROUTE MAP
        ====================================== */}

        <section
          style={styles.routeCard}
        >

          <div
            style={styles.cardHeader}
          >

            <h2>
              🗺️ Smart Route & Live Navigation
            </h2>


            <span
              style={styles.liveBadge}
            >
              LIVE ROUTE
            </span>

          </div>


          <RouteMap

            latitude={
              location.latitude
            }

            longitude={
              location.longitude
            }

            hospitalLatitude={
              selectedHospital
                ? selectedHospital.latitude
                : null
            }

            hospitalLongitude={
              selectedHospital
                ? selectedHospital.longitude
                : null
            }

            onRouteFound={
              handleRouteFound
            }

          />


          {/* ROUTE INFORMATION */}

          <div
            style={styles.routeInfoGrid}
          >

            <div
              style={styles.routeInfoBox}
            >

              <span>
                📏 Route Distance
              </span>


              <strong>
                {formatDistance(
                  routeDistance
                )}
              </strong>

            </div>


            <div
              style={styles.routeInfoBox}
            >

              <span>
                ⏱️ Estimated Arrival
              </span>


              <strong>
                {formatETA(
                  routeTime
                )}
              </strong>

            </div>


            <div
              style={styles.routeInfoBox}
            >

              <span>
                🏥 Destination
              </span>


              <strong>
                {hospital}
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================
            DASHBOARD GRID
        ====================================== */}

        <section
          style={styles.dashboardGrid}
        >


          {/* =====================================
              LIVE MAP
          ====================================== */}

          <div
            style={styles.mapCard}
          >

            <div
              style={styles.cardHeader}
            >

              <h2>
                📍 Live Ambulance Location
              </h2>


              <span
                style={styles.liveBadge}
              >
                LIVE
              </span>

            </div>


            <AmbulanceMap

              latitude={
                location.latitude
              }

              longitude={
                location.longitude
              }

            />


            {/* COORDINATES */}

            <div
              style={styles.coordinates}
            >

              <div
                style={styles.coordinateBox}
              >

                <span>
                  Latitude
                </span>


                <strong>

                  {location.latitude !== null

                    ? location.latitude.toFixed(6)

                    : "Waiting..."}

                </strong>

              </div>


              <div
                style={styles.coordinateBox}
              >

                <span>
                  Longitude
                </span>


                <strong>

                  {location.longitude !== null

                    ? location.longitude.toFixed(6)

                    : "Waiting..."}

                </strong>

              </div>

            </div>

          </div>


          {/* =====================================
              EMERGENCY CONTROL
          ====================================== */}

          <div
            style={styles.controlCard}
          >

            <div
              style={styles.cardHeader}
            >

              <h2>
                🚨 Emergency Control
              </h2>

            </div>


            {/* PRIORITY */}

            <label
              style={styles.label}
            >
              Emergency Priority
            </label>


            <select

              value={priority}

              onChange={(e) =>
                setPriority(
                  e.target.value
                )
              }

              style={styles.select}

              disabled={
                tripStarted
              }

            >

              <option value="Critical">
                Critical
              </option>


              <option value="Serious">
                Serious
              </option>


              <option value="Moderate">
                Moderate
              </option>

            </select>


            {/* HOSPITAL */}

            <label
              style={styles.label}
            >
              Destination Hospital
            </label>


            <select

              value={hospital}

              onChange={(e) => {

                setHospital(
                  e.target.value
                );

                setRouteDistance(
                  null
                );

                setRouteTime(
                  null
                );

              }}

              style={styles.select}

              disabled={
                tripStarted
              }

            >

              <option value="City Hospital">
                City Hospital
              </option>


              <option value="Apollo Hospital">
                Apollo Hospital
              </option>


              <option value="Government General Hospital">
                Government General Hospital
              </option>

            </select>


            {/* START / END */}

            {!tripStarted ? (

              <button

                style={
                  styles.startButton
                }

                onClick={
                  startTrip
                }

              >

                🚨 Start Emergency Trip

              </button>

            ) : (

              <button

                style={
                  styles.stopButton
                }

                onClick={
                  stopTrip
                }

              >

                ⛔ End Emergency Trip

              </button>

            )}


            {/* ACTIVE TRIP */}

            {tripStarted && (

              <div
                style={
                  styles.tripStatus
                }
              >

                <span
                  style={
                    styles.activeDot
                  }
                />

                Emergency trip is active


                {tripId && (

                  <div
                    style={
                      styles.tripId
                    }
                  >
                    Trip ID: {tripId}
                  </div>

                )}

              </div>

            )}


            {/* MESSAGE */}

            {tripMessage && (

              <div
                style={{
                  ...styles.message,

                  color:
                    tripMessage.startsWith(
                      "✅"
                    )

                      ? "#15803d"

                      : "#dc2626"
                }}
              >

                {tripMessage}

              </div>

            )}

          </div>

        </section>


        {/* =====================================
            JOURNEY INFORMATION
        ====================================== */}

        <section
          style={styles.journeyCard}
        >

          <div
            style={styles.cardHeader}
          >

            <h2>
              🛣️ Journey Information
            </h2>

          </div>


          <div
            style={styles.journeyGrid}
          >

            <div
              style={styles.journeyItem}
            >

              <span>
                Starting Point
              </span>


              <strong>

                {location.latitude !== null &&
                location.longitude !== null

                  ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`

                  : "Current Location"}

              </strong>

            </div>


            <div
              style={styles.journeyItem}
            >

              <span>
                Destination
              </span>


              <strong>
                {hospital}
              </strong>

            </div>


            <div
              style={styles.journeyItem}
            >

              <span>
                Distance
              </span>


              <strong>
                {formatDistance(
                  routeDistance
                )}
              </strong>

            </div>


            <div
              style={styles.journeyItem}
            >

              <span>
                Estimated Time
              </span>


              <strong>
                {formatETA(
                  routeTime
                )}
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================
            TRAFFIC ALERT
        ====================================== */}

        <section
          style={styles.alertCard}
        >

          <div
            style={styles.alertIcon}
          >
            🚦
          </div>


          <div>

            <h3
              style={styles.alertTitle}
            >
              Traffic Coordination
            </h3>


            <p
              style={styles.alertText}
            >

              Traffic police will receive
              alerts for upcoming junctions
              when an emergency trip is active.

            </p>

          </div>

        </section>


      </main>


      {/* =====================================
          FOOTER
      ====================================== */}

      <footer
        style={styles.footer}
      >

        <p>

          Smart Ambulance © 2026 |

          Emergency Traffic Coordination Platform

        </p>

      </footer>

    </div>

  );

}


// ==========================================
// STYLES
// ==========================================

const styles = {


  page: {

    minHeight: "100vh",

    background: "#f1f7fb",

    fontFamily:
      "Arial, sans-serif",

    color: "#1f2937"

  },


  header: {

    background: "#0f6fae",

    color: "white",

    padding: "18px 40px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    boxShadow:
      "0 3px 10px rgba(0,0,0,0.12)"

  },


  headerLeft: {

    display: "flex",

    alignItems: "center",

    gap: "15px"

  },


  logo: {

    fontSize: "45px"

  },


  title: {

    margin: "0",

    fontSize: "27px"

  },


  subtitle: {

    margin: "5px 0 0",

    fontSize: "14px",

    opacity: "0.9"

  },


  status: {

    background:
      "rgba(255,255,255,0.15)",

    padding: "9px 15px",

    borderRadius: "20px",

    fontSize: "14px"

  },


  statusDot: {

    display: "inline-block",

    width: "9px",

    height: "9px",

    borderRadius: "50%",

    background: "#4ade80",

    marginRight: "7px"

  },


  main: {

    maxWidth: "1200px",

    margin: "0 auto",

    padding: "30px 25px"

  },


  welcomeCard: {

    background: "white",

    borderRadius: "15px",

    padding: "25px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    boxShadow:
      "0 4px 15px rgba(0,0,0,0.07)",

    marginBottom: "25px"

  },


  welcomeTitle: {

    margin: "0 0 8px",

    color: "#0f6fae"

  },


  welcomeText: {

    margin: "0",

    color: "#64748b"

  },


  ambulanceNumber: {

    background: "#eaf5fb",

    padding: "15px 25px",

    borderRadius: "10px",

    textAlign: "center"

  },


  statsGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(4, 1fr)",

    gap: "18px",

    marginBottom: "25px"

  },


  statCard: {

    background: "white",

    padding: "20px",

    borderRadius: "12px",

    display: "flex",

    alignItems: "center",

    gap: "15px",

    boxShadow:
      "0 4px 15px rgba(0,0,0,0.06)"

  },


  statIcon: {

    fontSize: "32px"

  },


  statLabel: {

    margin: "0 0 5px",

    color: "#64748b",

    fontSize: "13px"

  },


  statValue: {

    margin: "0",

    fontSize: "18px",

    color: "#0f6fae"

  },


  routeCard: {

    background: "white",

    borderRadius: "15px",

    padding: "22px",

    boxShadow:
      "0 4px 15px rgba(0,0,0,0.07)",

    marginBottom: "25px"

  },


  routeInfoGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(3, 1fr)",

    gap: "15px",

    marginTop: "15px"

  },


  routeInfoBox: {

    background: "#f8fafc",

    padding: "15px",

    borderRadius: "8px",

    display: "flex",

    flexDirection: "column",

    gap: "7px"

  },


  dashboardGrid: {

    display: "grid",

    gridTemplateColumns:
      "1.5fr 1fr",

    gap: "20px",

    marginBottom: "25px"

  },


  mapCard: {

    background: "white",

    borderRadius: "15px",

    padding: "22px",

    boxShadow:
      "0 4px 15px rgba(0,0,0,0.07)"

  },


  controlCard: {

    background: "white",

    borderRadius: "15px",

    padding: "22px",

    boxShadow:
      "0 4px 15px rgba(0,0,0,0.07)"

  },


  cardHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: "20px"

  },


  liveBadge: {

    background: "#dcfce7",

    color: "#15803d",

    padding: "5px 10px",

    borderRadius: "15px",

    fontSize: "12px",

    fontWeight: "bold"

  },


  coordinates: {

    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: "12px",

    marginTop: "15px"

  },


  coordinateBox: {

    background: "#f8fafc",

    padding: "12px",

    borderRadius: "8px",

    display: "flex",

    flexDirection: "column",

    gap: "5px"

  },


  label: {

    display: "block",

    marginTop: "18px",

    marginBottom: "7px",

    fontWeight: "bold"

  },


  select: {

    width: "100%",

    padding: "12px",

    border:
      "1px solid #cbd5e1",

    borderRadius: "7px",

    fontSize: "15px",

    background: "white"

  },


  startButton: {

    width: "100%",

    marginTop: "25px",

    padding: "14px",

    border: "none",

    borderRadius: "8px",

    background: "#dc2626",

    color: "white",

    fontSize: "15px",

    fontWeight: "bold",

    cursor: "pointer"

  },


  stopButton: {

    width: "100%",

    marginTop: "25px",

    padding: "14px",

    border: "none",

    borderRadius: "8px",

    background: "#475569",

    color: "white",

    fontSize: "15px",

    fontWeight: "bold",

    cursor: "pointer"

  },


  tripStatus: {

    marginTop: "15px",

    padding: "12px",

    background: "#fef2f2",

    color: "#b91c1c",

    borderRadius: "7px",

    textAlign: "center",

    fontWeight: "bold"

  },


  activeDot: {

    display: "inline-block",

    width: "8px",

    height: "8px",

    background: "#dc2626",

    borderRadius: "50%",

    marginRight: "7px"

  },


  tripId: {

    marginTop: "7px",

    fontSize: "12px",

    fontWeight: "normal"

  },


  message: {

    marginTop: "15px",

    textAlign: "center",

    fontWeight: "bold",

    fontSize: "14px"

  },


  journeyCard: {

    background: "white",

    borderRadius: "15px",

    padding: "22px",

    boxShadow:
      "0 4px 15px rgba(0,0,0,0.07)",

    marginBottom: "25px"

  },


  journeyGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(4, 1fr)",

    gap: "15px"

  },


  journeyItem: {

    background: "#f8fafc",

    padding: "15px",

    borderRadius: "8px",

    display: "flex",

    flexDirection: "column",

    gap: "6px"

  },


  alertCard: {

    background: "#fff7ed",

    border:
      "1px solid #fed7aa",

    borderRadius: "12px",

    padding: "18px",

    display: "flex",

    alignItems: "center",

    gap: "15px"

  },


  alertIcon: {

    fontSize: "35px"

  },


  alertTitle: {

    margin: "0 0 5px",

    color: "#c2410c"

  },


  alertText: {

    margin: "0",

    color: "#7c2d12"

  },


  footer: {

    textAlign: "center",

    padding: "20px",

    color: "#64748b",

    fontSize: "13px"

  }

};


export default AmbulanceDashboard;