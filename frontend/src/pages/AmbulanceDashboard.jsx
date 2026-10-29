import {
  useEffect,
  useState,
  useCallback,
  useRef
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
// DEMO STARTING LOCATIONS
// ==========================================

const demoStartingLocations = {

  "CURRENT_GPS": {
    name: "Current GPS Location",
    latitude: null,
    longitude: null
  },

  "HYDERABAD": {
    name: "Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867
  },

  "VIJAYAWADA": {
    name: "Vijayawada",
    latitude: 16.5062,
    longitude: 80.6480
  },

  "VISAKHAPATNAM": {
    name: "Visakhapatnam",
    latitude: 17.6868,
    longitude: 83.2185
  },

  "VIZIANAGARAM": {
    name: "Vizianagaram",
    latitude: 18.1067,
    longitude: 83.3956
  },

  "GUNTUR": {
    name: "Guntur",
    latitude: 16.3067,
    longitude: 80.4365
  },

  "BENGALURU": {
    name: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946
  }

};


// ==========================================
// DESTINATION OPTIONS
// ==========================================

const destinationOptions = {

  "City Hospital": {
    name: "City Hospital",
    latitude: 17.3850,
    longitude: 78.4867
  },

  "Apollo Hospital": {
    name: "Apollo Hospital",
    latitude: 17.4254,
    longitude: 78.4111
  },

  "Government General Hospital": {
    name: "Government General Hospital",
    latitude: 17.3895,
    longitude: 78.4760
  },

  "Hyderabad": {
    name: "Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867
  },

  "Vijayawada": {
    name: "Vijayawada",
    latitude: 16.5062,
    longitude: 80.6480
  },

  "Visakhapatnam": {
    name: "Visakhapatnam",
    latitude: 17.6868,
    longitude: 83.2185
  },

  "Vizianagaram": {
    name: "Vizianagaram",
    latitude: 18.1067,
    longitude: 83.3956
  },

  "Guntur": {
    name: "Guntur",
    latitude: 16.3067,
    longitude: 80.4365
  },

  "Bengaluru": {
    name: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946
  }

};


// ==========================================
// AMBULANCE DASHBOARD
// ==========================================

function AmbulanceDashboard() {

  // ==========================================
  // AMBULANCE ID
  // ==========================================

  const [ambulanceId, setAmbulanceId] =
    useState("AMB-001");

  const [customAmbulanceId, setCustomAmbulanceId] =
    useState("");


  // ==========================================
  // TRIP STATE
  // ==========================================

  const [tripStarted, setTripStarted] =
    useState(false);

  const [tripId, setTripId] =
    useState(null);


  // ==========================================
  // EMERGENCY STATE
  // ==========================================

  const [priority, setPriority] =
    useState("Critical");

  const [hospital, setHospital] =
    useState("City Hospital");

  // ==========================================
  // DESTINATION CONTROL
  // ==========================================

  const [destinationSelection, setDestinationSelection] =
    useState("City Hospital");

  const [customDestination, setCustomDestination] =
    useState("");

  const [destinationLocation, setDestinationLocation] =
    useState(destinationOptions["City Hospital"]);

  const [destinationStatus, setDestinationStatus] =
    useState("");

  // ==========================================
  // NEARBY HOSPITALS
  // ==========================================

  const [nearbyHospitals, setNearbyHospitals] =
    useState([]);

  const [nearbyHospitalLoading, setNearbyHospitalLoading] =
    useState(false);

  const [nearbyHospitalStatus, setNearbyHospitalStatus] =
    useState("");


  // ==========================================
  // DEMO STARTING POINT
  // ==========================================

  const [startingPoint, setStartingPoint] =
    useState("CURRENT_GPS");


  // ==========================================
  // GPS STATE
  // ==========================================

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null
  });

  const locationRef = useRef({
    latitude: null,
    longitude: null
  });

  const [gpsStatus, setGpsStatus] =
    useState("Checking GPS...");

  const [gpsAccuracy, setGpsAccuracy] =
    useState(null);

  // Optional manual starting location for laptops when browser GPS is inaccurate.
  const [manualStartSearch, setManualStartSearch] =
    useState("");

  const [manualStartLocation, setManualStartLocation] =
    useState(null);

  const [manualStartStatus, setManualStartStatus] =
    useState("");


  // ==========================================
  // MESSAGE
  // ==========================================

  const [tripMessage, setTripMessage] =
    useState("");


  // ==========================================
  // ROUTE INFORMATION
  // ==========================================

  const [routeDistance, setRouteDistance] =
    useState(null);

  const [routeTime, setRouteTime] =
    useState(null);


  // ==========================================
  // FINAL AMBULANCE ID
  // ==========================================

  const finalAmbulanceId =
    ambulanceId === "CUSTOM"
      ? customAmbulanceId.trim()
      : ambulanceId;


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

          const currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          locationRef.current = currentLocation;

          setLocation(currentLocation);

          setGpsAccuracy(
            position.coords.accuracy ?? null
          );

          setGpsStatus("Active");
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

    // When a fixed demo starting point is selected,
    // keep that location for the demonstration route.
    // Live GPS updates are used only in Current GPS mode.
    if (startingPoint !== "CURRENT_GPS") {
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
    tripId,
    startingPoint
  ]);


  // ==========================================
  // GET SELECTED HOSPITAL
  // ==========================================

  const selectedNearbyHospital =
    nearbyHospitals.find(
      (item) =>
        item.id === destinationSelection
    );

  const selectedDestination =
    destinationSelection.startsWith("NEARBY-")
      ? selectedNearbyHospital
      : (destinationLocation ||
        destinationOptions[destinationSelection] ||
        null);


  // ==========================================
  // FIND CUSTOM DESTINATION
  // ==========================================

  const findCustomDestination =
    async () => {

      const query = customDestination.trim();

      if (!query) {
        setDestinationStatus(
          "❌ Please enter a destination"
        );
        return;
      }

      setDestinationStatus(
        "🔎 Finding destination..."
      );

      try {

        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`,
            {
              headers: {
                Accept: "application/json"
              }
            }
          );

        if (!response.ok) {
          throw new Error("Geocoding request failed");
        }

        const results = await response.json();

        if (!results.length) {
          setDestinationStatus(
            "❌ Destination not found. Try a city, hospital, area or landmark."
          );
          return;
        }

        const result = results[0];

        const coordinates = {
          name: result.display_name,
          latitude: Number(result.lat),
          longitude: Number(result.lon)
        };

        setDestinationLocation(
          coordinates
        );

        setHospital(
          query
        );

        setDestinationStatus(
          "✅ Destination found"
        );

        setRouteDistance(null);
        setRouteTime(null);

      } catch (error) {

        console.error(
          "Destination search error:",
          error
        );

        setDestinationStatus(
          "❌ Could not find destination. Please try again."
        );
      }
    };


  // ==========================================
  // SEARCH STARTING LOCATION
  // ==========================================

  const findManualStartingLocation =
    async () => {

      const query = manualStartSearch.trim();

      if (!query) {
        setManualStartStatus(
          "❌ Enter a place, area, village or address"
        );
        return;
      }

      setManualStartStatus(
        "🔎 Finding starting location..."
      );

      try {

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`,
          {
            headers: {
              Accept: "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error("Starting location search failed");
        }

        const results = await response.json();

        if (!results.length) {
          setManualStartStatus(
            "❌ Location not found. Try adding district or state."
          );
          return;
        }

        const result = results[0];

        const coordinates = {
          name: result.display_name,
          latitude: Number(result.lat),
          longitude: Number(result.lon)
        };

        setManualStartLocation(coordinates);
        setStartingPoint("CURRENT_GPS");
        setRouteDistance(null);
        setRouteTime(null);

        setManualStartStatus(
          `✅ Starting location set to ${result.display_name}`
        );

      } catch (error) {

        console.error(
          "Starting location search error:",
          error
        );

        setManualStartStatus(
          "❌ Could not find starting location. Try again."
        );
      }
    };


  const clearManualStartingLocation = () => {
    setManualStartLocation(null);
    setManualStartSearch("");
    setManualStartStatus(
      "📍 Using live browser GPS location"
    );
    setRouteDistance(null);
    setRouteTime(null);
  };


  // ==========================================
  // FIND NEARBY HOSPITALS
  // ==========================================

  const findNearbyHospitals =
    async () => {

      const searchLocation =
        manualStartLocation ||
        (startingPoint === "CURRENT_GPS"
          ? locationRef.current
          : selectedStartingPoint);

      if (
        !searchLocation ||
        searchLocation.latitude === null ||
        searchLocation.latitude === undefined ||
        searchLocation.longitude === null ||
        searchLocation.longitude === undefined
      ) {
        setNearbyHospitalStatus(
          "❌ Location is not available yet. Please wait for GPS."
        );
        return;
      }

      setNearbyHospitalLoading(true);
      setNearbyHospitalStatus(
        "🔎 Finding nearby hospitals..."
      );

      try {

        const latitude = Number(searchLocation.latitude);
        const longitude = Number(searchLocation.longitude);
        const radius = 10000;

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          throw new Error("Invalid GPS coordinates");
        }

        const query = `
          [out:json][timeout:30];
          (
            nwr[amenity=hospital](around:${radius},${latitude},${longitude});
            nwr[healthcare=hospital](around:${radius},${latitude},${longitude});
          );
          out center tags;
        `;

        // Try more than one Overpass server. Public Overpass servers
        // can temporarily reject requests or become busy.
        const endpoints = [
          "https://overpass-api.de/api/interpreter",
          "https://overpass.kumi.systems/api/interpreter",
          "https://overpass.private.coffee/api/interpreter"
        ];

        let data = null;
        let lastError = null;

        for (const endpoint of endpoints) {
          try {

            const response = await fetch(
              `${endpoint}?data=${encodeURIComponent(query)}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json"
                }
              }
            );

            if (!response.ok) {
              throw new Error(
                `${response.status} ${response.statusText}`
              );
            }

            data = await response.json();
            break;

          } catch (error) {
            console.warn(
              `Hospital search endpoint failed: ${endpoint}`,
              error
            );
            lastError = error;
          }
        }

        if (!data) {
          throw new Error(
            lastError?.message ||
            "All hospital search servers failed"
          );
        }

        const hospitals = (data.elements || [])
          .map((item) => {

            const hospitalLatitude =
              item.lat ?? item.center?.lat;

            const hospitalLongitude =
              item.lon ?? item.center?.lon;

            if (
              hospitalLatitude === undefined ||
              hospitalLongitude === undefined
            ) {
              return null;
            }

            const name =
              item.tags?.name ||
              item.tags?.official_name ||
              item.tags?.short_name ||
              "Unnamed Hospital";

            const distance =
              calculateDistanceKm(
                latitude,
                longitude,
                Number(hospitalLatitude),
                Number(hospitalLongitude)
              );

            return {
              // Keep the NEARBY- prefix because the destination
              // selector uses it to recognize nearby hospitals.
              id: `NEARBY-${item.type}-${item.id}`,
              name,
              latitude: Number(hospitalLatitude),
              longitude: Number(hospitalLongitude),
              distance
            };

          })
          .filter(Boolean)
          .sort(
            (a, b) => a.distance - b.distance
          );

        const uniqueHospitals =
          hospitals.filter(
            (hospitalItem, index, array) =>
              index ===
              array.findIndex(
                (item) =>
                  item.name === hospitalItem.name &&
                  Math.abs(
                    item.latitude - hospitalItem.latitude
                  ) < 0.0001 &&
                  Math.abs(
                    item.longitude - hospitalItem.longitude
                  ) < 0.0001
              )
          );

        setNearbyHospitals(
          uniqueHospitals.slice(0, 20)
        );

        if (uniqueHospitals.length === 0) {
          setNearbyHospitalStatus(
            "⚠️ No hospitals found within 10 km"
          );
        } else {
          setNearbyHospitalStatus(
            `✅ Found ${Math.min(uniqueHospitals.length, 20)} nearby hospitals`
          );
        }

      } catch (error) {

        console.error(
          "Nearby hospital search error:",
          error
        );

        setNearbyHospitalStatus(
          "❌ Could not load nearby hospitals. Please check your internet connection and try again."
        );

      } finally {
        setNearbyHospitalLoading(false);
      }
    };


  // ==========================================
  // DISTANCE HELPER
  // ==========================================

  const calculateDistanceKm =
    (lat1, lon1, lat2, lon2) => {

      const earthRadius = 6371;

      const dLat =
        (lat2 - lat1) * Math.PI / 180;

      const dLon =
        (lon2 - lon1) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

      const c =
        2 * Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a)
        );

      return earthRadius * c;
    };


  // ==========================================
  // AUTO REFRESH NEARBY HOSPITALS
  // ==========================================

  useEffect(() => {

    const effectiveLocation =
      manualStartLocation ||
      (startingPoint === "CURRENT_GPS"
        ? location
        : selectedStartingPoint);

    if (
      !effectiveLocation ||
      effectiveLocation.latitude === null ||
      effectiveLocation.longitude === null
    ) {
      return;
    }

    findNearbyHospitals();

    const intervalId =
      setInterval(
        findNearbyHospitals,
        60000
      );

    return () => {
      clearInterval(intervalId);
    };

    // Only start the automatic refresh when GPS becomes available.
    // The ref keeps the latest GPS coordinates without triggering a
    // hospital API request for every small GPS movement.
  }, [
    startingPoint,
    manualStartLocation?.latitude,
    manualStartLocation?.longitude,
    location.latitude !== null &&
    location.longitude !== null
  ]);


  // ==========================================
  // SELECTED ROUTE START LOCATION
  // ==========================================

  const selectedStartingPoint =
    demoStartingLocations[startingPoint] ||
    demoStartingLocations.CURRENT_GPS;

  const routeStartLocation =
    manualStartLocation ||
    (startingPoint === "CURRENT_GPS"
      ? location
      : selectedStartingPoint);


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

      if (kilometers < 1) {

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
        Math.round(seconds / 60);


      if (minutes < 1) {
        return "Less than 1 min";
      }


      if (minutes === 1) {
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


      // CHECK AMBULANCE ID

      if (!finalAmbulanceId) {

        setTripMessage(
          "❌ Please enter an ambulance ID"
        );

        return;
      }


      // CHECK STARTING LOCATION
      const tripStartLocation =
        manualStartLocation ||
        (startingPoint === "CURRENT_GPS"
          ? location
          : selectedStartingPoint);

      if (
        tripStartLocation.latitude === null ||
        tripStartLocation.longitude === null
      ) {

        setTripMessage(
          "❌ Starting location is not available yet"
        );

        return;
      }

      if (
        !selectedDestination ||
        selectedDestination.latitude === null ||
        selectedDestination.longitude === null
      ) {

        setTripMessage(
          "❌ Please select or find a destination first"
        );

        return;
      }


      try {

        const response =
          await axios.post(

            "http://localhost:5000/api/trips/start",

            {
              ambulanceId:
                finalAmbulanceId,

              priority:
                priority,

              hospital:
                hospital,

              latitude:
                tripStartLocation.latitude,

              longitude:
                tripStartLocation.longitude
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

        setTripStarted(true);


        // RESET ROUTE

        setRouteDistance(null);

        setRouteTime(null);


        setTripMessage(
          `✅ Emergency trip started for ${finalAmbulanceId}`
        );


      } catch (error) {

        console.error(
          "Start trip error:",
          error
        );


        if (error.response) {

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

        setTripStarted(false);

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


        setTripStarted(false);

        setTripId(null);

        setRouteDistance(null);

        setRouteTime(null);


        setTripMessage(
          `✅ ${finalAmbulanceId} trip completed successfully`
        );


      } catch (error) {

        console.error(
          "End trip error:",
          error
        );


        if (error.response) {

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


      {/* HEADER */}

      <header style={styles.header}>

        <div style={styles.headerLeft}>

          <div style={styles.logo}>
            🚑
          </div>

          <div>

            <h1 style={styles.title}>
              Smart Ambulance
            </h1>

            <p style={styles.subtitle}>
              Ambulance Control Dashboard
            </p>

          </div>

        </div>


        <div style={styles.status}>

          <span style={styles.statusDot} />

          System Online

        </div>

      </header>


      <main style={styles.main}>


        {/* WELCOME */}

        <section style={styles.welcomeCard}>

          <div>

            <h2 style={styles.welcomeTitle}>
              Welcome, Ambulance Team 🚑
            </h2>

            <p style={styles.welcomeText}>
              Manage your emergency trip,
              GPS location, priority and
              hospital coordination.
            </p>

          </div>


          <div style={styles.ambulanceNumber}>

            <span>
              Active Ambulance
            </span>

            <strong>
              {finalAmbulanceId || "Not Set"}
            </strong>

          </div>

        </section>


        {/* STATS */}

        <section style={styles.statsGrid}>


          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              📍
            </div>

            <div>

              <p style={styles.statLabel}>
                GPS Status
              </p>

              <h3 style={styles.statValue}>
                {gpsStatus}
              </h3>

            </div>

          </div>


          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              🚨
            </div>

            <div>

              <p style={styles.statLabel}>
                Emergency
              </p>

              <h3 style={styles.statValue}>
                {priority}
              </h3>

            </div>

          </div>


          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              ⏱️
            </div>

            <div>

              <p style={styles.statLabel}>
                ETA
              </p>

              <h3 style={styles.statValue}>
                {formatETA(routeTime)}
              </h3>

            </div>

          </div>


          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              🏥
            </div>

            <div>

              <p style={styles.statLabel}>
                Hospital
              </p>

              <h3 style={styles.statValue}>
                {hospital}
              </h3>

            </div>

          </div>


        </section>


        {/* ROUTE MAP */}

        <section style={styles.routeCard}>

          <div style={styles.cardHeader}>

            <h2>
              🗺️ Smart Route & Live Navigation
            </h2>

            <span style={styles.liveBadge}>
              LIVE ROUTE
            </span>

          </div>


          
<RouteMap
  latitude={routeStartLocation.latitude}
  longitude={routeStartLocation.longitude}
  hospitalLatitude={
    selectedDestination
      ? selectedDestination.latitude
      : null
  }
  hospitalLongitude={
    selectedDestination
      ? selectedDestination.longitude
      : null
  }
  onRouteFound={handleRouteFound}
  tripId={tripId}
  ambulanceId={finalAmbulanceId}
  priority={priority}
/>


        


          <div style={styles.routeInfoGrid}>

            <div style={styles.routeInfoBox}>

              <span>
                📏 Route Distance
              </span>

              <strong>
                {formatDistance(
                  routeDistance
                )}
              </strong>

            </div>


            <div style={styles.routeInfoBox}>

              <span>
                ⏱️ Estimated Arrival
              </span>

              <strong>
                {formatETA(routeTime)}
              </strong>

            </div>


            <div style={styles.routeInfoBox}>

              <span>
                🏥 Destination
              </span>

              <strong>
                {hospital}
              </strong>

            </div>

          </div>

        </section>


        {/* DASHBOARD GRID */}

        <section style={styles.dashboardGrid}>


          {/* LIVE MAP */}

          <div style={styles.mapCard}>

            <div style={styles.cardHeader}>

              <h2>
                📍 Live Ambulance Location
              </h2>

              <span style={styles.liveBadge}>
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


            <div style={styles.coordinates}>

              <div style={styles.coordinateBox}>

                <span>
                  Latitude
                </span>

                <strong>

                  {location.latitude !== null
                    ? location.latitude.toFixed(6)
                    : "Waiting..."}

                </strong>

              </div>


              <div style={styles.coordinateBox}>

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

            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                background: "#f0fdf4",
                borderRadius: "8px",
                color: "#166534",
                fontSize: "13px"
              }}
            >
              {manualStartLocation
                ? `📍 Using searched location: ${manualStartLocation.name}`
                : gpsAccuracy !== null
                  ? `📡 GPS accuracy: approximately ${Math.round(gpsAccuracy)} m`
                  : "📡 GPS accuracy: waiting..."}
            </div>

          </div>


          {/* EMERGENCY CONTROL */}

          <div style={styles.controlCard}>

            <div style={styles.cardHeader}>

              <h2>
                🚨 Emergency Control
              </h2>

            </div>


            {/* AMBULANCE ID */}

            <label style={styles.label}>
              Ambulance ID
            </label>


            <select

              value={ambulanceId}

              onChange={(e) => {

                setAmbulanceId(
                  e.target.value
                );

                setTripMessage("");

              }}

              style={styles.select}

              disabled={tripStarted}

            >

              <option value="AMB-001">
                AMB-001
              </option>

              <option value="AMB-002">
                AMB-002
              </option>

              <option value="AMB-003">
                AMB-003
              </option>

              <option value="AMB-004">
                AMB-004
              </option>

              <option value="CUSTOM">
                ✏️ Enter Custom ID
              </option>

            </select>


            {/* CUSTOM ID */}

            {ambulanceId === "CUSTOM" && (

              <input

                type="text"

                value={
                  customAmbulanceId
                }

                onChange={(e) =>
                  setCustomAmbulanceId(
                    e.target.value
                  )
                }

                placeholder="Example: AMB-101"

                style={styles.input}

                disabled={tripStarted}

              />

            )}

            {/* DESTINATION */}

            <label style={styles.label}>
              Destination
            </label>

            <select

              value={destinationSelection}

              onChange={(e) => {

                const value = e.target.value;

                setDestinationSelection(value);

                setDestinationStatus(
                  ""
                );

                setRouteDistance(null);
                setRouteTime(null);

                if (value.startsWith("NEARBY-")) {

                  const selectedNearby =
                    nearbyHospitals.find(
                      (item) => item.id === value
                    );

                  setDestinationLocation(
                    selectedNearby || null
                  );

                  setHospital(
                    selectedNearby
                      ? selectedNearby.name
                      : "Nearby Hospital"
                  );

                } else if (value !== "CUSTOM") {

                  const selected =
                    destinationOptions[value];

                  setDestinationLocation(
                    selected
                  );

                  setHospital(
                    value
                  );

                } else {

                  setDestinationLocation(
                    null
                  );

                  setHospital(
                    "Custom Destination"
                  );
                }

              }}

              style={styles.select}

              disabled={tripStarted}

            >

              <option value="City Hospital">
                🏥 City Hospital
              </option>

              <option value="Apollo Hospital">
                🏥 Apollo Hospital
              </option>

              <option value="Government General Hospital">
                🏥 Government General Hospital
              </option>

              <option value="Hyderabad">
                📍 Hyderabad
              </option>

              <option value="Vijayawada">
                📍 Vijayawada
              </option>

              <option value="Visakhapatnam">
                📍 Visakhapatnam
              </option>

              <option value="Vizianagaram">
                📍 Vizianagaram
              </option>

              <option value="Guntur">
                📍 Guntur
              </option>

              <option value="Bengaluru">
                📍 Bengaluru
              </option>

              {nearbyHospitals.length > 0 && (
                <>
                  <option disabled>
                    ── Nearby Hospitals ──
                  </option>

                  {nearbyHospitals.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      🏥 {item.name} ({item.distance.toFixed(1)} km)
                    </option>
                  ))}
                </>
              )}

              <option value="CUSTOM">
                ✏️ Enter Any Destination
              </option>

            </select>


            <button

              type="button"

              onClick={findNearbyHospitals}

              style={styles.destinationButton}

              disabled={
                tripStarted ||
                nearbyHospitalLoading
              }

            >
              {nearbyHospitalLoading
                ? "🔄 Finding Hospitals..."
                : "🏥 Find Nearby Hospitals"}

            </button>

            {nearbyHospitalStatus && (

              <div
                style={styles.destinationStatus}
              >
                {nearbyHospitalStatus}
              </div>

            )}


            {destinationSelection === "CUSTOM" && (

              <div>

                <input

                  type="text"

                  value={customDestination}

                  onChange={(e) => {
                    setCustomDestination(
                      e.target.value
                    );
                    setDestinationStatus(
                      ""
                    );
                  }}

                  placeholder="Example: Vizianagaram, Andhra Pradesh"

                  style={styles.input}

                  disabled={tripStarted}

                />

                <button

                  type="button"

                  onClick={
                    findCustomDestination
                  }

                  style={styles.destinationButton}

                  disabled={tripStarted}

                >
                  🔎 Find Destination
                </button>

                {destinationStatus && (

                  <div
                    style={styles.destinationStatus}
                  >
                    {destinationStatus}
                  </div>

                )}

              </div>

            )}


            {selectedDestination && (

              <div
                style={styles.destinationPreview}
              >
                📍 <strong>Destination:</strong>{" "}
                {selectedDestination.name || hospital}
              </div>

            )}


            {/* START / END */}

            {!tripStarted ? (

              <button

                style={styles.startButton}

                onClick={
                  startTrip
                }

              >

                🚨 Start Emergency Trip

              </button>

            ) : (

              <button

                style={styles.stopButton}

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
                style={styles.tripStatus}
              >

                <span
                  style={styles.activeDot}
                />

                {finalAmbulanceId}
                {" "}
                emergency trip is active

                {tripId && (

                  <div
                    style={styles.tripId}
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
                    tripMessage.startsWith("✅")
                      ? "#15803d"
                      : "#dc2626"
                }}

              >

                {tripMessage}

              </div>

            )}

          </div>

        </section>


        {/* JOURNEY INFORMATION */}

        <section style={styles.journeyCard}>

          <div style={styles.cardHeader}>

            <h2>
              🛣️ Journey Information
            </h2>

          </div>


          <div style={styles.journeyGrid}>


            <div style={styles.journeyItem}>

              <span>
                Ambulance ID
              </span>

              <strong>
                {finalAmbulanceId || "Not Set"}
              </strong>

            </div>


            <div style={styles.journeyItem}>

              <span>
                Starting Point
              </span>

              <strong>

                {manualStartLocation
                  ? manualStartLocation.name
                  : startingPoint === "CURRENT_GPS"
                    ? (
                      location.latitude !== null &&
                      location.longitude !== null
                        ? `Current GPS (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
                        : "Waiting for GPS..."
                    )
                    : selectedStartingPoint.name}

              </strong>

            </div>


            <div style={styles.journeyItem}>

              <span>
                Destination
              </span>

              <strong>
                {hospital}
              </strong>

            </div>


            <div style={styles.journeyItem}>

              <span>
                Distance
              </span>

              <strong>
                {formatDistance(
                  routeDistance
                )}
              </strong>

            </div>


            <div style={styles.journeyItem}>

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


        {/* TRAFFIC ALERT */}

        <section style={styles.alertCard}>

          <div style={styles.alertIcon}>
            🚦
          </div>

          <div>

            <h3 style={styles.alertTitle}>
              Traffic Coordination
            </h3>

            <p style={styles.alertText}>
              Traffic police will receive
              alerts for upcoming junctions
              when an emergency trip is active.
            </p>

          </div>

        </section>


      </main>


      <footer style={styles.footer}>

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
    fontFamily: "Arial, sans-serif",
    color: "#1f2937"
  },

  header: {
    background: "#0f6fae",
    color: "white",
    padding: "18px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    justifyContent: "space-between",
    alignItems: "center",
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
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
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
    justifyContent: "space-between",
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
    background: "white",
    boxSizing: "border-box"
  },

  input: {
    width: "100%",
    padding: "12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "15px",
    background: "white",
    boxSizing: "border-box",
    marginTop: "10px"
  },

  destinationButton: {
    width: "100%",
    marginTop: "10px",
    padding: "11px",
    border: "none",
    borderRadius: "7px",
    background: "#0f6fae",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  destinationStatus: {
    marginTop: "8px",
    fontSize: "13px",
    fontWeight: "bold"
  },

  clearLocationButton: {
    width: "100%",
    marginTop: "8px",
    padding: "10px",
    border: "1px solid #94a3b8",
    borderRadius: "7px",
    background: "#f8fafc",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  destinationPreview: {
    marginTop: "10px",
    padding: "10px",
    background: "#f0f9ff",
    color: "#075985",
    borderRadius: "7px",
    fontSize: "13px"
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
      "repeat(5, 1fr)",
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