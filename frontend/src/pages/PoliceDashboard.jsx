import { useEffect, useState } from "react";
import axios from "axios";

import PoliceMap from "../components/PoliceMap";

function PoliceDashboard() {

  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Smart signal priority state
  const [signalPriority, setSignalPriority] = useState({});


  // ==========================================
  // GET ACTIVE AMBULANCES
  // ==========================================

  const fetchActiveTrips = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/trips/active"
      );

      setTrips(response.data.trips || []);
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
  // GET JUNCTION ALERTS
  // ==========================================

  const fetchJunctionAlerts = async () => {

    try {

      const allAlerts = [];

      for (const trip of trips) {

        try {

          const response = await axios.get(
            `http://localhost:5000/api/trips/junction-alerts/${trip._id}`
          );

          if (response.data.alerts) {

            allAlerts.push(
              ...response.data.alerts
            );

          }

        } catch (error) {

          console.error(
            `Failed to fetch alerts for ${trip.ambulanceId}`,
            error
          );

        }

      }

      setAlerts(allAlerts);

    } catch (error) {

      console.error(
        "Failed to fetch junction alerts:",
        error
      );

    }

  };


  // ==========================================
  // REFRESH ACTIVE TRIPS
  // ==========================================

  useEffect(() => {

    fetchActiveTrips();

    const interval = setInterval(() => {
      fetchActiveTrips();
    }, 5000);

    return () => clearInterval(interval);

  }, []);


  // ==========================================
  // REFRESH JUNCTION ALERTS
  // ==========================================

  useEffect(() => {

    if (trips.length === 0) {

      setAlerts([]);

      return;

    }

    fetchJunctionAlerts();

    const interval = setInterval(() => {
      fetchJunctionAlerts();
    }, 5000);

    return () => clearInterval(interval);

  }, [trips]);


  // ==========================================
  // UPDATE JUNCTION STATUS
  // ==========================================

  const updateAlertStatus = async (
    alertId,
    status
  ) => {

    try {

      await axios.put(
        `http://localhost:5000/api/trips/junction-alerts/status/${alertId}`,
        {
          status
        }
      );

      setMessage(
        `✅ Junction marked as ${status}`
      );

      await fetchJunctionAlerts();

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {

      console.error(
        "Failed to update junction status:",
        error
      );

      setMessage(
        "❌ Failed to update junction status"
      );

    }

  };


  // ==========================================
  // SMART SIGNAL PRIORITY
  // ==========================================

  const activateSignalPriority = (alert) => {

    setSignalPriority((previous) => ({
      ...previous,
      [alert._id]: true
    }));

    setMessage(
      `🚦 Signal priority activated for ${alert.junctionName}`
    );

    setTimeout(() => {
      setMessage("");
    }, 4000);

  };


  const releaseSignalPriority = (alert) => {

    setSignalPriority((previous) => ({
      ...previous,
      [alert._id]: false
    }));

    setMessage(
      `🟢 Signal priority released at ${alert.junctionName}`
    );

    setTimeout(() => {
      setMessage("");
    }, 4000);

  };


  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {

    if (status === "UPCOMING") {

      return {
        background: "#dbeafe",
        color: "#1d4ed8"
      };

    }

    if (status === "PREPARING") {

      return {
        background: "#fef3c7",
        color: "#92400e"
      };

    }

    if (status === "CLEARED") {

      return {
        background: "#dcfce7",
        color: "#166534"
      };

    }

    if (status === "PASSED") {

      return {
        background: "#e2e8f0",
        color: "#475569"
      };

    }

    return {
      background: "#f1f5f9",
      color: "#475569"
    };

  };


  // ==========================================
  // PRIORITY STYLE
  // ==========================================

  const getPriorityStyle = (priority) => {

    if (priority === "Critical") {

      return {
        background: "#fee2e2",
        color: "#b91c1c"
      };

    }

    if (priority === "Serious") {

      return {
        background: "#fef3c7",
        color: "#92400e"
      };

    }

    return {
      background: "#dcfce7",
      color: "#166534"
    };

  };


  const upcomingAlerts =
    alerts.filter(
      (alert) =>
        alert.status === "UPCOMING"
    );

  const preparingAlerts =
    alerts.filter(
      (alert) =>
        alert.status === "PREPARING"
    );

  const criticalAlerts =
    alerts.filter(
      (alert) =>
        alert.priority === "Critical" &&
        alert.status !== "PASSED"
    );


  const activeSignalCount =
    Object.values(signalPriority)
      .filter(Boolean)
      .length;


  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#eef6fb",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "50px"
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
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px"
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}
        >

          <div style={{ fontSize: "45px" }}>
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
              Smart Ambulance Traffic Coordination
            </p>

          </div>

        </div>


        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "10px 18px",
            borderRadius: "20px",
            fontWeight: "bold"
          }}
        >
          🟢 Police Control Active
        </div>

      </header>


      <main
        style={{
          maxWidth: "1400px",
          margin: "30px auto",
          padding: "0 25px"
        }}
      >


        {/* ======================================
            SUMMARY CARDS
        ====================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}
        >

          <div style={cardStyle}>
            <div style={iconStyle}>🚑</div>

            <div>
              <p style={labelStyle}>
                Active Ambulances
              </p>

              <h2 style={valueStyle}>
                {trips.length}
              </h2>
            </div>
          </div>


          <div style={cardStyle}>
            <div style={iconStyle}>🚨</div>

            <div>
              <p style={labelStyle}>
                Critical Alerts
              </p>

              <h2
                style={{
                  ...valueStyle,
                  color: "#dc2626"
                }}
              >
                {criticalAlerts.length}
              </h2>
            </div>
          </div>


          <div style={cardStyle}>
            <div style={iconStyle}>🚦</div>

            <div>
              <p style={labelStyle}>
                Upcoming Junctions
              </p>

              <h2
                style={{
                  ...valueStyle,
                  color: "#2563eb"
                }}
              >
                {upcomingAlerts.length}
              </h2>
            </div>
          </div>


          <div style={cardStyle}>
            <div style={iconStyle}>🟢</div>

            <div>
              <p style={labelStyle}>
                Signal Priority Active
              </p>

              <h2
                style={{
                  ...valueStyle,
                  color: "#16a34a"
                }}
              >
                {activeSignalCount}
              </h2>
            </div>
          </div>

        </section>


        {/* ======================================
            CRITICAL ALERT
        ====================================== */}

        {criticalAlerts.length > 0 && (

          <section
            style={{
              background: "#fff1f2",
              border: "2px solid #fecdd3",
              borderRadius: "15px",
              padding: "20px",
              marginBottom: "30px"
            }}
          >

            <h2
              style={{
                marginTop: 0,
                color: "#b91c1c"
              }}
            >
              🚨 CRITICAL JUNCTION ALERT
            </h2>

            {criticalAlerts.map((alert) => (

              <div
                key={alert._id}
                style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  marginTop: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >

                <div>

                  <strong>
                    🚑 {alert.ambulanceId}
                  </strong>

                  <span style={{ marginLeft: "15px" }}>
                    🚦 {alert.junctionName}
                  </span>

                  <span
                    style={{
                      marginLeft: "15px",
                      color: "#dc2626",
                      fontWeight: "bold"
                    }}
                  >
                    {alert.distanceFromAmbulance} m away
                  </span>

                </div>


                <button
                  onClick={() =>
                    updateAlertStatus(
                      alert._id,
                      "PREPARING"
                    )
                  }
                  style={prepareButtonStyle}
                >
                  🚦 Prepare Junction
                </button>

              </div>

            ))}

          </section>

        )}


        {/* ======================================
            MESSAGE
        ====================================== */}

        {message && (

          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "14px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: "bold"
            }}
          >
            {message}
          </div>

        )}


        {/* ======================================
            LIVE MAP
        ====================================== */}

        <section
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            marginBottom: "30px",
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
            🗺️ Live Ambulance Monitoring
          </h2>

          <p style={{ color: "#64748b" }}>
            Monitor active ambulances and their
            emergency routes in real time.
          </p>

          {loading ? (

            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#64748b"
              }}
            >
              Loading live ambulance data...
            </div>

          ) : trips.length === 0 ? (

            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#f8fafc",
                borderRadius: "10px",
                color: "#64748b"
              }}
            >
              🚑 No active ambulances currently.
            </div>

          ) : (

            <PoliceMap trips={trips} />

          )}

        </section>


        {/* ======================================
            JUNCTION COORDINATION
        ====================================== */}

        <section
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.08)"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px"
            }}
          >

            <div>

              <h2
                style={{
                  margin: 0,
                  color: "#1e3a5f"
                }}
              >
                🚦 Junction Coordination
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: 0
                }}
              >
                Automatic alerts and smart signal
                priority control.
              </p>

            </div>


            <span
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "8px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold"
              }}
            >
              Auto Refresh: 5 sec
            </span>

          </div>


          {alerts.length === 0 ? (

            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#f8fafc",
                borderRadius: "10px",
                color: "#64748b"
              }}
            >
              🚦 No junction alerts currently.
            </div>

          ) : (

            <div style={{ overflowX: "auto" }}>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1050px"
                }}
              >

                <thead>

                  <tr
                    style={{
                      background: "#f1f5f9"
                    }}
                  >

                    <th style={thStyle}>
                      Ambulance
                    </th>

                    <th style={thStyle}>
                      Junction
                    </th>

                    <th style={thStyle}>
                      Distance
                    </th>

                    <th style={thStyle}>
                      Priority
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Signal
                    </th>

                    <th style={thStyle}>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {alerts.map((alert) => {

                    const signalActive =
                      signalPriority[alert._id] === true;

                    return (

                      <tr
                        key={alert._id}
                        style={{
                          borderBottom:
                            "1px solid #e2e8f0"
                        }}
                      >

                        <td style={tdStyle}>
                          <strong
                            style={{
                              color: "#1e3a5f"
                            }}
                          >
                            🚑 {alert.ambulanceId}
                          </strong>
                        </td>


                        <td style={tdStyle}>
                          🚦 {alert.junctionName}
                        </td>


                        <td style={tdStyle}>
                          <strong>
                            {alert.distanceFromAmbulance} m
                          </strong>
                        </td>


                        <td style={tdStyle}>

                          <span
                            style={{
                              ...badgeStyle,
                              ...getPriorityStyle(
                                alert.priority
                              )
                            }}
                          >
                            {alert.priority}
                          </span>

                        </td>


                        <td style={tdStyle}>

                          <span
                            style={{
                              ...badgeStyle,
                              ...getStatusStyle(
                                alert.status
                              )
                            }}
                          >
                            {alert.status}
                          </span>

                        </td>


                        {/* SIGNAL STATUS */}

                        <td style={tdStyle}>

                          {signalActive ? (

                            <span
                              style={{
                                background: "#dcfce7",
                                color: "#166534",
                                padding: "8px 12px",
                                borderRadius: "20px",
                                fontWeight: "bold",
                                fontSize: "12px"
                              }}
                            >
                              🟢 PRIORITY ACTIVE
                            </span>

                          ) : (

                            <span
                              style={{
                                color: "#64748b",
                                fontWeight: "bold"
                              }}
                            >
                              ⚪ Normal
                            </span>

                          )}

                        </td>


                        {/* ACTION */}

                        <td style={tdStyle}>

                          {alert.status ===
                            "UPCOMING" && (

                            <button
                              onClick={() =>
                                updateAlertStatus(
                                  alert._id,
                                  "PREPARING"
                                )
                              }
                              style={smallButtonStyle}
                            >
                              🚦 Prepare
                            </button>

                          )}


                          {alert.status ===
                            "PREPARING" &&
                            !signalActive && (

                            <button
                              onClick={() =>
                                activateSignalPriority(
                                  alert
                                )
                              }
                              style={signalButtonStyle}
                            >
                              🟢 Give Signal Priority
                            </button>

                          )}


                          {alert.status ===
                            "PREPARING" &&
                            signalActive && (

                            <button
                              onClick={() =>
                                releaseSignalPriority(
                                  alert
                                )
                              }
                              style={releaseButtonStyle}
                            >
                              🔴 Release Priority
                            </button>

                          )}


                          {alert.status ===
                            "CLEARED" &&
                            !signalActive && (

                            <span
                              style={{
                                color: "#15803d",
                                fontWeight: "bold"
                              }}
                            >
                              🟢 Traffic Cleared
                            </span>

                          )}


                          {alert.status ===
                            "PASSED" && (

                            <span
                              style={{
                                color: "#64748b",
                                fontWeight: "bold"
                              }}
                            >
                              ✓ Junction Passed
                            </span>

                          )}

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>


        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#64748b",
            fontSize: "14px"
          }}
        >
          Smart Ambulance Emergency
          Coordination System © 2026
        </div>

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
  padding: "24px",
  display: "flex",
  alignItems: "center",
  gap: "18px",
  boxShadow:
    "0 5px 18px rgba(0,0,0,0.08)"
};


const iconStyle = {
  fontSize: "38px"
};


const labelStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px"
};


const valueStyle = {
  margin: "6px 0 0",
  color: "#1e3a5f",
  fontSize: "30px"
};


const badgeStyle = {
  display: "inline-block",
  padding: "7px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "bold"
};


const thStyle = {
  padding: "15px",
  textAlign: "left",
  color: "#475569",
  fontSize: "14px",
  borderBottom:
    "2px solid #e2e8f0"
};


const tdStyle = {
  padding: "16px 15px",
  color: "#475569",
  fontSize: "14px"
};


const prepareButtonStyle = {
  border: "none",
  background: "#f59e0b",
  color: "white",
  padding: "10px 16px",
  borderRadius: "7px",
  fontWeight: "bold",
  cursor: "pointer"
};


const smallButtonStyle = {
  border: "none",
  background: "#f59e0b",
  color: "white",
  padding: "8px 13px",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer"
};


const signalButtonStyle = {
  border: "none",
  background: "#16a34a",
  color: "white",
  padding: "8px 13px",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer"
};


const releaseButtonStyle = {
  border: "none",
  background: "#dc2626",
  color: "white",
  padding: "8px 13px",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer"
};


export default PoliceDashboard;