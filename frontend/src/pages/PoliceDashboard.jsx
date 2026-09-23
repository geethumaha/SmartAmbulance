import { useEffect, useState } from "react";
import axios from "axios";

import PoliceMap from "../components/PoliceMap";
import JunctionAlertList from "../components/JunctionAlertList";
import TrafficSignal from "../components/TrafficSignal";


function PoliceDashboard() {

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);


  // ==========================================
  // FETCH ACTIVE AMBULANCE TRIPS
  // ==========================================

  const fetchActiveTrips = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:5000/api/trips/active"
        );

      setTrips(
        response.data.trips || []
      );

      setLoading(false);

    } catch (error) {

      console.error(
        "Failed to fetch active trips:",
        error
      );

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD ACTIVE TRIPS
  // ==========================================

  useEffect(() => {

    fetchActiveTrips();


    const interval =
      setInterval(() => {

        fetchActiveTrips();

      }, 5000);


    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  // ==========================================
  // CHECK EMERGENCY STATUS
  // ==========================================

  const emergencyActive =
    trips.some(
      (trip) =>
        trip.trafficClearance ===
          "PREPARING" ||
        trip.trafficClearance ===
          "CLEARED"
    );


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

      {/* ======================================
          HEADER
      ====================================== */}

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
          👮
        </div>


        <div>

          <h1
            style={{
              margin: 0,
              color: "#1e3a5f"
            }}
          >
            Traffic Police Dashboard
          </h1>


          <p
            style={{
              margin: "5px 0 0",
              color: "#64748b"
            }}
          >
            Smart Ambulance Emergency
            Coordination
          </p>

        </div>

      </header>


      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main
        style={{
          maxWidth: "1500px",
          margin: "30px auto",
          padding: "0 25px"
        }}
      >

        {/* ====================================
            STATISTICS
        ==================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}
        >

          {/* ACTIVE AMBULANCES */}

          <div style={cardStyle}>

            <div style={cardIconStyle}>
              🚑
            </div>

            <div>

              <p style={cardLabelStyle}>
                Active Ambulances
              </p>

              <h2 style={cardValueStyle}>
                {trips.length}
              </h2>

            </div>

          </div>


          {/* EMERGENCY TRIPS */}

          <div style={cardStyle}>

            <div style={cardIconStyle}>
              🚨
            </div>

            <div>

              <p style={cardLabelStyle}>
                Emergency Trips
              </p>

              <h2 style={cardValueStyle}>
                {trips.length}
              </h2>

            </div>

          </div>


          {/* JUNCTION ALERTS */}

          <div style={cardStyle}>

            <div style={cardIconStyle}>
              🚦
            </div>

            <div>

              <p style={cardLabelStyle}>
                Junction Alerts
              </p>

              <h2 style={cardValueStyle}>
                {trips.length}
              </h2>

            </div>

          </div>


          {/* SYSTEM STATUS */}

          <div style={cardStyle}>

            <div style={cardIconStyle}>
              🟢
            </div>

            <div>

              <p style={cardLabelStyle}>
                System Status
              </p>

              <h2
                style={{
                  ...cardValueStyle,
                  color: "#15803d",
                  fontSize: "20px"
                }}
              >
                ONLINE
              </h2>

            </div>

          </div>

        </div>


        {/* ====================================
            ACTIVE AMBULANCES
        ==================================== */}

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
            🚑 Active Ambulances
          </h2>


          {loading ? (

            <p>
              Loading active ambulances...
            </p>

          ) : trips.length === 0 ? (

            <div
              style={{
                padding: "25px",
                background:
                  "#f8fafc",
                borderRadius: "10px",
                textAlign: "center",
                color: "#64748b"
              }}
            >
              No active ambulances
              currently.
            </div>

          ) : (

            trips.map((trip) => (

              <div
                key={trip._id}
                style={{
                  border:
                    "1px solid #dbe4ee",
                  borderRadius: "12px",
                  padding: "25px",
                  marginBottom: "20px",
                  background:
                    "#fbfdff"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: 0,
                        color: "#1e3a5f"
                      }}
                    >
                      🚑{" "}
                      {trip.ambulanceId}
                    </h2>


                    <p
                      style={{
                        color: "#64748b"
                      }}
                    >
                      Trip ID:{" "}
                      {trip._id}
                    </p>

                  </div>


                  <span
                    style={{
                      background:
                        trip.priority ===
                        "Critical"
                          ? "#fee2e2"
                          : "#fef3c7",

                      color:
                        trip.priority ===
                        "Critical"
                          ? "#dc2626"
                          : "#92400e",

                      padding:
                        "10px 18px",

                      borderRadius:
                        "20px",

                      fontWeight:
                        "bold"
                    }}
                  >
                    {trip.priority}
                  </span>

                </div>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginTop: "20px"
                  }}
                >

                  <div>

                    <strong>
                      🏥 Hospital
                    </strong>

                    <p>
                      {trip.hospital}
                    </p>

                  </div>


                  <div>

                    <strong>
                      📍 Location
                    </strong>

                    <p>
                      {trip.currentLocation?.latitude?.toFixed(6)}
                      {" , "}
                      {trip.currentLocation?.longitude?.toFixed(6)}
                    </p>

                  </div>


                  <div>

                    <strong>
                      🚦 Clearance
                    </strong>

                    <p
                      style={{
                        color:
                          trip.trafficClearance ===
                          "CLEARED"
                            ? "#15803d"
                            : trip.trafficClearance ===
                              "PREPARING"
                            ? "#ca8a04"
                            : "#64748b",

                        fontWeight:
                          "bold"
                      }}
                    >
                      {trip.trafficClearance ||
                        "PENDING"}
                    </p>

                  </div>

                </div>


                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    background:
                      "#fff7ed",
                    borderRadius: "8px",
                    color: "#c2410c",
                    fontWeight:
                      "bold"
                  }}
                >
                  🚨 Ambulance is
                  currently on an
                  emergency trip.
                </div>

              </div>

            ))

          )}

        </section>


        {/* ====================================
            LIVE AMBULANCE MAP
        ==================================== */}

        <section
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            marginTop: "30px",
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
            🗺️ Live Ambulance Tracking
          </h2>


          {trips.length > 0 ? (

            <PoliceMap
              trips={trips}
            />

          ) : (

            <div
              style={{
                height: "300px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "#f8fafc",
                borderRadius: "12px",
                color: "#64748b"
              }}
            >
              No active ambulance
              to display.
            </div>

          )}

        </section>


        {/* ====================================
            REAL JUNCTION ALERTS
        ==================================== */}

        {trips.map((trip) => (

          <JunctionAlertList
            key={trip._id}
            tripId={trip._id}
          />

        ))}


        {/* ====================================
            TRAFFIC SIGNAL
        ==================================== */}

        <TrafficSignal
          emergencyActive={
            emergencyActive
          }
        />

      </main>

    </div>

  );

}


// ==========================================
// CARD STYLES
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


const cardIconStyle = {

  fontSize: "40px"

};


const cardLabelStyle = {

  margin: 0,

  color: "#64748b",

  fontSize: "15px"

};


const cardValueStyle = {

  margin: "5px 0 0",

  color: "#1e3a5f",

  fontSize: "30px"

};


export default PoliceDashboard;