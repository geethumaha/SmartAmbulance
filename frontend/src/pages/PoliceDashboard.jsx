import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import PoliceMap from "../components/PoliceMap";


// ==========================================
// POLICE DASHBOARD
// ==========================================

function PoliceDashboard() {

  // ==========================================
  // MAIN DATA
  // ==========================================

  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
// Police officer assignment
const [policeOfficers, setPoliceOfficers] = useState([]);
const [selectedOfficers, setSelectedOfficers] = useState({});
const [assigningAlertId, setAssigningAlertId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  // Real-time emergency alerts
  const [emergencyAlerts, setEmergencyAlerts] =
    useState([]);

  // Smart signal priority
  const [signalPriority, setSignalPriority] =
    useState({});

  // ==========================================
// REAL-TIME JUNCTION ALERTS
// ==========================================

useEffect(() => {

  const socket = io("http://localhost:5000");

  socket.on("connect", () => {

    console.log(
      "🔌 Police connected to Socket.IO:",
      socket.id
    );

    socket.emit("join-police");

  });

  socket.on("junction-alert", (data) => {

    console.log(
      "🚨 REAL-TIME JUNCTION ALERT:",
      data
    );

    const newAlert = data.alert;

    if (!newAlert) {
      return;
    }

    setAlerts((previousAlerts) => {

      const alreadyExists =
        previousAlerts.some(
          (alert) =>
            alert._id === newAlert._id
        );

      if (alreadyExists) {
        return previousAlerts;
      }

      return [
        ...previousAlerts,
        newAlert
      ];

    });

    setMessage(
      `🚨 ${data.ambulanceId} approaching ${data.junctionName} — ${data.distanceFromAmbulance}m`
    );

    setTimeout(() => {
      setMessage("");
    }, 5000);

  });

  socket.on("connect_error", (error) => {

    console.error(
      "❌ Police Socket.IO connection error:",
      error.message
    );

  });

  return () => {

    socket.disconnect();

  };

}, []);
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
// GET REGISTERED POLICE OFFICERS
// ==========================================
const fetchPoliceOfficers = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/trips/police-officers"
    );

    setPoliceOfficers(response.data.officers || []);
  } catch (error) {
    console.error(
      "Failed to fetch police officers:",
      error
    );
  }
};

// ==========================================
// LOAD POLICE OFFICERS
// ==========================================
useEffect(() => {
  fetchPoliceOfficers();
}, []);

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
  // SOCKET.IO REAL-TIME COMMUNICATION
  // ==========================================

  useEffect(() => {

    const socket = io(
      "http://localhost:5000"
    );


    console.log(
      "🔌 Connecting Police Dashboard to Socket.IO..."
    );


    // ========================================
    // POLICE ROOM
    // ========================================

    socket.on("connect", () => {

      console.log(
        "🔌 Police connected to Socket.IO:",
        socket.id
      );

      socket.emit("join-police");

      console.log(
        "👮 Police dashboard joined Socket.IO room"
      );

    });

    // ========================================
    // REAL-TIME EMERGENCY ALERT
    // ========================================

    socket.on(
      "emergency-alert",
      (data) => {

        console.log(
          "🚨 REAL-TIME EMERGENCY ALERT:",
          data
        );

        setEmergencyAlerts(
          (previous) => [
            data,
            ...previous
          ]
        );

          // Refresh active trips
          fetchActiveTrips();

        }
      );


    // ========================================
    // REAL-TIME JUNCTION ALERT
    // ========================================

    socket.on(
      "junction-alert",
      (data) => {

        console.log(
          "🚨 REAL-TIME JUNCTION ALERT:",
          data
        );


        setAlerts(
          (previous) => {

            const alreadyExists =
              previous.some(
                (alert) =>
                  String(
                    alert._id ||
                    alert.alertId
                  ) ===
                  String(
                    data.alertId
                  )
              );


            if (alreadyExists) {

              return previous;

            }


            return [
              data,
              ...previous
            ];

          }
        );


        setMessage(
          `🚨 Ambulance ${data.ambulanceId} approaching ${data.junctionName}`
        );


        setTimeout(() => {

          setMessage("");

        }, 5000);

      }
    );


    // ========================================
    // REAL-TIME JUNCTION UPDATE
    // ========================================

    socket.on(
      "junction-alert-update",
      (data) => {

        console.log(
          "🔄 REAL-TIME JUNCTION ALERT UPDATE:",
          data
        );


        setAlerts(
          (previous) => {

            return previous.map(
              (alert) => {

                const existingId =
                  alert._id ||
                  alert.alertId;


                if (
                  String(existingId) ===
                  String(data.alertId)
                ) {

                  return {
                    ...alert,
                    ...data
                  };

                }


                return alert;

              }
            );

          }
        );

      }
    );


    // ========================================
    // LIVE AMBULANCE LOCATION
    // ========================================

    socket.on(
      "ambulance-location-update",
      (data) => {

        console.log(
          "📍 LIVE AMBULANCE LOCATION:",
          data
        );


        setTrips(
          (previous) =>
            previous.map(
              (trip) => {

                if (
                  String(trip._id) ===
                  String(data.tripId)
                ) {

                  return {

                    ...trip,

                    currentLocation: {

                      latitude:
                        data.latitude,

                      longitude:
                        data.longitude

                    }

                  };

                }


                return trip;

              }
            )
        );

      }
    );


    // ========================================
    // TRIP COMPLETED
    // ========================================

    socket.on(
      "trip-completed",
      (data) => {

        console.log(
          "✅ TRIP COMPLETED:",
          data
        );


        setMessage(
          `✅ Ambulance ${data.ambulanceId} completed the emergency trip`
        );


        setTimeout(() => {

          setMessage("");

        }, 5000);


        fetchActiveTrips();

      }
    );


    // ========================================
    // DISCONNECT
    // ========================================

    socket.on(
      "disconnect",
      () => {

        console.log(
          "❌ Police disconnected from Socket.IO"
        );

      }
    );


    // ========================================
    // CLEANUP
    // ========================================

    return () => {

      socket.disconnect();

    };

  }, []);


  // ==========================================
  // REFRESH ACTIVE TRIPS
  // ==========================================

  useEffect(() => {

    fetchActiveTrips();


    const interval =
      setInterval(
        () => {

          fetchActiveTrips();

        },
        5000
      );


    return () =>
      clearInterval(interval);

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


    const interval =
      setInterval(
        () => {

          fetchJunctionAlerts();

        },
        5000
      );


    return () =>
      clearInterval(interval);

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
// ASSIGN OFFICER TO JUNCTION
// ==========================================
const assignOfficerToJunction = async (alertId) => {
  const officerId = selectedOfficers[alertId];

  if (!officerId) {
    setMessage("Please select a police officer first.");
    return;
  }

  try {
    setAssigningAlertId(alertId);

    const response = await axios.post(
      `http://localhost:5000/api/trips/junction-alerts/${alertId}/assign`,
      { officerId }
    );

    setMessage(
      response.data.message ||
        "Police officer assigned successfully."
    );

    await fetchJunctionAlerts();

    setSelectedOfficers((previous) => ({
      ...previous,
      [alertId]: ""
    }));

    await fetchPoliceOfficers();
  } catch (error) {
    console.error(
      "Failed to assign police officer:",
      error
    );

    setMessage(
      error.response?.data?.message ||
        "Failed to assign police officer."
    );
  } finally {
    setAssigningAlertId(null);
  }
};

  // ==========================================
  // SMART SIGNAL PRIORITY
  // ==========================================

  const activateSignalPriority = (
    alert
  ) => {

    setSignalPriority(
      (previous) => ({

        ...previous,

        [alert._id ||
          alert.alertId]: true

      })
    );


    setMessage(
      `🚦 Signal priority activated for ${alert.junctionName}`
    );


    setTimeout(() => {

      setMessage("");

    }, 4000);

  };


  // ==========================================
  // RELEASE SIGNAL PRIORITY
  // ==========================================

  const releaseSignalPriority = (
    alert
  ) => {

    setSignalPriority(
      (previous) => ({

        ...previous,

        [alert._id ||
          alert.alertId]: false

      })
    );


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

  const getStatusStyle = (
    status
  ) => {

    if (
      status === "UPCOMING"
    ) {

      return {

        background: "#dbeafe",

        color: "#1d4ed8"

      };

    }


    if (
      status === "PREPARING"
    ) {

      return {

        background: "#fef3c7",

        color: "#92400e"

      };

    }


    if (
      status === "CLEARED"
    ) {

      return {

        background: "#dcfce7",

        color: "#166534"

      };

    }


    if (
      status === "PASSED"
    ) {

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

  const getPriorityStyle = (
    priority
  ) => {

    if (
      priority === "Critical"
    ) {

      return {

        background: "#fee2e2",

        color: "#b91c1c"

      };

    }


    if (
      priority === "Serious"
    ) {

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


  // ==========================================
  // FILTERED ALERTS
  // ==========================================

  const upcomingAlerts =
    alerts.filter(
      (alert) =>
        alert.status ===
        "UPCOMING"
    );


  const preparingAlerts =
    alerts.filter(
      (alert) =>
        alert.status ===
        "PREPARING"
    );


  const criticalAlerts =
    alerts.filter(
      (alert) =>
        alert.priority ===
          "Critical" &&
        alert.status !==
          "PASSED"
    );


  // ==========================================
  // SIGNAL COUNT
  // ==========================================

  const activeSignalCount =
    Object.values(
      signalPriority
    ).filter(Boolean).length;


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#eef6fb",
        fontFamily:
          "Arial, sans-serif",
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
          justifyContent:
            "space-between",
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
                margin:
                  "5px 0 0",
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
            padding:
              "10px 18px",
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
            REAL-TIME EMERGENCY ALERTS
        ====================================== */}

        {emergencyAlerts.length > 0 && (

          <section
            style={{
              background: "#fff1f2",
              border:
                "2px solid #fecdd3",
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
              🚨 REAL-TIME EMERGENCY ALERT
            </h2>


            {emergencyAlerts
              .slice(0, 5)
              .map(
                (alert, index) => (

                  <div
                    key={
                      alert.tripId ||
                      index
                    }
                    style={{
                      background:
                        "white",
                      padding:
                        "15px",
                      borderRadius:
                        "10px",
                      marginTop:
                        "10px",
                      border:
                        "1px solid #fecdd3"
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        flexWrap:
                          "wrap",
                        gap: "10px"
                      }}
                    >

                      <div>

                        <strong>
                          🚑{" "}
                          {alert.ambulanceId}
                        </strong>


                        <span
                          style={{
                            marginLeft:
                              "15px"
                          }}
                        >
                          Priority:
                          {" "}
                          <strong
                            style={{
                              color:
                                "#dc2626"
                            }}
                          >
                            {alert.priority}
                          </strong>
                        </span>


                        <span
                          style={{
                            marginLeft:
                              "15px"
                          }}
                        >
                          🏥{" "}
                          {alert.hospital}
                        </span>

                      </div>


                      <span
                        style={{
                          background:
                            "#fee2e2",
                          color:
                            "#b91c1c",
                          padding:
                            "7px 12px",
                          borderRadius:
                            "20px",
                          fontSize:
                            "12px",
                          fontWeight:
                            "bold"
                        }}
                      >
                        LIVE ALERT
                      </span>

                    </div>


                    <p
                      style={{
                        marginBottom: 0,
                        color:
                          "#64748b"
                      }}
                    >
                      {alert.message}
                    </p>

                  </div>

                )
              )}

          </section>

        )}


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

          <div
            style={cardStyle}
          >

            <div
              style={iconStyle}
            >
              🚑
            </div>

            <div>

              <p
                style={labelStyle}
              >
                Active Ambulances
              </p>

              <h2
                style={valueStyle}
              >
                {trips.length}
              </h2>

            </div>

          </div>


          <div
            style={cardStyle}
          >

            <div
              style={iconStyle}
            >
              🚨
            </div>

            <div>

              <p
                style={labelStyle}
              >
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


          <div
            style={cardStyle}
          >

            <div
              style={iconStyle}
            >
              🚦
            </div>

            <div>

              <p
                style={labelStyle}
              >
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


          <div
            style={cardStyle}
          >

            <div
              style={iconStyle}
            >
              🟢
            </div>

            <div>

              <p
                style={labelStyle}
              >
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
            CRITICAL JUNCTION ALERT
        ====================================== */}

        {criticalAlerts.length > 0 && (

          <section
            style={{
              background: "#fff1f2",
              border:
                "2px solid #fecdd3",
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


            {criticalAlerts.map(
              (alert) => {

                const alertId =
                  alert._id ||
                  alert.alertId;


                return (

                  <div
                    key={alertId}
                    style={{
                      background:
                        "white",
                      padding:
                        "15px",
                      borderRadius:
                        "10px",
                      marginTop:
                        "10px",
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      flexWrap:
                        "wrap",
                      gap: "10px"
                    }}
                  >

                    <div>

                      <strong>
                        🚑{" "}
                        {alert.ambulanceId}
                      </strong>


                      <span
                        style={{
                          marginLeft:
                            "15px"
                        }}
                      >
                        🚦{" "}
                        {alert.junctionName}
                      </span>


                      <span
                        style={{
                          marginLeft:
                            "15px",
                          color:
                            "#dc2626",
                          fontWeight:
                            "bold"
                        }}
                      >
                        {alert.distanceFromAmbulance}
                        {" "}m away
                      </span>

                    </div>


                    {alert.status ===
                      "UPCOMING" && (

                      <button
                        onClick={() =>
                          updateAlertStatus(
                            alertId,
                            "PREPARING"
                          )
                        }
                        style={
                          prepareButtonStyle
                        }
                      >
                        🚦 Prepare Junction
                      </button>

                    )}

                  </div>

                );

              }
            )}

          </section>

        )}


        {/* ======================================
            MESSAGE
        ====================================== */}

        {message && (

          <div
            style={{
              background:
                "#dcfce7",
              color:
                "#166534",
              padding:
                "14px 18px",
              borderRadius:
                "10px",
              marginBottom:
                "20px",
              fontWeight:
                "bold"
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
            background:
              "white",
            borderRadius:
              "15px",
            padding:
              "30px",
            marginBottom:
              "30px",
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


          <p
            style={{
              color:
                "#64748b"
            }}
          >
            Monitor active ambulances and their emergency routes in real time.
          </p>


          {loading ? (

            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "40px",
                color:
                  "#64748b"
              }}
            >
              Loading live ambulance data...
            </div>

          ) : trips.length === 0 ? (

            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "40px",
                background:
                  "#f8fafc",
                borderRadius:
                  "10px",
                color:
                  "#64748b"
              }}
            >
              🚑 No active ambulances currently.
            </div>

          ) : (

            <PoliceMap
              trips={trips}
            />

          )}

        </section>


        {/* ======================================
            JUNCTION COORDINATION
        ====================================== */}

        <section
          style={{
            background:
              "white",
            borderRadius:
              "15px",
            padding:
              "30px",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.08)"
          }}
        >

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              flexWrap:
                "wrap",
              gap: "10px",
              marginBottom:
                "20px"
            }}
          >

            <div>

              <h2
                style={{
                  margin: 0,
                  color:
                    "#1e3a5f"
                }}
              >
                🚦 Junction Coordination
              </h2>


              <p
                style={{
                  color:
                    "#64748b",
                  marginBottom:
                    0
                }}
              >
                Automatic alerts and smart signal priority control.
              </p>

            </div>


            <span
              style={{
                background:
                  "#eff6ff",
                color:
                  "#1d4ed8",
                padding:
                  "8px 14px",
                borderRadius:
                  "20px",
                fontSize:
                  "13px",
                fontWeight:
                  "bold"
              }}
            >
              🔴 Real-Time + Auto Refresh
            </span>

          </div>


          {alerts.length === 0 ? (

            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "40px",
                background:
                  "#f8fafc",
                borderRadius:
                  "10px",
                color:
                  "#64748b"
              }}
            >
              🚦 No junction alerts currently.
            </div>

          ) : (

            <div
              style={{
                overflowX:
                  "auto"
              }}
            >

              <table
                style={{
                  width:
                    "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "1050px"
                }}
              >

                <thead>

                  <tr
                    style={{
                      background:
                        "#f1f5f9"
                    }}
                  >

                    <th
                      style={thStyle}
                    >
                      Ambulance
                    </th>

                    <th
                      style={thStyle}
                    >
                      Junction
                    </th>

                    <th
                      style={thStyle}
                    >
                      Distance
                    </th>

                    <th
                      style={thStyle}
                    >
                      Priority
                    </th>

                    <th
                      style={thStyle}
                    >
                      Status
                    </th>

                    <th
                      style={thStyle}
                    >
                      Signal
                    </th>
                    <th style={thStyle}>Police Officers</th>
                    <th
                      style={thStyle}
                    >
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {alerts.map(
                    (alert) => {

                      const alertId =
                        alert._id ||
                        alert.alertId;


                      const signalActive =
                        signalPriority[
                          alertId
                        ] === true;


                      return (

                        <tr
                          key={
                            alertId
                          }
                          style={{
                            borderBottom:
                              "1px solid #e2e8f0"
                          }}
                        >

                          <td
                            style={
                              tdStyle
                            }
                          >
                            <strong
                              style={{
                                color:
                                  "#1e3a5f"
                              }}
                            >
                              🚑{" "}
                              {alert.ambulanceId}
                            </strong>
                          </td>


                          <td
                            style={
                              tdStyle
                            }
                          >
                            🚦{" "}
                            {alert.junctionName}
                          </td>


                          <td
                            style={
                              tdStyle
                            }
                          >
                            <strong>
                              {
                                alert.distanceFromAmbulance
                              }{" "}
                              m
                            </strong>
                          </td>


                          <td
                            style={
                              tdStyle
                            }
                          >

                            <span
                              style={{
                                ...badgeStyle,
                                ...getPriorityStyle(
                                  alert.priority
                                )
                              }}
                            >
                              {
                                alert.priority
                              }
                            </span>

                          </td>


                          <td
                            style={
                              tdStyle
                            }
                          >

                            <span
                              style={{
                                ...badgeStyle,
                                ...getStatusStyle(
                                  alert.status
                                )
                              }}
                            >
                              {
                                alert.status
                              }
                            </span>

                          </td>


                          <td
                            style={
                              tdStyle
                            }
                          >

                            {signalActive ? (

                              <span
                                style={{
                                  background:
                                    "#dcfce7",
                                  color:
                                    "#166534",
                                  padding:
                                    "8px 12px",
                                  borderRadius:
                                    "20px",
                                  fontWeight:
                                    "bold",
                                  fontSize:
                                    "12px"
                                }}
                              >
                                🟢 PRIORITY ACTIVE
                              </span>

                            ) : (

                              <span
                                style={{
                                  color:
                                    "#64748b",
                                  fontWeight:
                                    "bold"
                                }}
                              >
                                ⚪ Normal
                              </span>

                            )}

                          </td>


                          {/* POLICE OFFICER ASSIGNMENT */}
                          <td style={tdStyle}>
  <div style={{ minWidth: "220px" }}>
    <strong>
      Assigned:{" "}
      {Array.isArray(alert.assignedOfficers)
        ? alert.assignedOfficers.length
        : 0}
    </strong>

    {Array.isArray(alert.assignedOfficers) &&
      alert.assignedOfficers.map((assignment) => {
        const officerId =
          assignment.officerId?._id || assignment.officerId;

        const officer = policeOfficers.find(
          (item) => String(item._id) === String(officerId)
        );

        return (
          <div
            key={String(officerId)}
            style={{
              marginTop: "5px",
              fontSize: "12px"
            }}
          >
            👮 {officer?.name || "Assigned officer"} —{" "}
            {assignment.status}
          </div>
        );
      })}

    <select
      value={selectedOfficers[alertId] || ""}
      onChange={(event) =>
        setSelectedOfficers((previous) => ({
          ...previous,
          [alertId]: event.target.value
        }))
      }
      style={{
        display: "block",
        width: "100%",
        marginTop: "8px",
        padding: "7px"
      }}
    >
      <option value="">Select police officer</option>

      {policeOfficers.map((officer) => {
        const alreadyAssigned = (
          alert.assignedOfficers || []
        ).some(
          (assignment) =>
            String(
              assignment.officerId?._id || assignment.officerId
            ) === String(officer._id)
        );

        return (
          <option
            key={officer._id}
            value={officer._id}
            disabled={alreadyAssigned}
          >
            {officer.name} ({officer.email})
          </option>
        );
      })}
    </select>

    <button
      onClick={() => assignOfficerToJunction(alertId)}
      disabled={
        !selectedOfficers[alertId] ||
        assigningAlertId === alertId
      }
      style={{
        ...smallButtonStyle,
        marginTop: "8px",
        opacity: assigningAlertId === alertId ? 0.6 : 1
      }}
    >
      {assigningAlertId === alertId
        ? "Assigning..."
        : "Assign Officer"}
    </button>
  </div>
</td>

                          {/* EXISTING ACTION BUTTONS */}
                          <td style={tdStyle}>
                            {alert.status ===
                              "UPCOMING" && (

                              <button
                                onClick={() =>
                                  updateAlertStatus(
                                    alertId,
                                    "PREPARING"
                                  )
                                }
                                style={
                                  smallButtonStyle
                                }
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
                                style={
                                  signalButtonStyle
                                }
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
                                style={
                                  releaseButtonStyle
                                }
                              >
                                🔴 Release Priority
                              </button>

                            )}


                            {alert.status ===
                              "CLEARED" &&
                              !signalActive && (

                              <span
                                style={{
                                  color:
                                    "#15803d",
                                  fontWeight:
                                    "bold"
                                }}
                              >
                                🟢 Traffic Cleared
                              </span>

                            )}


                            {alert.status ===
                              "PASSED" && (

                              <span
                                style={{
                                  color:
                                    "#64748b",
                                  fontWeight:
                                    "bold"
                                }}
                              >
                                ✓ Junction Passed
                              </span>

                            )}

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* ======================================
            FOOTER
        ====================================== */}

        <div
          style={{
            textAlign:
              "center",
            marginTop:
              "25px",
            color:
              "#64748b",
            fontSize:
              "14px"
          }}
        >
          Smart Ambulance Emergency Coordination System © 2026
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

  padding:
    "16px 15px",

  color: "#475569",

  fontSize: "14px"

};


const prepareButtonStyle = {

  border: "none",

  background: "#f59e0b",

  color: "white",

  padding:
    "10px 16px",

  borderRadius: "7px",

  fontWeight: "bold",

  cursor: "pointer"

};


const smallButtonStyle = {

  border: "none",

  background: "#f59e0b",

  color: "white",

  padding:
    "8px 13px",

  borderRadius: "6px",

  fontWeight: "bold",

  cursor: "pointer"

};


const signalButtonStyle = {

  border: "none",

  background: "#16a34a",

  color: "white",

  padding:
    "8px 13px",

  borderRadius: "6px",

  fontWeight: "bold",

  cursor: "pointer"

};


const releaseButtonStyle = {

  border: "none",

  background: "#dc2626",

  color: "white",

  padding:
    "8px 13px",

  borderRadius: "6px",

  fontWeight: "bold",

  cursor: "pointer"

};


export default PoliceDashboard;