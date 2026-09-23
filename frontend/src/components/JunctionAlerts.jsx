import { useState } from "react";
import axios from "axios";


function JunctionAlerts({ trips }) {

  const [updatingTrip, setUpdatingTrip] = useState(null);


  // ==========================================
  // UPDATE TRAFFIC CLEARANCE
  // ==========================================

  const updateClearance = async (
    tripId,
    clearance
  ) => {

    try {

      setUpdatingTrip(tripId);


      await axios.put(
        `http://localhost:5000/api/trips/clearance/${tripId}`,
        {
          clearance: clearance
        }
      );


    } catch (error) {

      console.error(
        "Traffic clearance error:",
        error
      );


      alert(
        "❌ Failed to update traffic clearance."
      );


    } finally {

      setUpdatingTrip(null);

    }

  };


  // ==========================================
  // NO ACTIVE TRIPS
  // ==========================================

  if (!trips || trips.length === 0) {

    return (

      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "25px",
          marginTop: "25px",
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
          🚦 Junction Alerts
        </h2>


        <div
          style={{
            padding: "20px",
            background: "#f8fafc",
            borderRadius: "10px",
            textAlign: "center",
            color: "#64748b"
          }}
        >

          No active ambulance alerts.

        </div>

      </div>

    );

  }


  // ==========================================
  // ALERTS
  // ==========================================

  return (

    <div
      style={{
        background: "white",
        borderRadius: "15px",
        padding: "25px",
        marginTop: "25px",
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
        🚦 Junction Alerts
      </h2>


      <p
        style={{
          color: "#64748b",
          marginBottom: "20px"
        }}
      >
        Upcoming traffic junctions requiring
        emergency coordination.
      </p>


      {trips.map((trip) => {

        const clearance =
          trip.trafficClearance ||
          "PENDING";


        return (

          <div
            key={trip._id}
            style={{
              border:
                "1px solid #fed7aa",
              background:
                "#fff7ed",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "15px"
            }}
          >

            {/* ================================= */}
            {/* ALERT HEADER */}
            {/* ================================= */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >

              <div>

                <h3
                  style={{
                    margin: 0,
                    color: "#c2410c"
                  }}
                >
                  🚨 Emergency Junction Alert
                </h3>


                <p
                  style={{
                    marginBottom: 0,
                    color: "#475569"
                  }}
                >
                  Ambulance{" "}
                  <strong>
                    {trip.ambulanceId}
                  </strong>{" "}
                  is on an emergency trip.
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
                    "8px 15px",

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
            {/* TRIP INFORMATION */}
            {/* ================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginTop: "20px"
              }}
            >

              <div
                style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "8px"
                }}
              >

                <strong>
                  🚑 Ambulance
                </strong>

                <br />

                {trip.ambulanceId}

              </div>


              <div
                style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "8px"
                }}
              >

                <strong>
                  🏥 Hospital
                </strong>

                <br />

                {trip.hospital}

              </div>


              <div
                style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "8px"
                }}
              >

                <strong>
                  🚦 Clearance
                </strong>

                <br />

                <span
                  style={{
                    color:
                      clearance ===
                      "CLEARED"
                        ? "#15803d"
                        : clearance ===
                          "PREPARING"
                        ? "#ca8a04"
                        : "#64748b",

                    fontWeight:
                      "bold"
                  }}
                >
                  {clearance}
                </span>

              </div>

            </div>


            {/* ================================= */}
            {/* PENDING */}
            {/* ================================= */}

            {clearance ===
              "PENDING" && (

              <button
                style={{
                  marginTop: "18px",
                  padding:
                    "11px 20px",
                  border: "none",
                  borderRadius: "7px",
                  background:
                    "#ea580c",
                  color: "white",
                  fontWeight:
                    "bold",
                  cursor:
                    updatingTrip ===
                    trip._id
                      ? "wait"
                      : "pointer",
                  opacity:
                    updatingTrip ===
                    trip._id
                      ? 0.7
                      : 1
                }}

                disabled={
                  updatingTrip ===
                  trip._id
                }

                onClick={() =>
                  updateClearance(
                    trip._id,
                    "PREPARING"
                  )
                }
              >

                {updatingTrip ===
                trip._id
                  ? "⏳ Preparing..."
                  : "🚦 Prepare Traffic Clearance"}

              </button>

            )}


            {/* ================================= */}
            {/* PREPARING */}
            {/* ================================= */}

            {clearance ===
              "PREPARING" && (

              <div
                style={{
                  marginTop: "18px"
                }}
              >

                <div
                  style={{
                    padding: "12px",
                    background:
                      "#fef3c7",
                    color:
                      "#92400e",
                    borderRadius:
                      "8px",
                    fontWeight:
                      "bold"
                  }}
                >

                  🟡 Traffic clearance
                  is being prepared.

                </div>


                <button
                  style={{
                    marginTop: "12px",
                    padding:
                      "11px 20px",
                    border: "none",
                    borderRadius: "7px",
                    background:
                      "#15803d",
                    color: "white",
                    fontWeight:
                      "bold",
                    cursor:
                      updatingTrip ===
                      trip._id
                        ? "wait"
                        : "pointer",
                    opacity:
                      updatingTrip ===
                      trip._id
                        ? 0.7
                        : 1
                  }}

                  disabled={
                    updatingTrip ===
                    trip._id
                  }

                  onClick={() =>
                    updateClearance(
                      trip._id,
                      "CLEARED"
                    )
                  }
                >

                  {updatingTrip ===
                  trip._id
                    ? "⏳ Updating..."
                    : "🟢 Confirm Traffic Cleared"}

                </button>

              </div>

            )}


            {/* ================================= */}
            {/* CLEARED */}
            {/* ================================= */}

            {clearance ===
              "CLEARED" && (

              <div
                style={{
                  marginTop: "18px",
                  padding: "15px",
                  background:
                    "#dcfce7",
                  color:
                    "#15803d",
                  borderRadius:
                    "8px",
                  fontWeight:
                    "bold"
                }}
              >

                🟢 Traffic clearance confirmed.

                <div
                  style={{
                    marginTop: "6px",
                    fontWeight: "normal"
                  }}
                >
                  🚑 Ambulance has priority
                  through the coordinated
                  junction.
                </div>

              </div>

            )}

          </div>

        );

      })}

    </div>

  );

}


export default JunctionAlerts;