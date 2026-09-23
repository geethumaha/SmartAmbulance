import { useEffect, useState } from "react";
import axios from "axios";


function JunctionAlertList({ tripId }) {

  const [alerts, setAlerts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingAlert, setUpdatingAlert] =
    useState(null);


  // ==========================================
  // FETCH JUNCTION ALERTS
  // ==========================================

  const fetchAlerts = async () => {

    if (!tripId) {

      setAlerts([]);

      setLoading(false);

      return;

    }


    try {

      const response =
        await axios.get(
          `http://localhost:5000/api/trips/junction-alerts/${tripId}`
        );


      setAlerts(
        response.data.alerts || []
      );

      setLoading(false);


    } catch (error) {

      console.error(
        "Failed to fetch junction alerts:",
        error
      );

      setLoading(false);

    }

  };


  // ==========================================
  // UPDATE JUNCTION STATUS
  // ==========================================

  const updateAlertStatus = async (
    alertId,
    status
  ) => {

    try {

      setUpdatingAlert(alertId);


      await axios.put(

        `http://localhost:5000/api/trips/junction-alerts/status/${alertId}`,

        {
          status: status
        }

      );


      // Refresh alerts after update

      await fetchAlerts();


    } catch (error) {

      console.error(
        "Failed to update junction status:",
        error
      );


      alert(
        "❌ Failed to update junction status."
      );


    } finally {

      setUpdatingAlert(null);

    }

  };


  // ==========================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================

  useEffect(() => {

    fetchAlerts();


    const interval =
      setInterval(() => {

        fetchAlerts();

      }, 5000);


    return () => {

      clearInterval(
        interval
      );

    };

  }, [tripId]);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

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
          🚦 Upcoming Junction Alerts
        </h2>


        <p>
          Loading junction alerts...
        </p>

      </div>

    );

  }


  // ==========================================
  // NO ALERTS
  // ==========================================

  if (alerts.length === 0) {

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
          🚦 Upcoming Junction Alerts
        </h2>


        <div
          style={{
            padding: "18px",
            background: "#f8fafc",
            borderRadius: "10px",
            textAlign: "center",
            color: "#64748b"
          }}
        >

          No upcoming junction alerts.

        </div>

      </div>

    );

  }


  // ==========================================
  // ALERT LIST
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
        🚦 Upcoming Junction Alerts
      </h2>


      <p
        style={{
          color: "#64748b",
          marginBottom: "20px"
        }}
      >
        Police can prepare and clear
        upcoming junctions for the
        approaching ambulance.
      </p>


      {alerts.map((alert) => (

        <div
          key={alert._id}
          style={{
            background:
              alert.status === "CLEARED"
                ? "#f0fdf4"
                : "#fff7ed",

            border:
              alert.status === "CLEARED"
                ? "1px solid #bbf7d0"
                : "1px solid #fed7aa",

            borderRadius: "12px",

            padding: "20px",

            marginBottom: "15px"
          }}
        >

          {/* =================================
              HEADER
          ================================= */}

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

                  color:
                    alert.status ===
                    "CLEARED"
                      ? "#15803d"
                      : "#c2410c"
                }}
              >

                {alert.status ===
                "CLEARED"
                  ? "🟢"
                  : "🚨"}

                {" "}

                {alert.junctionName}

              </h3>


              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#64748b"
                }}
              >

                Ambulance:{" "}

                <strong>
                  {alert.ambulanceId}
                </strong>

              </p>

            </div>


            {/* PRIORITY */}

            <span
              style={{
                background:
                  alert.priority ===
                  "Critical"
                    ? "#fee2e2"
                    : "#fef3c7",

                color:
                  alert.priority ===
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

              {alert.priority}

            </span>

          </div>


          {/* =================================
              DETAILS
          ================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginTop: "18px"
            }}
          >

            {/* DISTANCE */}

            <div
              style={{
                background: "white",
                padding: "14px",
                borderRadius: "8px"
              }}
            >

              <strong>
                📏 Distance
              </strong>

              <p>
                {alert.distanceFromAmbulance}
                {" "}
                metres
              </p>

            </div>


            {/* LOCATION */}

            <div
              style={{
                background: "white",
                padding: "14px",
                borderRadius: "8px"
              }}
            >

              <strong>
                📍 Location
              </strong>

              <p>

                {Number(
                  alert.latitude
                ).toFixed(6)}

                {" , "}

                {Number(
                  alert.longitude
                ).toFixed(6)}

              </p>

            </div>


            {/* STATUS */}

            <div
              style={{
                background: "white",
                padding: "14px",
                borderRadius: "8px"
              }}
            >

              <strong>
                🚦 Status
              </strong>

              <p
                style={{
                  color:
                    alert.status ===
                    "CLEARED"
                      ? "#15803d"
                      : alert.status ===
                        "PREPARING"
                      ? "#ca8a04"
                      : alert.status ===
                        "PASSED"
                      ? "#64748b"
                      : "#dc2626",

                  fontWeight:
                    "bold"
                }}
              >

                {alert.status}

              </p>

            </div>

          </div>


          {/* =================================
              ACTION BUTTONS
          ================================= */}

          {alert.status ===
            "UPCOMING" && (

            <div
              style={{
                marginTop: "18px"
              }}
            >

              <button
                onClick={() =>
                  updateAlertStatus(
                    alert._id,
                    "PREPARING"
                  )
                }

                disabled={
                  updatingAlert ===
                  alert._id
                }

                style={{
                  padding:
                    "11px 20px",

                  border: "none",

                  borderRadius:
                    "7px",

                  background:
                    "#ea580c",

                  color: "white",

                  fontWeight:
                    "bold",

                  cursor:
                    updatingAlert ===
                    alert._id
                      ? "wait"
                      : "pointer",

                  opacity:
                    updatingAlert ===
                    alert._id
                      ? 0.7
                      : 1
                }}
              >

                {updatingAlert ===
                alert._id

                  ? "⏳ Preparing..."

                  : "🚦 Prepare Junction"}

              </button>

            </div>

          )}


          {alert.status ===
            "PREPARING" && (

            <div
              style={{
                marginTop: "18px"
              }}
            >

              <div
                style={{
                  padding: "13px",

                  background:
                    "#fef3c7",

                  color:
                    "#92400e",

                  borderRadius:
                    "8px",

                  fontWeight:
                    "bold",

                  marginBottom:
                    "12px"
                }}
              >

                🟡 Junction preparation
                is in progress.

              </div>


              <button
                onClick={() =>
                  updateAlertStatus(
                    alert._id,
                    "CLEARED"
                  )
                }

                disabled={
                  updatingAlert ===
                  alert._id
                }

                style={{
                  padding:
                    "11px 20px",

                  border: "none",

                  borderRadius:
                    "7px",

                  background:
                    "#15803d",

                  color: "white",

                  fontWeight:
                    "bold",

                  cursor:
                    updatingAlert ===
                    alert._id
                      ? "wait"
                      : "pointer",

                  opacity:
                    updatingAlert ===
                    alert._id
                      ? 0.7
                      : 1
                }}
              >

                {updatingAlert ===
                alert._id

                  ? "⏳ Clearing..."

                  : "🟢 Clear Junction"}

              </button>

            </div>

          )}


          {alert.status ===
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

              🟢 Junction Cleared

              <div
                style={{
                  marginTop: "6px",
                  fontWeight:
                    "normal"
                }}
              >

                🚑 Ambulance has emergency
                priority through this junction.

              </div>

            </div>

          )}


          {alert.status ===
            "PASSED" && (

            <div
              style={{
                marginTop: "18px",

                padding: "15px",

                background:
                  "#f1f5f9",

                color:
                  "#475569",

                borderRadius:
                  "8px",

                fontWeight:
                  "bold"
              }}
            >

              ✅ Ambulance has passed
              this junction.

            </div>

          )}

        </div>

      ))}

    </div>

  );

}


export default JunctionAlertList;