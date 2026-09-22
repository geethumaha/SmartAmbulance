import { useEffect, useState } from "react";
import axios from "axios";

function PoliceDashboard() {

  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");


  // ======================================
  // GET ACTIVE AMBULANCE TRIPS
  // ======================================

  const fetchActiveTrips = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/trips/active"
      );

      setActiveTrips(response.data.trips || []);

      setErrorMessage("");

    }

    catch (error) {

      console.error(
        "Failed to fetch active trips:",
        error
      );

      setErrorMessage(
        "❌ Unable to retrieve ambulance data"
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ======================================
  // LOAD DATA
  // ======================================

  useEffect(() => {

    fetchActiveTrips();

    const interval = setInterval(
      fetchActiveTrips,
      5000
    );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ======================================
  // CALCULATE CRITICAL TRIPS
  // ======================================

  const criticalTrips =
    activeTrips.filter(
      (trip) => trip.priority === "Critical"
    ).length;


  return (

    <div style={styles.page}>

      {/* HEADER */}

      <header style={styles.header}>

        <div>

          <h1 style={styles.title}>
            👮 Traffic Police Dashboard
          </h1>

          <p style={styles.subtitle}>
            Smart Ambulance Emergency Coordination System
          </p>

        </div>


        <div style={styles.statusBox}>

          <span style={styles.statusDot}>
            ●
          </span>

          SYSTEM ONLINE

        </div>

      </header>


      {/* MAIN */}

      <main style={styles.main}>


        {/* SUMMARY CARDS */}

        <section style={styles.cardContainer}>


          <div style={styles.summaryCard}>

            <div style={styles.icon}>
              🚑
            </div>

            <div>

              <p style={styles.cardLabel}>
                Active Ambulances
              </p>

              <h2 style={styles.cardNumber}>
                {activeTrips.length}
              </h2>

            </div>

          </div>


          <div style={styles.summaryCard}>

            <div style={styles.icon}>
              🔴
            </div>

            <div>

              <p style={styles.cardLabel}>
                Critical Emergencies
              </p>

              <h2 style={styles.cardNumber}>
                {criticalTrips}
              </h2>

            </div>

          </div>


          <div style={styles.summaryCard}>

            <div style={styles.icon}>
              🚦
            </div>

            <div>

              <p style={styles.cardLabel}>
                Junction Alerts
              </p>

              <h2 style={styles.cardNumber}>
                0
              </h2>

            </div>

          </div>


          <div style={styles.summaryCard}>

            <div style={styles.icon}>
              🏥
            </div>

            <div>

              <p style={styles.cardLabel}>
                Hospitals Notified
              </p>

              <h2 style={styles.cardNumber}>
                {activeTrips.length}
              </h2>

            </div>

          </div>


        </section>


        {/* ERROR */}

        {errorMessage && (

          <div style={styles.errorBox}>
            {errorMessage}
          </div>

        )}


        {/* ACTIVE AMBULANCES */}

        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            🚑 Active Ambulances
          </h2>


          {loading ? (

            <div style={styles.emptyBox}>

              <h3>
                Loading ambulance data...
              </h3>

            </div>

          ) : activeTrips.length === 0 ? (

            <div style={styles.emptyBox}>

              <div style={styles.emptyIcon}>
                🚑
              </div>

              <h3 style={styles.emptyTitle}>
                No Active Emergency Trips
              </h3>

              <p style={styles.emptyText}>
                Active ambulance emergency trips
                will appear here in real time.
              </p>

            </div>

          ) : (

            <div style={styles.tripContainer}>

              {activeTrips.map((trip) => (

                <div
                  key={trip._id}
                  style={styles.tripCard}
                >

                  <div style={styles.tripHeader}>

                    <div>

                      <h3 style={styles.ambulanceTitle}>
                        🚑 {trip.ambulanceId}
                      </h3>

                      <p style={styles.tripId}>
                        Trip ID: {trip._id}
                      </p>

                    </div>


                    <span
                      style={{
                        ...styles.priorityBadge,

                        background:
                          trip.priority === "Critical"
                            ? "#fee2e2"
                            : trip.priority === "Serious"
                            ? "#fef3c7"
                            : "#dcfce7",

                        color:
                          trip.priority === "Critical"
                            ? "#b91c1c"
                            : trip.priority === "Serious"
                            ? "#b45309"
                            : "#15803d"
                      }}
                    >

                      {trip.priority}

                    </span>

                  </div>


                  <div style={styles.tripDetails}>

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
                        🟢 Status
                      </strong>

                      <p style={styles.activeStatus}>
                        ACTIVE
                      </p>

                    </div>

                  </div>


                  <div style={styles.alertBanner}>

                    🚨 Ambulance is currently on an
                    emergency trip. Traffic coordination
                    may be required.

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* MAP */}

        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            🗺️ Live Ambulance Tracking
          </h2>

          <div style={styles.mapPlaceholder}>

            <div style={styles.mapIcon}>
              🗺️
            </div>

            <h3>
              Live Tracking Map
            </h3>

            <p>
              The ambulance locations shown above
              will be connected to the live map next.
            </p>

          </div>

        </section>


        {/* JUNCTION ALERTS */}

        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            🚦 Junction Alerts
          </h2>

          <div style={styles.alertBox}>

            <div style={styles.alertIcon}>
              🚦
            </div>

            <div>

              <h3 style={styles.alertTitle}>
                Junction alert system ready
              </h3>

              <p style={styles.alertText}>
                Junction alerts will be generated when
                an ambulance approaches a traffic signal.
              </p>

            </div>

          </div>

        </section>


      </main>


      {/* FOOTER */}

      <footer style={styles.footer}>

        <p>
          Smart Ambulance © 2026 |
          Traffic Police Emergency Coordination
        </p>

      </footer>

    </div>

  );

}


// ======================================
// STYLES
// ======================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f3f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#1f2937"
  },


  header: {
    background: "#1e3a5f",
    color: "white",
    padding: "22px 35px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },


  title: {
    margin: 0,
    fontSize: "28px"
  },


  subtitle: {
    margin: "7px 0 0",
    color: "#dbeafe",
    fontSize: "15px"
  },


  statusBox: {
    background: "#ffffff",
    color: "#166534",
    padding: "10px 16px",
    borderRadius: "20px",
    fontWeight: "bold"
  },


  statusDot: {
    marginRight: "7px"
  },


  main: {
    padding: "30px 35px",
    maxWidth: "1300px",
    margin: "auto"
  },


  cardContainer: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },


  summaryCard: {
    background: "white",
    borderRadius: "14px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)"
  },


  icon: {
    fontSize: "38px"
  },


  cardLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px"
  },


  cardNumber: {
    margin: "5px 0 0",
    fontSize: "28px",
    color: "#1e3a5f"
  },


  section: {
    background: "white",
    borderRadius: "14px",
    padding: "25px",
    marginBottom: "25px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.07)"
  },


  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#1e3a5f"
  },


  emptyBox: {
    textAlign: "center",
    padding: "40px",
    border: "2px dashed #dbe3ec",
    borderRadius: "12px"
  },


  emptyIcon: {
    fontSize: "45px"
  },


  emptyTitle: {
    color: "#475569",
    marginBottom: "8px"
  },


  emptyText: {
    color: "#64748b",
    margin: 0
  },


  tripContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },


  tripCard: {
    border: "1px solid #dbe3ec",
    borderRadius: "12px",
    padding: "20px",
    background: "#fbfdff"
  },


  tripHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px"
  },


  ambulanceTitle: {
    margin: 0,
    color: "#1e3a5f"
  },


  tripId: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#64748b"
  },


  priorityBadge: {
    padding: "7px 13px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px"
  },


  tripDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    padding: "15px 0"
  },


  tripDetailsP: {
    margin: "5px 0 0"
  },


  activeStatus: {
    color: "#15803d",
    fontWeight: "bold"
  },


  alertBanner: {
    marginTop: "10px",
    padding: "13px",
    background: "#fff7ed",
    color: "#c2410c",
    borderRadius: "8px",
    fontWeight: "bold"
  },


  mapPlaceholder: {
    height: "300px",
    borderRadius: "12px",
    background: "#e8f0f7",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#64748b"
  },


  mapIcon: {
    fontSize: "55px"
  },


  alertBox: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "10px"
  },


  alertIcon: {
    fontSize: "40px"
  },


  alertTitle: {
    margin: 0,
    color: "#475569"
  },


  alertText: {
    margin: "6px 0 0",
    color: "#64748b"
  },


  errorBox: {
    padding: "15px",
    marginBottom: "20px",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "10px",
    fontWeight: "bold"
  },


  footer: {
    textAlign: "center",
    padding: "20px",
    color: "#64748b",
    fontSize: "13px"
  }

};


export default PoliceDashboard;