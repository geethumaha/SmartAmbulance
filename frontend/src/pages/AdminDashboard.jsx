import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {

  const [analytics, setAnalytics] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    criticalTrips: 0,
    seriousTrips: 0,
    moderateTrips: 0,
    averageJourneyMinutes: 0
  });

  const [trips, setTrips] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(null);


  // ==========================================
  // FETCH ANALYTICS + HISTORY
  // ==========================================

  const fetchHistory = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:5000/api/trips/history"
        );

      setAnalytics(
        response.data.analytics || {}
      );

      setTrips(
        response.data.trips || []
      );

      setLastUpdated(
        new Date()
      );

      setLoading(false);

    } catch (error) {

      console.error(
        "Failed to fetch trip analytics:",
        error
      );

      setLoading(false);

    }

  };


  // ==========================================
  // AUTO REFRESH
  // ==========================================

  useEffect(() => {

    fetchHistory();

    const interval =
      setInterval(() => {

        fetchHistory();

      }, 5000);

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ==========================================
  // PRIORITY STYLE
  // ==========================================

  const getPriorityStyle =
    (priority) => {

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
  // STATUS STYLE
  // ==========================================

  const getStatusStyle =
    (status) => {

      if (
        status === "ACTIVE"
      ) {

        return {
          background: "#dbeafe",
          color: "#1d4ed8"
        };

      }

      if (
        status === "COMPLETED"
      ) {

        return {
          background: "#dcfce7",
          color: "#166534"
        };

      }

      return {
        background: "#f1f5f9",
        color: "#475569"
      };

    };


  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate =
    (date) => {

      if (!date) {
        return "—";
      }

      return new Date(
        date
      ).toLocaleString();

    };


  // ==========================================
  // JOURNEY TIME
  // ==========================================

  const averageTime =
    analytics.averageJourneyMinutes || 0;


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
            👨‍💼
          </div>

          <div>

            <h1
              style={{
                margin: 0,
                color: "#1e3a5f"
              }}
            >
              Admin Dashboard
            </h1>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#64748b"
              }}
            >
              Smart Ambulance System
              Administration
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
          🟢 System Online
        </div>

      </header>


      <main
        style={{
          maxWidth: "1400px",
          margin:
            "30px auto",
          padding:
            "0 25px"
        }}
      >


        {/* ======================================
            WELCOME
        ====================================== */}

        <section
          style={{
            background:
              "linear-gradient(135deg, #ffffff, #eef7ff)",
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
            Welcome, Administrator 👋
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: 0
            }}
          >
            Monitor emergency trips,
            ambulance activity,
            emergency priorities,
            completed journeys and
            system performance from
            one centralized dashboard.
          </p>

        </section>


        {/* ======================================
            MAIN ANALYTICS CARDS
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


          {/* TOTAL TRIPS */}

          <div style={cardStyle}>

            <div style={iconStyle}>
              🚑
            </div>

            <div>

              <p style={labelStyle}>
                Total Trips
              </p>

              <h2 style={valueStyle}>
                {analytics.totalTrips}
              </h2>

            </div>

          </div>


          {/* ACTIVE */}

          <div style={cardStyle}>

            <div style={iconStyle}>
              🔵
            </div>

            <div>

              <p style={labelStyle}>
                Active Trips
              </p>

              <h2
                style={{
                  ...valueStyle,
                  color: "#2563eb"
                }}
              >
                {analytics.activeTrips}
              </h2>

            </div>

          </div>


          {/* COMPLETED */}

          <div style={cardStyle}>

            <div style={iconStyle}>
              ✅
            </div>

            <div>

              <p style={labelStyle}>
                Completed Trips
              </p>

              <h2
                style={{
                  ...valueStyle,
                  color: "#16a34a"
                }}
              >
                {analytics.completedTrips}
              </h2>

            </div>

          </div>


          {/* AVERAGE TIME */}

          <div style={cardStyle}>

            <div style={iconStyle}>
              ⏱️
            </div>

            <div>

              <p style={labelStyle}>
                Avg Journey Time
              </p>

              <h2
                style={{
                  ...valueStyle,
                  color: "#7c3aed"
                }}
              >
                {averageTime}
                {" "}
                min
              </h2>

            </div>

          </div>

        </section>


        {/* ======================================
            EMERGENCY PRIORITY ANALYTICS
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
            📊 Emergency Priority Analytics
          </h2>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px"
            }}
          >


            {/* CRITICAL */}

            <div
              style={{
                background: "#fff1f2",
                border:
                  "1px solid #fecdd3",
                borderRadius: "12px",
                padding: "25px"
              }}
            >

              <div
                style={{
                  fontSize: "30px"
                }}
              >
                🚨
              </div>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: "5px"
                }}
              >
                Critical Emergencies
              </p>

              <h2
                style={{
                  margin: 0,
                  color: "#dc2626",
                  fontSize: "32px"
                }}
              >
                {analytics.criticalTrips}
              </h2>

            </div>


            {/* SERIOUS */}

            <div
              style={{
                background: "#fffbeb",
                border:
                  "1px solid #fde68a",
                borderRadius: "12px",
                padding: "25px"
              }}
            >

              <div
                style={{
                  fontSize: "30px"
                }}
              >
                ⚠️
              </div>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: "5px"
                }}
              >
                Serious Emergencies
              </p>

              <h2
                style={{
                  margin: 0,
                  color: "#d97706",
                  fontSize: "32px"
                }}
              >
                {analytics.seriousTrips}
              </h2>

            </div>


            {/* MODERATE */}

            <div
              style={{
                background: "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "25px"
              }}
            >

              <div
                style={{
                  fontSize: "30px"
                }}
              >
                🟢
              </div>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: "5px"
                }}
              >
                Moderate Emergencies
              </p>

              <h2
                style={{
                  margin: 0,
                  color: "#16a34a",
                  fontSize: "32px"
                }}
              >
                {analytics.moderateTrips}
              </h2>

            </div>

          </div>

        </section>


        {/* ======================================
            SYSTEM OVERVIEW
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
            📡 System Overview
          </h2>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px"
            }}
          >

            <div style={overviewStyle}>

              <span>
                🚑 Ambulance
              </span>

              <strong
                style={{
                  color: "#15803d"
                }}
              >
                ACTIVE
              </strong>

            </div>


            <div style={overviewStyle}>

              <span>
                👮 Police Coordination
              </span>

              <strong
                style={{
                  color: "#15803d"
                }}
              >
                ACTIVE
              </strong>

            </div>


            <div style={overviewStyle}>

              <span>
                🏥 Hospital Coordination
              </span>

              <strong
                style={{
                  color: "#15803d"
                }}
              >
                ACTIVE
              </strong>

            </div>


            <div style={overviewStyle}>

              <span>
                🚦 Traffic Management
              </span>

              <strong
                style={{
                  color: "#15803d"
                }}
              >
                ACTIVE
              </strong>

            </div>

          </div>

        </section>


        {/* ======================================
            EMERGENCY HISTORY
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
              justifyContent:
                "space-between",
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
                📜 Emergency Trip History
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: 0
                }}
              >
                Complete record of ambulance
                emergency journeys.
              </p>

            </div>


            <span
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                padding:
                  "8px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold"
              }}
            >
              Auto Refresh: 5 sec
            </span>

          </div>


          {loading ? (

            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#64748b"
              }}
            >
              Loading journey history...
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
              📜 No emergency trips recorded yet.
            </div>

          ) : (

            <div
              style={{
                overflowX: "auto"
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth: "1000px"
                }}
              >

                <thead>

                  <tr
                    style={{
                      background:
                        "#f1f5f9"
                    }}
                  >

                    <th style={thStyle}>
                      Ambulance
                    </th>

                    <th style={thStyle}>
                      Priority
                    </th>

                    <th style={thStyle}>
                      Hospital
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Started
                    </th>

                    <th style={thStyle}>
                      Completed
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {trips.map(
                    (trip) => (

                      <tr
                        key={
                          trip._id
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
                            {
                              trip.ambulanceId
                            }
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
                                trip.priority
                              )
                            }}
                          >
                            {
                              trip.priority
                            }
                          </span>

                        </td>


                        <td
                          style={
                            tdStyle
                          }
                        >

                          🏥{" "}
                          {
                            trip.hospital
                          }

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
                                trip.status
                              )
                            }}
                          >
                            {
                              trip.status
                            }
                          </span>

                        </td>


                        <td
                          style={
                            tdStyle
                          }
                        >

                          {
                            formatDate(
                              trip.createdAt
                            )
                          }

                        </td>


                        <td
                          style={
                            tdStyle
                          }
                        >

                          {
                            formatDate(
                              trip.completedAt
                            )
                          }

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* ======================================
            LAST UPDATED
        ====================================== */}

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#64748b",
            fontSize: "14px"
          }}
        >

          {lastUpdated
            ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
            : "Waiting for system data..."}

        </div>


        {/* ======================================
            FOOTER
        ====================================== */}

        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
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

  margin:
    "6px 0 0",

  color: "#1e3a5f",

  fontSize: "30px"

};


const overviewStyle = {

  background: "#f8fafc",

  padding: "20px",

  borderRadius: "10px",

  display: "flex",

  justifyContent:
    "space-between",

  alignItems: "center",

  gap: "15px"

};


const badgeStyle = {

  display:
    "inline-block",

  padding:
    "7px 12px",

  borderRadius:
    "20px",

  fontSize:
    "12px",

  fontWeight:
    "bold"

};


const thStyle = {

  padding:
    "15px",

  textAlign:
    "left",

  color:
    "#475569",

  fontSize:
    "14px",

  borderBottom:
    "2px solid #e2e8f0"

};


const tdStyle = {

  padding:
    "16px 15px",

  color:
    "#475569",

  fontSize:
    "14px"

};


export default AdminDashboard;