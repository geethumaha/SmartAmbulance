import { useState } from "react";
import axios from "axios";

import AmbulanceDashboard from "./AmbulanceDashboard";
import PoliceDashboard from "./PoliceDashboard";
import HospitalDashboard from "./HospitalDashboard";
import AdminDashboard from "./AdminDashboard";


function Login({ role }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);


  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setMessage("");


    try {

      const response = await axios.post(

        "http://localhost:5000/api/auth/login",

        {
          email,
          password
        }

      );


      console.log(
        "Logged in user:",
        response.data.user
      );


      // ========================================
      // CHECK SELECTED ROLE
      // ========================================

      if (
        response.data.user.role !== role
      ) {

        setMessage(
          "❌ This account does not belong to the selected role."
        );

        return;

      }


      setMessage(
        "✅ Login successful!"
      );


      setTimeout(() => {

        setLoggedIn(true);

      }, 500);


    } catch (error) {

      console.error(error);


      if (error.response) {

        setMessage(
          `❌ ${error.response.data.message}`
        );

      } else {

        setMessage(
          "❌ Cannot connect to backend"
        );

      }

    }

  };


  // ==========================================
  // OPEN DASHBOARD
  // ==========================================

  if (loggedIn) {


    if (role === "ambulance") {

      return (
        <AmbulanceDashboard />
      );

    }


    if (role === "police") {

      return (
        <PoliceDashboard />
      );

    }


    if (role === "hospital") {

      return (
        <HospitalDashboard />
      );

    }


    if (role === "admin") {

      return (
        <AdminDashboard />
      );

    }

  }


  // ==========================================
  // ROLE INFORMATION
  // ==========================================

  const roleInfo = {

    ambulance: {
      icon: "🚑",
      title: "Ambulance Login"
    },

    police: {
      icon: "👮",
      title: "Traffic Police Login"
    },

    hospital: {
      icon: "🏥",
      title: "Hospital Login"
    },

    admin: {
      icon: "👨‍💼",
      title: "Administrator Login"
    }

  };


  const currentRole =
    roleInfo[role] ||
    roleInfo.ambulance;


  // ==========================================
  // LOGIN PAGE
  // ==========================================

  return (

    <div
      style={styles.container}
    >

      <div
        style={styles.loginBox}
      >


        <div
          style={styles.icon}
        >

          {currentRole.icon}

        </div>


        <h1
          style={styles.title}
        >

          Smart Ambulance

        </h1>


        <p
          style={styles.subtitle}
        >

          Emergency Coordination System

        </p>


        <h2
          style={styles.heading}
        >

          {currentRole.title}

        </h2>


        <form
          onSubmit={handleLogin}
        >


          <label
            style={styles.label}
          >
            Email
          </label>


          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={styles.input}
            required
          />


          <label
            style={styles.label}
          >
            Password
          </label>


          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={styles.input}
            required
          />


          <button
            type="submit"
            style={styles.button}
          >

            Login

          </button>


        </form>


        {message && (

          <p
            style={{
              ...styles.message,

              color:
                message.startsWith("✅")
                  ? "#15803d"
                  : "#dc2626"
            }}
          >

            {message}

          </p>

        )}

      </div>

    </div>

  );

}


// ==========================================
// STYLES
// ==========================================

const styles = {

  container: {

    minHeight: "100vh",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    background: "#eef6fb",

    fontFamily:
      "Arial, sans-serif"

  },


  loginBox: {

    width: "380px",

    padding: "40px",

    background: "white",

    borderRadius: "15px",

    boxShadow:
      "0 8px 25px rgba(0,0,0,0.12)",

    textAlign: "center"

  },


  icon: {

    fontSize: "55px",

    marginBottom: "10px"

  },


  title: {

    margin: "0",

    color: "#0f6fae"

  },


  subtitle: {

    color: "#666",

    marginTop: "8px"

  },


  heading: {

    marginTop: "30px",

    color: "#333"

  },


  label: {

    display: "block",

    textAlign: "left",

    marginTop: "18px",

    marginBottom: "6px",

    fontWeight: "bold",

    color: "#444"

  },


  input: {

    width: "100%",

    padding: "12px",

    border:
      "1px solid #ccc",

    borderRadius: "7px",

    fontSize: "15px",

    boxSizing: "border-box"

  },


  button: {

    width: "100%",

    marginTop: "25px",

    padding: "13px",

    border: "none",

    borderRadius: "7px",

    background: "#0f6fae",

    color: "white",

    fontSize: "16px",

    fontWeight: "bold",

    cursor: "pointer"

  },


  message: {

    marginTop: "20px",

    fontWeight: "bold"

  }

};


export default Login;