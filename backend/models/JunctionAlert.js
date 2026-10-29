const mongoose = require("mongoose");

// Police officer assignment schema
const assignedOfficerSchema = new mongoose.Schema(
  {
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "ACCEPTED",
        "CLEARING",
        "CLEARED",
        "PASSED"
      ],
      default: "ASSIGNED"
    },

    assignedAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// Junction alert schema
const junctionAlertSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true
    },

    ambulanceId: {
      type: String,
      required: true
    },

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

    distanceFromAmbulance: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["UPCOMING", "PREPARING", "CLEARED", "PASSED"],
      default: "UPCOMING"
    },

    priority: {
      type: String,
      enum: ["Critical", "Serious", "Moderate"],
      required: true
    },

    // Multiple police officers can be assigned to a junction
    assignedOfficers: {
      type: [assignedOfficerSchema],
      default: []
    }
  },
  { timestamps: true }
);

const JunctionAlert = mongoose.model(
  "JunctionAlert",
  junctionAlertSchema
);

module.exports = JunctionAlert;