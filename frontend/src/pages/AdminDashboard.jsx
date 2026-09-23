import { useEffect, useState } from "react";
import axios from "axios";


function AdminDashboard() {

  const [trips, setTrips] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingTrips, setLoadingTrips] = useState(true);


  // ==========================================
  // FETCH ACTIVE TRIPS
  // ==========================================

  const fetchActiveTrips = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/trips/active"
      );

      setTrips(
        response.data.trips || []
      );

      setLoadingTrips(false);

    } catch (error) {

      console.error(
        "Failed to fetch trips:",
        error
      );

      setLoadingTrips(false);

    }

  };


  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {

    fetchActiveTrips();


    const interval =
      setInterval(() => {

        fetchActiveTrips();

      }, 5000);


    return () => {

      clearInterval(interval);

    };

  }, []);


  // ==========================================
  // CALCULATE STATISTICS
  // ==========================================

  const activeAmbulances =
    trips.length;


  const criticalCases =
    trips.filter(
      (trip) =>
        trip.priority === "Critical"
    ).length;


  const seriousCases =
    trips.filter(
      (trip) =>
        trip.priority === "Serious"
    ).length;


  const moderateCases =
    trips.filter(
      (trip) =>
        trip.priority === "Moderate"
    ).length;


  const clearedTrips =
    trips.filter(
      (trip) =>
        trip.trafficClearance ===
        "CLEARED"
    ).length;


  const preparingTrips =
    trips.filter(
      (trip) =>
        trip.trafficClearance ===
        "PREPARING"
    ).length;


  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#eef6fb",
        fontFamily:
          "Arial, sans-serif",
        paddingBottom: "40px"
      }}
    >


      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <header
        style={{
          background: "white",
          padding: "20px 40px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}
      >

        <div
          style={{
            fontSize: "45px"
          }}
        >
          👨‍💼
        </div>


        <div>

          <h1
            style={{
              margin: 0,
              color: "#1e3a5f"
            }}
          >
            Administrator Dashboard
          </h1>


          <p
            style={{
              margin: "5px 0 0",
              color: "#64748b"
            }}
          >
            Smart Ambulance System Management
          </p>

        </div>

      </header>


      <main
        style={{
          maxWidth: "1500px",
          margin: "30px auto",
          padding: "0 25px"
        }}
      >


        {/* ===================================== */}
        {/* SYSTEM OVERVIEW */}
        {/* ===================================== */}

        <h2
          style={{
            color: "#1e3a5f",
            marginBottom: "20px"
          }}
        >
          📊 System Overview
        </h2>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "35px"
          }}
        >


          <div style={cardStyle}>

            <div style={iconStyle}>
              🚑
            </div>

            <div>

              <p style={labelStyle}>
                Active Ambulances
              </p>

              <h2 style={valueStyle}>
                {activeAmbulances}
              </h2>

            </div>

          </div>


          <div style={cardStyle}>

            <div style={iconStyle}>
              🚨
            </div>

            <div>

              <p style={labelStyle}>
                Active Emergencies
              </p>

              <h2 style={valueStyle}>
                {trips.length}
              </h2>

            </div>

          </div>


          <div style={cardStyle}>

            <div style={iconStyle}>
              🏥
            </div>

            <div>

              <p style={labelStyle}>
                Hospitals
              </p>

              <h2 style={valueStyle}>
                1
              </h2>

            </div>

          </div>


          <div style={cardStyle}>

            <div style={iconStyle}>
              👮
            </div>

            <div>

              <p style={labelStyle}>
                Traffic Police
              </p>

              <h2 style={valueStyle}>
                1
              </h2>

            </div>

          </div>


        </div>


        {/* ===================================== */}
        {/* EMERGENCY STATISTICS */}
        {/* ===================================== */}

        <section
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.08)",
            marginBottom: "30px"
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#1e3a5f"
            }}
          >
            🚨 Emergency Statistics
          </h2>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px"
            }}
          >

            <div
              style={statStyle}
            >

              <strong>
                Critical
              </strong>

              <span
                style={{
                  color: "#dc2626",
                  fontSize: "28px",
                  fontWeight: "bold"
                }}
              >
                {criticalCases}
              </span>

            </div>


            <div
              style={statStyle}
            >

              <strong>
                Serious
              </strong>

              <span
                style={{
                  color: "#ca8a04",
                  fontSize: "28px",
                  fontWeight: "bold"
                }}
              >
                {seriousCases}
              </span>

            </div>


            <div
              style={statStyle}
            >

              <strong>
                Moderate
              </strong>

              <span
                style={{
                  color: "#2563eb",
                  fontSize: "28px",
                  fontWeight: "bold"
                }}
              >
                {moderateCases}
              </span>

            </div>

          </div>

        </section>


        {/* ===================================== */}
        {/* TRAFFIC COORDINATION */}
        {/* ===================================== */}

        <section
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.08)",
            marginBottom: "30px"
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#1e3a5f"
            }}
          >
            🚦 Traffic Coordination
          </h2>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px"
            }}
          >

            <div style={trafficCardStyle}>

              <h3>
                🟡 Preparing
              </h3>

              <p
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#ca8a04"
                }}
              >
                {preparingTrips}
              </p>

            </div>


            <div style={trafficCardStyle}>

              <h3>
                🟢 Cleared
              </h3>

              <p
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#15803d"
                }}
              >
                {clearedTrips}
              </p>

            </div>


            <div style={trafficCardStyle}>

              <h3>
                🚦 Active Coordination
              </h3>

              <p
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#2563eb"
                }}
              >
                {preparingTrips +
                  clearedTrips}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================== */}
        {/* ACTIVE EMERGENCY TRIPS */}
        {/* ===================================== */}

        <section
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.08)"
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#1e3a5f"
            }}
          >
            🚑 Active Emergency Trips
          </h2>


          {loadingTrips ? (

            <p>
              Loading emergency trips...
            </p>

          ) : trips.length === 0 ? (

            <div
              style={{
                padding: "30px",
                background:
                  "#f8fafc",
                borderRadius: "10px",
                textAlign: "center",
                color: "#64748b"
              }}
            >

              No active emergency trips.

            </div>

          ) : (

            trips.map((trip) => (

              <div
                key={trip._id}
                style={{
                  border:
                    "1px solid #dbe4ee",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "15px",
                  background:
                    "#fbfdff"
                }}
              >

                <h3
                  style={{
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
                    Hospital:
                  </strong>{" "}
                  {trip.hospital}
                </p>


                <p>
                  <strong>
                    Traffic Clearance:
                  </strong>{" "}

                  <span
                    style={{
                      fontWeight: "bold",
                      color:
                        trip.trafficClearance ===
                        "CLEARED"
                          ? "#15803d"
                          : trip.trafficClearance ===
                            "PREPARING"
                          ? "#ca8a04"
                          : "#64748b"
                    }}
                  >
                    {trip.trafficClearance ||
                      "PENDING"}
                  </span>

                </p>


                <p>
                  <strong>
                    Location:
                  </strong>{" "}

                  {trip.currentLocation?.latitude?.toFixed(6)}
                  {" , "}
                  {trip.currentLocation?.longitude?.toFixed(6)}

                </p>

              </div>

            ))

          )}

        </section>


      </main>

    </div>

  );

}


// ==========================================
// STYLES
// ==========================================

const cardStyle = {

  background: "white",

  borderRadius: "15px",

  padding: "25px",

  display: "flex",

  alignItems: "center",

  gap: "18px",

  boxShadow:
    "0 5px 18px rgba(0,0,0,0.08)"

};


const iconStyle = {

  fontSize: "40px"

};


const labelStyle = {

  margin: 0,

  color: "#64748b",

  fontSize: "15px"

};


const valueStyle = {

  margin: "5px 0 0",

  color: "#1e3a5f",

  fontSize: "30px"

};


const statStyle = {

  background: "#f8fafc",

  padding: "20px",

  borderRadius: "10px",

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center"

};


const trafficCardStyle = {

  background: "#f8fafc",

  padding: "20px",

  borderRadius: "10px",

  textAlign: "center"

};


export default AdminDashboard;