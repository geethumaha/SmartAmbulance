const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    ambulanceId: {
      type: String,
      required: true
    },

    priority: {
      type: String,
      enum: [
        "Critical",
        "Serious",
        "Moderate"
      ],
      required: true
    },

    hospital: {
      type: String,
      required: true
    },

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

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "COMPLETED"
      ],
      default: "ACTIVE"
    },

    trafficClearance: {
      type: String,
      enum: [
        "PENDING",
        "PREPARING",
        "CLEARED"
      ],
      default: "PENDING"
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date,
      default: null
    }
  },

  {
    timestamps: true
  }
);

const Trip = mongoose.model(
  "Trip",
  tripSchema
);

module.exports = Trip;