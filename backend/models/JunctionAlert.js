const mongoose = require("mongoose");


// ==========================================
// JUNCTION ALERT SCHEMA
// ==========================================

const junctionAlertSchema =
  new mongoose.Schema(
    {

      // ======================================
      // RELATED EMERGENCY TRIP
      // ======================================

      tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
      },


      // ======================================
      // AMBULANCE
      // ======================================

      ambulanceId: {
        type: String,
        required: true
      },


      // ======================================
      // JUNCTION INFORMATION
      // ======================================

      junctionName: {
        type: String,
        required: true
      },


      latitude: {
        type: Number,
        required: true
      },


      longitude: {
        type: Number,
        required: true
      },


      // ======================================
      // DISTANCE FROM AMBULANCE
      // ======================================

      distanceFromAmbulance: {
        type: Number,
        required: true
      },


      // ======================================
      // ALERT STATUS
      // ======================================

      status: {
        type: String,

        enum: [
          "UPCOMING",
          "PREPARING",
          "CLEARED",
          "PASSED"
        ],

        default: "UPCOMING"
      },


      // ======================================
      // PRIORITY
      // ======================================

      priority: {
        type: String,

        enum: [
          "Critical",
          "Serious",
          "Moderate"
        ],

        required: true
      }

    },

    {
      timestamps: true
    }

  );


const JunctionAlert =
  mongoose.model(
    "JunctionAlert",
    junctionAlertSchema
  );


module.exports =
  JunctionAlert;