const express = require("express");
const Trip = require("../models/Trip");

const router = express.Router();


// ==========================================
// START EMERGENCY TRIP
// ==========================================

router.post("/start", async (req, res) => {

  try {

    const {
      ambulanceId,
      priority,
      hospital,
      latitude,
      longitude
    } = req.body;


    if (
      !ambulanceId ||
      !priority ||
      !hospital ||
      latitude === undefined ||
      longitude === undefined
    ) {

      return res.status(400).json({
        message:
          "Missing required trip information"
      });

    }


    const trip = await Trip.create({

      ambulanceId,

      priority,

      hospital,

      startLocation: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      },

      currentLocation: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      },

      status: "ACTIVE",

      trafficClearance: "PENDING"

    });


    console.log(
      "Emergency trip created:",
      trip._id
    );


    res.status(201).json({

      message:
        "Emergency trip started successfully",

      trip

    });


  } catch (error) {

    console.error(
      "START TRIP ERROR:",
      error
    );


    res.status(500).json({

      message:
        "Failed to start emergency trip",

      error: error.message

    });

  }

});



// ==========================================
// UPDATE AMBULANCE LOCATION
// ==========================================

router.put(
  "/update-location/:tripId",
  async (req, res) => {

    try {

      const { tripId } = req.params;

      const {
        latitude,
        longitude
      } = req.body;


      if (
        latitude === undefined ||
        longitude === undefined
      ) {

        return res.status(400).json({

          message:
            "Latitude and longitude are required"

        });

      }


      const trip =
        await Trip.findOneAndUpdate(

          {
            _id: tripId,

            status: "ACTIVE"

          },

          {

            currentLocation: {

              latitude: Number(latitude),

              longitude: Number(longitude)

            }

          },

          {
            new: true
          }

        );


      if (!trip) {

        return res.status(404).json({

          message:
            "Active trip not found"

        });

      }


      console.log(
        "Ambulance location updated:",
        latitude,
        longitude
      );


      res.status(200).json({

        message:
          "Ambulance location updated successfully",

        trip

      });


    } catch (error) {

      console.error(
        "UPDATE LOCATION ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Failed to update ambulance location",

        error: error.message

      });

    }

  }
);



// ==========================================
// GET ACTIVE TRIPS
// ==========================================

router.get("/active", async (req, res) => {

  try {

    const activeTrips =
      await Trip.find({

        status: "ACTIVE"

      }).sort({

        startedAt: -1

      });


    res.status(200).json({

      message:
        "Active trips retrieved successfully",

      count: activeTrips.length,

      trips: activeTrips

    });


  } catch (error) {

    console.error(
      "GET ACTIVE TRIPS ERROR:",
      error
    );


    res.status(500).json({

      message:
        "Failed to retrieve active trips",

      error: error.message

    });

  }

});



// ==========================================
// UPDATE TRAFFIC CLEARANCE
// ==========================================

router.put(
  "/clearance/:tripId",
  async (req, res) => {

    try {

      const { tripId } = req.params;

      const { clearance } = req.body;


      const validStatuses = [
        "PENDING",
        "PREPARING",
        "CLEARED"
      ];


      if (!validStatuses.includes(clearance)) {

        return res.status(400).json({

          message:
            "Invalid traffic clearance status"

        });

      }


      const trip =
        await Trip.findByIdAndUpdate(

          tripId,

          {
            trafficClearance: clearance
          },

          {
            new: true
          }

        );


      if (!trip) {

        return res.status(404).json({

          message:
            "Trip not found"

        });

      }


      console.log(
        `Traffic clearance updated: ${trip.ambulanceId} → ${clearance}`
      );


      res.status(200).json({

        message:
          "Traffic clearance updated successfully",

        trip

      });


    } catch (error) {

      console.error(
        "TRAFFIC CLEARANCE ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Failed to update traffic clearance",

        error: error.message

      });

    }

  }
);



// ==========================================
// END EMERGENCY TRIP
// ==========================================

router.put(
  "/end/:tripId",
  async (req, res) => {

    try {

      const { tripId } = req.params;


      const trip =
        await Trip.findByIdAndUpdate(

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

          message:
            "Trip not found"

        });

      }


      console.log(
        "Emergency trip completed:",
        trip._id
      );


      res.status(200).json({

        message:
          "Emergency trip completed successfully",

        trip

      });


    } catch (error) {

      console.error(
        "END TRIP ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Failed to end emergency trip",

        error: error.message

      });

    }

  }
);


module.exports = router;