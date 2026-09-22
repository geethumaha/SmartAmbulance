const express = require("express");
const Trip = require("../models/Trip");

const router = express.Router();


// ======================================
// START EMERGENCY TRIP
// ======================================

router.post("/start", async (req, res) => {

  try {

    const {
      ambulanceId,
      priority,
      hospital,
      latitude,
      longitude
    } = req.body;


    // Check required information

    if (
      !ambulanceId ||
      !priority ||
      !hospital ||
      latitude === undefined ||
      longitude === undefined
    ) {

      return res.status(400).json({
        message: "Missing required trip information"
      });

    }


    // Create trip

    const trip = await Trip.create({

      ambulanceId: ambulanceId,

      priority: priority,

      hospital: hospital,

      startLocation: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      },

      currentLocation: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      },

      status: "ACTIVE"

    });


    console.log(
      "Emergency trip created:",
      trip._id
    );


    res.status(201).json({

      message: "Emergency trip started successfully",

      trip: trip

    });

  }

  catch (error) {

    console.error(
      "START TRIP ERROR:",
      error
    );


    res.status(500).json({

      message: "Failed to start emergency trip",

      error: error.message

    });

  }

});


// ======================================
// GET ACTIVE EMERGENCY TRIPS
// ======================================

router.get("/active", async (req, res) => {

  try {

    const activeTrips = await Trip.find({
      status: "ACTIVE"
    }).sort({
      startedAt: -1
    });


    res.status(200).json({

      message: "Active trips retrieved successfully",

      count: activeTrips.length,

      trips: activeTrips

    });

  }

  catch (error) {

    console.error(
      "GET ACTIVE TRIPS ERROR:",
      error
    );


    res.status(500).json({

      message: "Failed to retrieve active trips",

      error: error.message

    });

  }

});


// ======================================
// END EMERGENCY TRIP
// ======================================

router.put("/end/:tripId", async (req, res) => {

  try {

    const { tripId } = req.params;


    const trip = await Trip.findByIdAndUpdate(

      tripId,

      {
        status: "COMPLETED",
        completedAt: new Date()
      },

      {
        new: true
      }

    );


    if (!trip) {

      return res.status(404).json({
        message: "Trip not found"
      });

    }


    console.log(
      "Emergency trip completed:",
      trip._id
    );


    res.status(200).json({

      message: "Emergency trip completed successfully",

      trip: trip

    });

  }

  catch (error) {

    console.error(
      "END TRIP ERROR:",
      error
    );


    res.status(500).json({

      message: "Failed to end emergency trip",

      error: error.message

    });

  }

});


module.exports = router;