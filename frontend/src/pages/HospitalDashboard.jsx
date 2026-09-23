import { useEffect, useState } from "react";
import axios from "axios";


function HospitalDashboard() {

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);


  // ==========================================
  // FETCH ACTIVE AMBULANCES
  // ==========================================

  const fetchIncomingAmbulances = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/trips/active"
      );


      setTrips(
        response.data.trips || []
      );


      setLoading(false);

    } catch (error) {

      console.error(
        "Failed to fetch incoming ambulances:",
        error
      );


      setLoading(false);

    }

  };


  // ==========================================
  // LOAD + REFRESH EVERY 5 SECONDS
  // ==========================================

  useEffect(() => {

    fetchIncomingAmbulances();


    const interval =
      setInterval(() => {

        fetchIncomingAmbulances();

      }, 5000);


    return () => {

      clearInterval(interval);

    };

  }, []);


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
          🏥
        </div>


        <div>

          <h1
            style={{
              margin: 0,
              color: "#1e3a5f"
            }}
          >
            Hospital Dashboard
          </h1>


          <p
            style={{
              margin: "5px 0 0",
              color: "#64748b"
            }}
          >
            Emergency Ambulance Coordination
          </p>

        </div>

      </header>


      <main
        style={{
          maxWidth: "1400px",
          margin: "30px auto",
          padding: "0 25px"
        }}
      >


        {/* ===================================== */}
        {/* SUMMARY */}
        {/* ===================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}
        >


          <div style={cardStyle}>

            <div style={iconStyle}>
              🚑
            </div>

            <div>

              <p style={labelStyle}>
                Incoming Ambulances
              </p>

              <h2 style={valueStyle}>
                {trips.length}
              </h2>

            </div>

          </div>


          <div style={cardStyle}>

            <div style={iconStyle}>
              🚨
            </div>

            <div>

              <p style={labelStyle}>
                Emergency Cases
              </p>

              <h2 style={valueStyle}>
                {trips.filter(
                  (trip) =>
                    trip.priority ===
                    "Critical"
                ).length}
              </h2>

            </div>

          </div>


          <div style={cardStyle}>

            <div style={iconStyle}>
              🛏️
            </div>

            <div>

              <p style={labelStyle}>
                Preparation Status
              </p>

              <h2
                style={{
                  ...valueStyle,
                  fontSize: "20px",
                  color: "#15803d"
                }}
              >
                READY
              </h2>

            </div>

          </div>

        </div>


        {/* ===================================== */}
        {/* INCOMING AMBULANCES */}
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
            🚑 Incoming Emergency Ambulances
          </h2>


          {loading ? (

            <p>
              Loading incoming ambulances...
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

              🏥 No incoming ambulances
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


                {/* ================================= */}
                {/* AMBULANCE HEADER */}
                {/* ================================= */}

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
                      Emergency ambulance
                      incoming
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


                {/* ================================= */}
                {/* DETAILS */}
                {/* ================================= */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginTop: "25px"
                  }}
                >

                  <div
                    style={{
                      background:
                        "#f8fafc",
                      padding: "18px",
                      borderRadius: "10px"
                    }}
                  >

                    <strong>
                      🏥 Destination
                    </strong>

                    <p>
                      {trip.hospital}
                    </p>

                  </div>


                  <div
                    style={{
                      background:
                        "#f8fafc",
                      padding: "18px",
                      borderRadius: "10px"
                    }}
                  >

                    <strong>
                      📍 Current Location
                    </strong>

                    <p>
                      {trip.currentLocation?.latitude?.toFixed(6)}
                      {" , "}
                      {trip.currentLocation?.longitude?.toFixed(6)}
                    </p>

                  </div>


                  <div
                    style={{
                      background:
                        "#f8fafc",
                      padding: "18px",
                      borderRadius: "10px"
                    }}
                  >

                    <strong>
                      🚦 Traffic Status
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


                  <div
                    style={{
                      background:
                        "#f8fafc",
                      padding: "18px",
                      borderRadius: "10px"
                    }}
                  >

                    <strong>
                      🟢 Trip Status
                    </strong>

                    <p
                      style={{
                        color: "#15803d",
                        fontWeight:
                          "bold"
                      }}
                    >
                      ACTIVE
                    </p>

                  </div>

                </div>


                {/* ================================= */}
                {/* PREPARATION ALERT */}
                {/* ================================= */}

                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    background:
                      "#eff6ff",
                    borderRadius: "10px",
                    color: "#1e40af",
                    fontWeight: "bold"
                  }}
                >

                  🏥 Prepare emergency
                  resources for incoming
                  ambulance.

                  <div
                    style={{
                      marginTop: "7px",
                      fontWeight: "normal"
                    }}
                  >
                    Medical team should be
                    ready before ambulance
                    arrival.

                  </div>

                </div>

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


export default HospitalDashboard;