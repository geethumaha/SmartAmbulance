const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");

const app = express();

/*
========================================
MIDDLEWARE
========================================
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));


/*
========================================
HTTP SERVER
========================================
*/

const server = http.createServer(app);


/*
========================================
SOCKET.IO
========================================
*/

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});


/*
========================================
MAKE SOCKET.IO AVAILABLE TO ROUTES
========================================
*/

app.set("io", io);


/*
========================================
SOCKET.IO CONNECTION
========================================
*/

io.on("connection", (socket) => {

  console.log("🔌 Socket connected:", socket.id);


  /*
  ----------------------------------------
  Police joins police room
  ----------------------------------------
  */

  socket.on("join-police", () => {

    socket.join("police");

    console.log(
      `👮 Police dashboard joined: ${socket.id}`
    );

  });


  /*
  ----------------------------------------
  Ambulance joins ambulance room
  ----------------------------------------
  */

  socket.on("join-ambulance", (ambulanceId) => {

    if (!ambulanceId) {
      return;
    }

    socket.join(`ambulance-${ambulanceId}`);

    console.log(
      `🚑 Ambulance ${ambulanceId} joined room`
    );

  });


  /*
  ----------------------------------------
  Hospital joins hospital room
  ----------------------------------------
  */

  socket.on("join-hospital", () => {

    socket.join("hospital");

    console.log(
      `🏥 Hospital dashboard joined: ${socket.id}`
    );

  });


  /*
  ----------------------------------------
  Admin joins admin room
  ----------------------------------------
  */

  socket.on("join-admin", () => {

    socket.join("admin");

    console.log(
      `👨‍💼 Admin dashboard joined: ${socket.id}`
    );

  });


  /*
  ----------------------------------------
  Ambulance sends live GPS location
  ----------------------------------------
  */

  socket.on("ambulance-location", (data) => {

    console.log(
      "📍 Live ambulance location:",
      data
    );


    /*
    Send live ambulance location
    to police dashboards.
    */

    io.to("police").emit(
      "ambulance-location-update",
      data
    );


    /*
    Send live ambulance location
    to hospital dashboards.
    */

    io.to("hospital").emit(
      "ambulance-location-update",
      data
    );

  });


  /*
  ----------------------------------------
  Ambulance sends emergency update
  ----------------------------------------
  */

  socket.on("emergency-update", (data) => {

    console.log(
      "🚨 Emergency update:",
      data
    );


    /*
    Police receive emergency update
    */

    io.to("police").emit(
      "emergency-alert",
      data
    );


    /*
    Hospital receives emergency update
    */

    io.to("hospital").emit(
      "emergency-alert",
      data
    );


    /*
    Admin receives emergency update
    */

    io.to("admin").emit(
      "emergency-alert",
      data
    );

  });


  /*
  ----------------------------------------
  Disconnect
  ----------------------------------------
  */

  socket.on("disconnect", () => {

    console.log(
      "❌ Socket disconnected:",
      socket.id
    );

  });

});


/*
========================================
TEST ROUTE
========================================
*/

app.get("/", (req, res) => {

  res.json({
    message: "Smart Ambulance Backend is running 🚑"
  });

});


/*
========================================
API ROUTES
========================================
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/trips",
  tripRoutes
);


/*
========================================
MONGODB CONNECTION
========================================
*/

const MONGODB_URI =
  process.env.MONGODB_URI;

if (!MONGODB_URI) {

  console.error(
    "❌ MONGODB_URI is missing in .env file"
  );

  process.exit(1);
}


mongoose
  .connect(MONGODB_URI)
  .then(() => {

    console.log(
      "✅ MongoDB connected successfully!"
    );


    /*
    ========================================
    START SERVER
    ========================================
    */

    server.listen(5000, () => {

      console.log(
        "🚑 Smart Ambulance Server running on http://localhost:5000"
      );

      console.log(
        "🔌 Socket.IO is ready for real-time communication"
      );

    });

  })

  .catch((error) => {

    console.error(
      "❌ MongoDB connection failed:"
    );

    console.error(
      error.message
    );

  });