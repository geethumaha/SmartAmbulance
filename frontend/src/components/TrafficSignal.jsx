import { useEffect, useState } from "react";


function TrafficSignal({ emergencyActive }) {

  const [signal, setSignal] = useState("RED");


  // ==========================================
  // NORMAL SIGNAL CYCLE
  // ==========================================

  useEffect(() => {

    if (emergencyActive) {

      setSignal("GREEN");

      return;

    }


    const signals = [
      "RED",
      "GREEN",
      "YELLOW"
    ];

    let index = 0;


    const interval = setInterval(() => {

      index =
        (index + 1) %
        signals.length;

      setSignal(
        signals[index]
      );

    }, 3000);


    return () => {

      clearInterval(interval);

    };

  }, [emergencyActive]);


  // ==========================================
  // SIGNAL COLORS
  // ==========================================

  const isRed =
    signal === "RED";

  const isYellow =
    signal === "YELLOW";

  const isGreen =
    signal === "GREEN";


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
        🚦 Smart Traffic Signal
      </h2>


      <p
        style={{
          color: "#64748b"
        }}
      >
        Emergency traffic priority simulation
      </p>


      {/* ===================================== */}
      {/* SIGNAL */}
      {/* ===================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "25px"
        }}
      >

        <div
          style={{
            background: "#1f2937",
            padding: "18px",
            borderRadius: "20px",
            width: "80px"
          }}
        >

          {/* RED */}

          <div
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "50%",
              margin: "0 auto 15px",

              background:
                isRed
                  ? "#ef4444"
                  : "#4b5563",

              boxShadow:
                isRed
                  ? "0 0 25px #ef4444"
                  : "none"
            }}
          />


          {/* YELLOW */}

          <div
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "50%",
              margin: "0 auto 15px",

              background:
                isYellow
                  ? "#facc15"
                  : "#4b5563",

              boxShadow:
                isYellow
                  ? "0 0 25px #facc15"
                  : "none"
            }}
          />


          {/* GREEN */}

          <div
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "50%",
              margin: "0 auto",

              background:
                isGreen
                  ? "#22c55e"
                  : "#4b5563",

              boxShadow:
                isGreen
                  ? "0 0 25px #22c55e"
                  : "none"
            }}
          />

        </div>

      </div>


      {/* ===================================== */}
      {/* STATUS */}
      {/* ===================================== */}

      <div
        style={{
          textAlign: "center",
          marginTop: "20px"
        }}
      >

        {emergencyActive ? (

          <div
            style={{
              padding: "15px",
              background: "#dcfce7",
              color: "#15803d",
              borderRadius: "10px",
              fontWeight: "bold"
            }}
          >

            🚑 EMERGENCY PRIORITY ACTIVE

            <div
              style={{
                marginTop: "6px",
                fontWeight: "normal"
              }}
            >
              Green signal reserved for
              emergency ambulance.

            </div>

          </div>

        ) : (

          <div
            style={{
              padding: "15px",
              background: "#f1f5f9",
              color: "#475569",
              borderRadius: "10px",
              fontWeight: "bold"
            }}
          >

            🚦 NORMAL TRAFFIC MODE

            <div
              style={{
                marginTop: "6px",
                fontWeight: "normal"
              }}
            >
              Signal operating normally.

            </div>

          </div>

        )}

      </div>

    </div>

  );

}


export default TrafficSignal;