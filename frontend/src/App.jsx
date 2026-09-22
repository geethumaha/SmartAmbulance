import { useState } from "react";
import axios from "axios";

import Login from "./pages/Login";
import PoliceDashboard from "./pages/PoliceDashboard";

import "./App.css";

function App() {

  const [backendStatus, setBackendStatus] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState("");

  const testBackend = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/"
      );

      setBackendStatus(response.data.message);

    } catch (error) {

      setBackendStatus(
        "❌ Backend connection failed"
      );

      console.error(error);

    }

  };


  const openLogin = (role) => {

    setLoginRole(role);
    setShowLogin(true);

  };


  if (showLogin) {

    return (
      <Login
        role={loginRole}
      />
    );

  }


  return (

    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="logo">
          🚑
        </div>

        <div>

          <h1>
            Smart Ambulance
          </h1>

          <p>
            Emergency Traffic Coordination System
          </p>

        </div>

      </header>


      {/* MAIN */}

      <main className="main">

        <section className="welcome-section">

          <h2>
            Welcome to Smart Ambulance
          </h2>

          <p>
            A real-time emergency coordination system
            connecting ambulances, traffic police,
            hospitals, and administrators.
          </p>


          <button
            className="connection-button"
            onClick={testBackend}
          >
            Test Backend Connection
          </button>


          {backendStatus && (

            <p className="backend-status">
              {backendStatus}
            </p>

          )}

        </section>


        {/* ROLE SECTION */}

        <section className="role-section">

          <h3>
            Select Your Role
          </h3>


          <div className="role-container">


            {/* AMBULANCE */}

            <div className="role-card">

              <div className="role-icon">
                🚑
              </div>

              <h4>
                Ambulance
              </h4>

              <p>
                Start an emergency trip,
                share GPS location,
                and view your route and ETA.
              </p>

              <button
                onClick={() =>
                  openLogin("ambulance")
                }
              >
                Ambulance Login
              </button>

            </div>


            {/* POLICE */}

            <div className="role-card">

              <div className="role-icon">
                👮
              </div>

              <h4>
                Traffic Police
              </h4>

              <p>
                Monitor ambulances,
                receive junction alerts,
                and manage traffic priority.
              </p>

              <button
                onClick={() =>
                  openLogin("police")
                }
              >
                Police Login
              </button>

            </div>


            {/* HOSPITAL */}

            <div className="role-card">

              <div className="role-icon">
                🏥
              </div>

              <h4>
                Hospital
              </h4>

              <p>
                Track incoming ambulances
                and prepare for emergency arrivals.
              </p>

              <button>
                Hospital Login
              </button>

            </div>


            {/* ADMIN */}

            <div className="role-card">

              <div className="role-icon">
                👨‍💼
              </div>

              <h4>
                Administrator
              </h4>

              <p>
                Manage users, ambulances,
                hospitals, emergencies,
                and analytics.
              </p>

              <button>
                Admin Login
              </button>

            </div>


          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer>

        <p>
          Smart Ambulance © 2026 |
          Emergency Coordination Platform
        </p>

      </footer>

    </div>

  );

}


export default App;