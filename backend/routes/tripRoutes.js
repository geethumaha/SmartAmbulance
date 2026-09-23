const express = require("express");

const Trip = require("../models/Trip");
const JunctionAlert = require("../models/JunctionAlert");

const junctions = require("../data/junctions");
const calculateDistance = require("../utils/distance");

const router = express.Router();


// ==========================================
// START TRIP
// ==========================================

router.post("/start", async (req, res) => {

  try {

    const {
      ambulanceId,
      priority,
      hospital,
      startLocation
    } = req.body;


    if (
      !ambulanceId ||
      !priority ||
      !hospital ||
      !startLocation
    ) {

      return res.status(400).json({
        message:
          "Please provide ambulanceId, priority, hospital, and startLocation"
      });

    }


    const trip = await Trip.create({

      ambulanceId,
      priority,
      hospital,

      startLocation,

      currentLocation:
        startLocation,

      status:
        "ACTIVE",

      trafficClearance:
        "PENDING"

    });


    res.status(201).json({

      message:
        "Trip started successfully",

      trip

    });


  } catch (error) {

    console.error(
      "Start trip error:",
      error.message
    );


    res.status(500).json({

      message:
        "Server error",

      error:
        error.message

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

      const {
        tripId
      } = req.params;


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
        await Trip.findById(
          tripId
        );


      if (!trip) {

        return res.status(404).json({

          message:
            "Trip not found"

        });

      }


      if (
        trip.status !== "ACTIVE"
      ) {

        return res.status(400).json({

          message:
            "Trip is not active"

        });

      }


      // ====================================
      // UPDATE LIVE GPS LOCATION
      // ====================================

      trip.currentLocation = {

        latitude:
          Number(latitude),

        longitude:
          Number(longitude)

      };


      await trip.save();


      // ====================================
      // JUNCTION DETECTION SETTINGS
      // ====================================

      const detectionRadius =
        1000;

      const passedThreshold =
        100;


      // ====================================
      // CHECK ALL JUNCTIONS
      // ====================================

      for (
        const junction of junctions
      ) {

        const distance =
          calculateDistance(

            Number(latitude),

            Number(longitude),

            junction.latitude,

            junction.longitude

          );


        const roundedDistance =
          Math.round(distance);


        // ==================================
        // FIND EXISTING ALERT
        // ==================================

        const existingAlert =
          await JunctionAlert.findOne({

            tripId:
              tripId,

            junctionName:
              junction.name

          });


        // ==================================
        // JUNCTION WITHIN 1 KM
        // ==================================

        if (
          distance <=
          detectionRadius
        ) {

          // ================================
          // CREATE NEW AUTOMATIC ALERT
          // ================================

          if (!existingAlert) {

            await JunctionAlert.create({

              tripId:

                tripId,

              ambulanceId:

                trip.ambulanceId,

              junctionName:

                junction.name,

              latitude:

                junction.latitude,

              longitude:

                junction.longitude,

              distanceFromAmbulance:

                roundedDistance,

              status:

                "UPCOMING",

              priority:

                trip.priority

            });


            console.log(

              `🚨 Junction alert created: ${junction.name} - ${roundedDistance}m`

            );

          }


          // ================================
          // UPDATE EXISTING ALERT
          // ================================

          else if (

            existingAlert.status !==
              "PASSED"

          ) {

            // --------------------------------
            // CHECK WHETHER AMBULANCE PASSED
            // --------------------------------
            //
            // If the previous recorded
            // distance was very close to the
            // junction and the ambulance is
            // now moving away, mark PASSED.

            if (

              existingAlert.distanceFromAmbulance <=
                50 &&

              distance >
                passedThreshold

            ) {

              existingAlert.status =
                "PASSED";


              console.log(

                `✅ Junction passed: ${junction.name}`

              );

            }


            else {

              existingAlert.distanceFromAmbulance =
                roundedDistance;

            }


            await existingAlert.save();

          }

        }


        // ==================================
        // JUNCTION OUTSIDE 1 KM
        // ==================================

        else if (

          existingAlert &&

          existingAlert.status !==
            "PASSED"

        ) {

          // --------------------------------
          // PASSED CHECK
          // --------------------------------

          if (

            existingAlert.distanceFromAmbulance <=
              50

          ) {

            existingAlert.status =
              "PASSED";


            console.log(

              `✅ Junction passed: ${junction.name}`

            );

          }


          else {

            existingAlert.distanceFromAmbulance =
              roundedDistance;

          }


          await existingAlert.save();

        }

      }


      res.status(200).json({

        message:
          "Ambulance location updated successfully",

        currentLocation:
          trip.currentLocation

      });


    } catch (error) {

      console.error(

        "Update location error:",

        error.message

      );


      res.status(500).json({

        message:
          "Server error",

        error:
          error.message

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

      const trips =
        await Trip.find({

          status:
            "ACTIVE"

        }).sort({

          createdAt:
            -1

        });


      res.status(200).json({

        message:
          "Active trips retrieved successfully",

        count:
          trips.length,

        trips

      });


    } catch (error) {

      console.error(

        "Get active trips error:",
        error.message

      );


      res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ==========================================
// UPDATE TRIP TRAFFIC CLEARANCE
// ==========================================

router.put(
  "/clearance/:tripId",
  async (req, res) => {

    try {

      const {
        tripId
      } = req.params;


      const {
        clearance
      } = req.body;


      const validClearances = [

        "PENDING",
        "PREPARING",
        "CLEARED"

      ];


      if (
        !validClearances.includes(
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
            new:
              true
          }

        );


      if (!trip) {

        return res.status(404).json({

          message:
            "Trip not found"

        });

      }


      res.status(200).json({

        message:
          "Traffic clearance updated successfully",

        trip

      });


    } catch (error) {

      console.error(

        "Traffic clearance error:",
        error.message

      );


      res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ==========================================
// END TRIP
// ==========================================

router.put(
  "/end/:tripId",
  async (req, res) => {

    try {

      const {
        tripId
      } = req.params;


      const trip =
        await Trip.findByIdAndUpdate(

          tripId,

          {

            status:
              "COMPLETED",

            completedAt:
              new Date(),

            trafficClearance:
              "CLEARED"

          },

          {
            new:
              true
          }

        );


      if (!trip) {

        return res.status(404).json({

          message:
            "Trip not found"

        });

      }


      // ==================================
      // MARK REMAINING ALERTS AS PASSED
      // ==================================

      await JunctionAlert.updateMany(

        {

          tripId:

            tripId,

          status: {

            $in: [

              "UPCOMING",
              "PREPARING",
              "CLEARED"

            ]

          }

        },

        {

          status:
            "PASSED"

        }

      );


      res.status(200).json({

        message:
          "Trip ended successfully",

        trip

      });


    } catch (error) {

      console.error(

        "End trip error:",
        error.message

      );


      res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ==========================================
// CREATE MANUAL JUNCTION ALERT
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
            "Please provide all junction alert details"

        });

      }


      const trip =
        await Trip.findById(
          tripId
        );


      if (!trip) {

        return res.status(404).json({

          message:
            "Trip not found"

        });

      }


      const alert =
        await JunctionAlert.create({

          tripId,

          ambulanceId:
            trip.ambulanceId,

          junctionName,

          latitude,

          longitude,

          distanceFromAmbulance,

          priority,

          status:
            "UPCOMING"

        });


      res.status(201).json({

        message:
          "Junction alert created successfully",

        alert

      });


    } catch (error) {

      console.error(

        "Create junction alert error:",
        error.message

      );


      res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ==========================================
// GET JUNCTION ALERTS
// ==========================================

router.get(
  "/junction-alerts/:tripId",
  async (req, res) => {

    try {

      const {
        tripId
      } = req.params;


      const alerts =
        await JunctionAlert.find({

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

        alerts

      });


    } catch (error) {

      console.error(

        "Get junction alerts error:",
        error.message

      );


      res.status(500).json({

        message:
          "Server error",

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

      const {
        alertId
      } = req.params;


      const {
        status
      } = req.body;


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
            status
          },

          {
            new:
              true
          }

        );


      if (!alert) {

        return res.status(404).json({

          message:
            "Junction alert not found"

        });

      }


      res.status(200).json({

        message:
          "Junction alert status updated successfully",

        alert

      });


    } catch (error) {

      console.error(

        "Update junction alert status error:",
        error.message

      );


      res.status(500).json({

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


module.exports = router;