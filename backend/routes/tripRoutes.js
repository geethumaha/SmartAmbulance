const express = require("express");

const Trip = require("../models/Trip");
const JunctionAlert = require("../models/JunctionAlert");

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

      const { tripId } =
        req.params;

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

              latitude:
                Number(latitude),

              longitude:
                Number(longitude)

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

router.get(
  "/active",
  async (req, res) => {

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

        count:
          activeTrips.length,

        trips:
          activeTrips

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

  }
);


// ==========================================
// UPDATE TRAFFIC CLEARANCE
// ==========================================

router.put(
  "/clearance/:tripId",
  async (req, res) => {

    try {

      const { tripId } =
        req.params;

      const { clearance } =
        req.body;


      const validStatuses = [

        "PENDING",

        "PREPARING",

        "CLEARED"

      ];


      if (
        !validStatuses.includes(
          clearance
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid traffic clearance status"

        });

      }


      const trip =
        await Trip.findByIdAndUpdate(

          tripId,

          {
            trafficClearance:
              clearance
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

      const { tripId } =
        req.params;


      const trip =
        await Trip.findByIdAndUpdate(

          tripId,

          {

            status:
              "COMPLETED",

            completedAt:
              new Date()

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


      // ======================================
      // MARK JUNCTION ALERTS AS PASSED
      // ======================================

      await JunctionAlert.updateMany(

        {
          tripId: tripId,

          status: {
            $in: [
              "UPCOMING",
              "PREPARING",
              "CLEARED"
            ]
          }

        },

        {
          status: "PASSED"
        }

      );


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


// ==========================================
// CREATE JUNCTION ALERT
// ==========================================

router.post(
  "/junction-alerts",
  async (req, res) => {

    try {

      const {
        tripId,
        junctionName,
        latitude,
        longitude,
        distanceFromAmbulance,
        priority
      } = req.body;


      // ======================================
      // VALIDATION
      // ======================================

      if (
        !tripId ||
        !junctionName ||
        latitude === undefined ||
        longitude === undefined ||
        distanceFromAmbulance === undefined ||
        !priority
      ) {

        return res.status(400).json({

          message:
            "Missing junction alert information"

        });

      }


      // ======================================
      // CHECK TRIP
      // ======================================

      const trip =
        await Trip.findOne({

          _id: tripId,

          status: "ACTIVE"

        });


      if (!trip) {

        return res.status(404).json({

          message:
            "Active trip not found"

        });

      }


      // ======================================
      // CREATE ALERT
      // ======================================

      const alert =
        await JunctionAlert.create({

          tripId:
            trip._id,

          ambulanceId:
            trip.ambulanceId,

          junctionName:

            junctionName,

          latitude:
            Number(latitude),

          longitude:
            Number(longitude),

          distanceFromAmbulance:
            Number(
              distanceFromAmbulance
            ),

          priority:
            priority,

          status:
            "UPCOMING"

        });


      console.log(
        "Junction alert created:",
        alert.junctionName
      );


      res.status(201).json({

        message:
          "Junction alert created successfully",

        alert

      });


    } catch (error) {

      console.error(
        "CREATE JUNCTION ALERT ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Failed to create junction alert",

        error:
          error.message

      });

    }

  }
);


// ==========================================
// GET JUNCTION ALERTS FOR A TRIP
// ==========================================

router.get(
  "/junction-alerts/:tripId",
  async (req, res) => {

    try {

      const { tripId } =
        req.params;


      const alerts =
        await JunctionAlert.find({

          tripId:
            tripId

        }).sort({

          distanceFromAmbulance:
            1

        });


      res.status(200).json({

        message:
          "Junction alerts retrieved successfully",

        count:
          alerts.length,

        alerts:
          alerts

      });


    } catch (error) {

      console.error(
        "GET JUNCTION ALERTS ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Failed to retrieve junction alerts",

        error:
          error.message

      });

    }

  }
);


// ==========================================
// UPDATE JUNCTION ALERT STATUS
// ==========================================

router.put(
  "/junction-alerts/status/:alertId",
  async (req, res) => {

    try {

      const { alertId } =
        req.params;

      const { status } =
        req.body;


      const validStatuses = [

        "UPCOMING",

        "PREPARING",

        "CLEARED",

        "PASSED"

      ];


      if (
        !validStatuses.includes(
          status
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid junction alert status"

        });

      }


      const alert =
        await JunctionAlert.findByIdAndUpdate(

          alertId,

          {

            status:
              status

          },

          {

            new: true

          }

        );


      if (!alert) {

        return res.status(404).json({

          message:
            "Junction alert not found"

        });

      }


      console.log(

        `Junction alert updated: ${alert.junctionName} → ${status}`

      );


      res.status(200).json({

        message:
          "Junction alert status updated successfully",

        alert

      });


    } catch (error) {

      console.error(
        "UPDATE JUNCTION ALERT ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Failed to update junction alert status",

        error:
          error.message

      });

    }

  }
);


module.exports = router;