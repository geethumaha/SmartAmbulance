const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    // Ambulance that started the trip
    ambulanceId: {
      type: String,
      required: true
    },

    // Emergency priority
    priority: {
      type: String,
      enum: ["Critical", "Serious", "Moderate"],
      required: true
    },

    // Destination hospital
    hospital: {
      type: String,
      required: true
    },

    // Starting GPS location
    startLocation: {
      latitude: {
        type: Number,
        required: true
      },

      longitude: {
        type: Number,
        required: true
      }
    },

    // Current GPS location
    currentLocation: {
      latitude: {
        type: Number,
        required: true
      },

      longitude: {
        type: Number,
        required: true
      }
    },

    // Trip status
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED"],
      default: "ACTIVE"
    },

    // Trip start time
    startedAt: {
      type: Date,
      default: Date.now
    },

    // Trip completion time
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;