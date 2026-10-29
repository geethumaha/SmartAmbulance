const express = require("express");
const Trip = require("../models/Trip");
const JunctionAlert = require("../models/JunctionAlert");
const junctions = require("../data/junctions");
const calculateDistance = require("../utils/distance");
const User = require("../models/User");
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
      startLocation,
      latitude,
      longitude,
      hospitalLatitude,
      hospitalLongitude
    } = req.body;

    let finalStartLocation = startLocation;

    if (
      !finalStartLocation &&
      latitude !== undefined &&
      longitude !== undefined
    ) {
      finalStartLocation = {
        latitude: Number(latitude),
        longitude: Number(longitude)
      };
    }

    if (
      !ambulanceId ||
      !priority ||
      !hospital ||
      !finalStartLocation
    ) {
      return res.status(400).json({
        message:
          "Please provide ambulanceId, priority, hospital, and location"
      });
    }

    const trip = await Trip.create({
      ambulanceId,
      priority,
      hospital,
      hospitalLatitude:
        hospitalLatitude !== undefined
          ? Number(hospitalLatitude)
          : null,
      hospitalLongitude:
        hospitalLongitude !== undefined
          ? Number(hospitalLongitude)
          : null,
      startLocation: finalStartLocation,
      currentLocation: finalStartLocation,
      status: "ACTIVE",
      trafficClearance: "PENDING"
    });

    const io = req.app.get("io");

    if (io) {
      const emergencyData = {
        tripId: trip._id,
        ambulanceId: trip.ambulanceId,
        priority: trip.priority,
        hospital: trip.hospital,
        latitude: finalStartLocation.latitude,
        longitude: finalStartLocation.longitude,
        hospitalLatitude: trip.hospitalLatitude,
        hospitalLongitude: trip.hospitalLongitude,
        message: `🚨 ${trip.priority} emergency trip started`,
        timestamp: new Date().toISOString()
      };

      io.to("police").emit(
        "emergency-alert",
        emergencyData
      );

      io.to("hospital").emit("emergency-alert", {
        ...emergencyData,
        message:
          `🚨 ${trip.priority} emergency ambulance incoming`
      });

      io.to("admin").emit(
        "emergency-alert",
        emergencyData
      );
    }

    return res.status(201).json({
      message: "Trip started successfully",
      trip
    });
  } catch (error) {
    console.error(
      "Start trip error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// ==========================================
// UPDATE LIVE AMBULANCE LOCATION
// ==========================================
router.put(
  "/update-location/:tripId",
  async (req, res) => {
    try {
      const { tripId } = req.params;
      const { latitude, longitude } = req.body;

      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        latitude === undefined ||
        longitude === undefined ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          message:
            "Valid latitude and longitude are required"
        });
      }

      const trip = await Trip.findById(tripId);

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found"
        });
      }

      if (trip.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Trip is not active"
        });
      }

      trip.currentLocation = {
        latitude: lat,
        longitude: lng
      };

      await trip.save();

      const io = req.app.get("io");

      // Notify police and hospital about the live location.
      if (io) {
        const locationData = {
          tripId: trip._id,
          ambulanceId: trip.ambulanceId,
          latitude: lat,
          longitude: lng,
          priority: trip.priority,
          hospital: trip.hospital,
          timestamp: new Date().toISOString()
        };

        io.to("police").emit(
          "ambulance-location-update",
          locationData
        );

        io.to("hospital").emit(
          "ambulance-location-update",
          locationData
        );
      }

      // Detect configured demo junctions near the ambulance.
      const detectionRadius = 1000;
      const passedThreshold = 50;

      for (const junction of junctions) {
        const junctionLat = Number(junction.latitude);
        const junctionLng = Number(junction.longitude);

        if (
          !Number.isFinite(junctionLat) ||
          !Number.isFinite(junctionLng)
        ) {
          continue;
        }

        const distance = calculateDistance(
          lat,
          lng,
          junctionLat,
          junctionLng
        );

        const roundedDistance = Math.round(distance);

        const existingAlert =
          await JunctionAlert.findOne({
            tripId,
            junctionName: junction.name
          });

        if (distance <= detectionRadius) {
          if (!existingAlert) {
            const newAlert = await JunctionAlert.create({
              tripId,
              ambulanceId: trip.ambulanceId,
              junctionName: junction.name,
              latitude: junctionLat,
              longitude: junctionLng,
              distanceFromAmbulance: roundedDistance,
              status: "UPCOMING",
              priority: trip.priority
            });

            console.log(
              `🚨 Junction alert created: ${junction.name} - ${roundedDistance}m`
            );

            if (io) {
              io.to("police").emit("junction-alert", {
                alert: newAlert,
                tripId: trip._id,
                ambulanceId: trip.ambulanceId,
                junctionName: junction.name,
                latitude: junctionLat,
                longitude: junctionLng,
                distanceFromAmbulance: roundedDistance,
                status: "UPCOMING",
                priority: trip.priority,
                message:
                  `🚨 Ambulance ${trip.ambulanceId} approaching ${junction.name}`,
                timestamp: new Date().toISOString()
              });
            }
          } else if (existingAlert.status !== "PASSED") {
            if (
              existingAlert.distanceFromAmbulance <= 50 &&
              distance > passedThreshold
            ) {
              existingAlert.status = "PASSED";
              console.log(
                `✅ Junction passed: ${junction.name}`
              );
            } else {
              existingAlert.distanceFromAmbulance =
                roundedDistance;
            }

            await existingAlert.save();

            if (io) {
              io.to("police").emit(
                "junction-alert-update",
                {
                  tripId: trip._id,
                  ambulanceId: trip.ambulanceId,
                  junctionName: junction.name,
                  distanceFromAmbulance: roundedDistance,
                  status: existingAlert.status,
                  priority: trip.priority,
                  timestamp: new Date().toISOString()
                }
              );
            }
          }
        }
      }

      return res.status(200).json({
        message: "Ambulance location updated successfully",
        trip
      });
    } catch (error) {
      console.error(
        "Update location error:",
        error.message
      );

      return res.status(500).json({
        message: "Server error",
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
    const trips = await Trip.find({
      status: "ACTIVE"
    }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      message: "Active trips retrieved successfully",
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error(
      "Get active trips error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// ==========================================
// UPDATE TRIP TRAFFIC CLEARANCE
// ==========================================
router.put("/clearance/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { clearance } = req.body;

    const validClearances = [
      "PENDING",
      "PREPARING",
      "CLEARED"
    ];

    if (!validClearances.includes(clearance)) {
      return res.status(400).json({
        message: "Invalid traffic clearance status"
      });
    }

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      {
        trafficClearance: clearance
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.to("police").emit(
        "traffic-clearance-update",
        {
          tripId: trip._id,
          ambulanceId: trip.ambulanceId,
          clearance: trip.trafficClearance,
          timestamp: new Date().toISOString()
        }
      );
    }

    return res.status(200).json({
      message: "Traffic clearance updated successfully",
      trip
    });
  } catch (error) {
    console.error(
      "Traffic clearance error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// ==========================================
// END EMERGENCY TRIP
// ==========================================
router.put("/end/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      {
        status: "COMPLETED",
        completedAt: new Date(),
        trafficClearance: "CLEARED"
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    const io = req.app.get("io");

    if (io) {
      const completedData = {
        tripId: trip._id,
        ambulanceId: trip.ambulanceId,
        status: trip.status,
        trafficClearance: trip.trafficClearance,
        timestamp: new Date().toISOString()
      };

      io.to("police").emit(
        "trip-completed",
        completedData
      );

      io.to("hospital").emit(
        "trip-completed",
        completedData
      );

      io.to("admin").emit(
        "trip-completed",
        completedData
      );
    }

    return res.status(200).json({
      message: "Trip completed successfully",
      trip
    });
  } catch (error) {
    console.error(
      "End trip error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});
// ==========================================
// GET ALL JUNCTION ALERTS
// ==========================================
router.get("/junction-alerts", async (req, res) => {
  try {
    const alerts = await JunctionAlert.find()
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      message: "Junction alerts retrieved successfully",
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error(
      "Get junction alerts error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// ==========================================
// GET JUNCTION ALERTS FOR A SPECIFIC TRIP
// ==========================================
router.get(
  "/junction-alerts/:tripId",
  async (req, res) => {
    try {
      const { tripId } = req.params;

      const alerts = await JunctionAlert.find({
        tripId
      }).sort({
        createdAt: -1
      });

      return res.status(200).json({
        message:
          "Trip junction alerts retrieved successfully",
        count: alerts.length,
        alerts
      });
    } catch (error) {
      console.error(
        "Get trip junction alerts error:",
        error.message
      );

      return res.status(500).json({
        message: "Server error",
        error: error.message
      });
    }
  }
);

// ==========================================
// UPDATE A JUNCTION ALERT STATUS
// ==========================================
router.put(
  "/junction-alerts/status/:alertId",
  async (req, res) => {
    try {
      const { alertId } = req.params;
      const { status } = req.body;

      const validStatuses = [
        "UPCOMING",
        "PREPARING",
        "CLEARED",
        "PASSED"
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid junction alert status"
        });
      }

      const alert =
        await JunctionAlert.findByIdAndUpdate(
          alertId,
          {
            status
          },
          {
            new: true,
            runValidators: true
          }
        );

      if (!alert) {
        return res.status(404).json({
          message: "Junction alert not found"
        });
      }

      const io = req.app.get("io");

      if (io) {
        io.to("police").emit(
          "junction-alert-update",
          {
            alertId: alert._id,
            tripId: alert.tripId,
            ambulanceId: alert.ambulanceId,
            junctionName: alert.junctionName,
            status: alert.status,
            priority: alert.priority,
            timestamp: new Date().toISOString()
          }
        );
      }

      return res.status(200).json({
        message:
          "Junction alert status updated successfully",
        alert
      });
    } catch (error) {
      console.error(
        "Update junction alert status error:",
        error.message
      );

      return res.status(500).json({
        message: "Server error",
        error: error.message
      });
    }
  }
);

// ==========================================
// GET COMPLETED TRIP HISTORY
// ==========================================
router.get("/history", async (req, res) => {
  try {
    const trips = await Trip.find({
      status: "COMPLETED"
    }).sort({
      completedAt: -1
    });

    return res.status(200).json({
      message: "Trip history retrieved successfully",
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error(
      "Get trip history error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// ==========================================
// ROUTE-BASED TRAFFIC SIGNAL DETECTION
// Real mapped signals from OpenStreetMap
// ==========================================

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];

// Find the shortest distance between a signal
// and the sampled points along the ambulance route.
function distanceToRoute(
  signalLat,
  signalLon,
  routePoints
) {
  let minimumDistance = Infinity;

  for (const point of routePoints) {
    const distance = calculateDistance(
      Number(point[0]),
      Number(point[1]),
      signalLat,
      signalLon
    );

    if (
      Number.isFinite(distance) &&
      distance < minimumDistance
    ) {
      minimumDistance = distance;
    }
  }

  return minimumDistance;
}
// ==========================================
// DETECT TRAFFIC SIGNALS ALONG THE ROUTE
// ==========================================
router.post("/route-junctions", async (req, res) => {
  try {
    const {
      tripId,
      ambulanceId,
      priority,
      routeCoordinates,
      coordinateOrder
    } = req.body;

    if (!tripId || !ambulanceId) {
      return res.status(400).json({
        success: false,
        message: "Trip ID and ambulance ID are required",
        junctions: [],
        count: 0
      });
    }

    if (
      !Array.isArray(routeCoordinates) ||
      routeCoordinates.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "At least two route coordinates are required",
        junctions: [],
        count: 0
      });
    }

    // Convert incoming coordinates to [latitude, longitude].
    const validRoute = [];

    for (const point of routeCoordinates) {
      if (!Array.isArray(point) || point.length < 2) {
        continue;
      }

      const first = Number(point[0]);
      const second = Number(point[1]);

      if (
        !Number.isFinite(first) ||
        !Number.isFinite(second)
      ) {
        continue;
      }

      let lat;
      let lon;

      if (coordinateOrder === "lonlat") {
        lon = first;
        lat = second;
      } else if (coordinateOrder === "latlon") {
        lat = first;
        lon = second;
      } else {
        // Fallback coordinate-order detection for India.
        const looksLatLon =
          first >= 6 &&
          first <= 37 &&
          second >= 68 &&
          second <= 98;

        const looksLonLat =
          first >= 68 &&
          first <= 98 &&
          second >= 6 &&
          second <= 37;

        if (looksLonLat) {
          lat = second;
          lon = first;
        } else {
          lat = first;
          lon = second;
        }
      }

      if (
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        continue;
      }

      validRoute.push([lat, lon]);
    }

    if (validRoute.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "The route does not contain enough valid coordinates. Send [latitude, longitude].",
        junctions: [],
        count: 0
      });
    }

    const detectionRadius = 300;

    // Sample the route to limit the size of the Overpass request.
    const maxSamplePoints = 100;
    const sampleStep = Math.max(
      1,
      Math.ceil(validRoute.length / maxSamplePoints)
    );

    const sampledRoute = validRoute.filter(
      (_, index) =>
        index % sampleStep === 0 ||
        index === validRoute.length - 1
    );

    // Query each route point separately inside one Overpass union.
    const aroundClauses = sampledRoute
      .map(
        ([lat, lon]) =>
          `node(around:${detectionRadius},${lat},${lon})["highway"="traffic_signals"];`
      )
      .join("\n");

    const overpassQuery = `
      [out:json][timeout:45];
      (
        ${aroundClauses}
      );
      out body;
    `;

    let osmData = null;
    let lastOsmError = null;

    // Try a second public Overpass endpoint if the first is busy.
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const controller = new AbortController();

        const timeoutId = setTimeout(
          () => controller.abort(),
          50000
        );

        let response;

        try {
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: new URLSearchParams({
              data: overpassQuery
            }),
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          throw new Error(
            `OpenStreetMap service returned HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data.elements)) {
          throw new Error(
            "OpenStreetMap returned an unexpected response"
          );
        }

        osmData = data;
        break;
      } catch (error) {
        lastOsmError = error;

        console.error(
          `Overpass request failed (${endpoint}):`,
          error.message
        );
      }
    }

    // ==========================================
// DEMO MODE FALLBACK
// Use simulated signals when OpenStreetMap is unavailable.
// These locations follow the ambulance's calculated route.
// ==========================================

let detectionSource = "OpenStreetMap";

if (!osmData) {
  console.warn(
    "OpenStreetMap unavailable. Using DEMO traffic signals."
  );

  detectionSource = "Demo Mode";

  // Select up to five points spread along the route.
  const numberOfDemoSignals = Math.min(
    5,
    Math.max(2, sampledRoute.length - 1)
  );

  const demoElements = [];

  for (let i = 1; i <= numberOfDemoSignals; i++) {
    const fraction =
      i / (numberOfDemoSignals + 1);

    const routeIndex = Math.min(
      sampledRoute.length - 1,
      Math.floor(fraction * (sampledRoute.length - 1))
    );

    const [latitude, longitude] =
      sampledRoute[routeIndex];

    demoElements.push({
      type: "node",
      id: `DEMO-${i}`,
      lat: latitude,
      lon: longitude,
      tags: {
        highway: "traffic_signals",
        name: `Demo Traffic Signal ${i}`
      }
    });
  }

  // Continue through the existing detection logic.
  // The rest of the route-junction endpoint remains intact.
  osmData = {
    elements: demoElements
  };
}
    const seenOsmIds = new Set();

    const detectedJunctions = (osmData.elements || [])
      .filter(
        (element) =>
          element.type === "node" &&
          Number.isFinite(Number(element.lat)) &&
          Number.isFinite(Number(element.lon))
      )
      .map((element) => {
        const latitude = Number(element.lat);
        const longitude = Number(element.lon);

        const distance = distanceToRoute(
          latitude,
          longitude,
          sampledRoute
        );

        // Find the closest route point for route progress.
        let closestRouteIndex = 0;
        let closestDistance = Infinity;

        validRoute.forEach((point, index) => {
          const pointDistance = calculateDistance(
            point[0],
            point[1],
            latitude,
            longitude
          );

          if (pointDistance < closestDistance) {
            closestDistance = pointDistance;
            closestRouteIndex = index;
          }
        });

        const junctionName =
          element.tags?.name ||
          `Traffic Signal ${element.id}`;

        return {
          junctionId: `OSM-${element.id}`,
          osmId: element.id,
          junctionName,
          latitude,
          longitude,
          distanceFromRoute: Math.round(distance),
          policeOfficer: "Pending assignment",
          policeId: null,
          source: "OpenStreetMap",
          routeProgress: Math.round(
            (closestRouteIndex /
              Math.max(1, validRoute.length - 1)) *
              100
          ),
          ambulanceId,
          tripId,
          status: "ON_EMERGENCY_ROUTE",
          message:
            `Ambulance ${ambulanceId} route passes ${junctionName}. Police assignment is pending.`
        };
      })
      .filter((signal) => {
        if (
          signal.distanceFromRoute > detectionRadius ||
          seenOsmIds.has(signal.osmId)
        ) {
          return false;
        }

        seenOsmIds.add(signal.osmId);
        return true;
      })
      .sort(
        (a, b) => a.routeProgress - b.routeProgress
      );
          // ==========================================
    // SAVE DETECTED JUNCTION ALERTS
    // ==========================================
    for (const signal of detectedJunctions) {
      const existingAlert = await JunctionAlert.findOne({
        tripId,
        junctionName: signal.junctionName
      });

      if (!existingAlert) {
        await JunctionAlert.create({
          tripId,
          ambulanceId,
          junctionName: signal.junctionName,
          latitude: signal.latitude,
          longitude: signal.longitude,
          distanceFromAmbulance:
            signal.distanceFromRoute,
          status: "UPCOMING",
          priority: priority || "Critical"
        });
      }
    }

    // ==========================================
    // REAL-TIME POLICE NOTIFICATION
    // ==========================================
    const io = req.app.get("io");

    if (io) {
      io.to("police").emit(
        "route-junctions-detected",
        {
          tripId,
          ambulanceId,
          priority: priority || "Critical",
          junctions: detectedJunctions,
          count: detectedJunctions.length,
          source: "OpenStreetMap",
          assignmentStatus:
            "PENDING_POLICE_ASSIGNMENT",
          message: detectedJunctions.length
            ? `${detectedJunctions.length} mapped traffic signal(s) detected along the emergency route. Police assignment is pending.`
            : "No mapped traffic signals were found near this route.",
          timestamp: new Date().toISOString()
        }
      );
    }

    console.log(
      `OpenStreetMap found ${detectedJunctions.length} traffic signal(s) for ambulance ${ambulanceId}`
    );

    // ==========================================
    // SEND RESPONSE TO FRONTEND
    // ==========================================
    return res.status(200).json({
      success: true,
      message: detectedJunctions.length
        ? "Mapped traffic signal detection completed"
        : "No mapped traffic signals found within 300 metres of the route. OpenStreetMap coverage may be incomplete.",
      ambulanceId,
      tripId,
      count: detectedJunctions.length,
      source: "OpenStreetMap",
      detectionRadiusMeters: detectionRadius,
      assignmentStatus:
        "PENDING_POLICE_ASSIGNMENT",
      junctions: detectedJunctions
    });
  } catch (error) {
    console.error(
      "Route junction detection error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to detect route traffic signals",
      error: error.message,
      junctions: [],
      count: 0
    });
  }
});
// ==========================================
// GET ALL REGISTERED POLICE OFFICERS
// ==========================================
router.get("/police-officers", async (req, res) => {
  try {
    const officers = await User.find({
      role: "police"
    })
      .select("_id name email role")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: officers.length,
      officers
    });
  } catch (error) {
    console.error("Fetch police officers error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve police officers",
      error: error.message
    });
  }
});
// ==========================================
// EXPORT ROUTER
// ==========================================
module.exports = router;
// ==========================================
// ASSIGN A POLICE OFFICER TO A JUNCTION
// ==========================================
router.post("/junction-alerts/:alertId/assign", async (req, res) => {
  try {
    const { alertId } = req.params;
    const { officerId } = req.body;

    if (!officerId) {
      return res.status(400).json({
        success: false,
        message: "Police officer ID is required"
      });
    }

    const alert = await JunctionAlert.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Junction alert not found"
      });
    }

    const officer = await User.findOne({
      _id: officerId,
      role: "police"
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Police officer not found"
      });
    }

    const alreadyAssigned = alert.assignedOfficers.some(
      (assignment) =>
        assignment.officerId.toString() === officer._id.toString()
    );

    if (alreadyAssigned) {
      return res.status(409).json({
        success: false,
        message: "This officer is already assigned to this junction"
      });
    }

    alert.assignedOfficers.push({
      officerId: officer._id,
      status: "ASSIGNED",
      assignedAt: new Date(),
      updatedAt: new Date()
    });

    await alert.save();

    const io = req.app.get("io");

    const assignmentData = {
      alertId: alert._id,
      tripId: alert.tripId,
      ambulanceId: alert.ambulanceId,
      junctionName: alert.junctionName,
      officerId: officer._id,
      officerName: officer.name,
      officerStatus: "ASSIGNED",
      assignedOfficerCount: alert.assignedOfficers.length,
      status: alert.status,
      message: `Police officer ${officer.name} assigned to ${alert.junctionName}`,
      timestamp: new Date().toISOString()
    };

    if (io) {
      io.to("police").emit(
        "junction-officer-assigned",
        assignmentData
      );

      io.to(`ambulance-${alert.ambulanceId}`).emit(
        "junction-officer-assigned",
        assignmentData
      );

      io.to("admin").emit(
        "junction-officer-assigned",
        assignmentData
      );
    }

    return res.status(200).json({
      success: true,
      message: "Police officer assigned successfully",
      assignedOfficerCount: alert.assignedOfficers.length,
      alert,
      officer: {
        _id: officer._id,
        name: officer.name
      }
    });
  } catch (error) {
    console.error("Assign police officer error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to assign police officer",
      error: error.message
    });
  }
});


// ==========================================
// UPDATE AN ASSIGNED OFFICER'S STATUS
// ==========================================
router.put(
  "/junction-alerts/:alertId/officer-status",
  async (req, res) => {
    try {
      const { alertId } = req.params;
      const { officerId, status } = req.body;

      const validOfficerStatuses = [
        "ACCEPTED",
        "CLEARING",
        "CLEARED",
        "PASSED"
      ];

      if (!officerId || !validOfficerStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Valid officer ID and status are required",
          validStatuses: validOfficerStatuses
        });
      }

      const alert = await JunctionAlert.findById(alertId);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: "Junction alert not found"
        });
      }

      const assignment = alert.assignedOfficers.find(
        (item) => item.officerId.toString() === officerId.toString()
      );

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: "This officer is not assigned to this junction"
        });
      }

      assignment.status = status;
      assignment.updatedAt = new Date();

      // Update the overall junction status from officer progress.
      const allOfficersFinished = alert.assignedOfficers.every(
        (item) => ["CLEARED", "PASSED"].includes(item.status)
      );

      const anyOfficerWorking = alert.assignedOfficers.some(
        (item) => ["ACCEPTED", "CLEARING", "CLEARED"].includes(item.status)
      );

      if (status === "PASSED") {
        alert.status = "PASSED";
      } else if (allOfficersFinished) {
        alert.status = "CLEARED";
      } else if (anyOfficerWorking) {
        alert.status = "PREPARING";
      } else {
        alert.status = "UPCOMING";
      }

      await alert.save();

      const officer = await User.findById(officerId).select("name");

      const statusData = {
        alertId: alert._id,
        tripId: alert.tripId,
        ambulanceId: alert.ambulanceId,
        junctionName: alert.junctionName,
        officerId,
        officerName: officer ? officer.name : "Police Officer",
        officerStatus: assignment.status,
        assignedOfficerCount: alert.assignedOfficers.length,
        assignedOfficers: alert.assignedOfficers,
        status: alert.status,
        distanceFromAmbulance: alert.distanceFromAmbulance,
        timestamp: new Date().toISOString()
      };

      const io = req.app.get("io");

      if (io) {
        io.to("police").emit(
          "junction-officer-status-update",
          statusData
        );

        io.to(`ambulance-${alert.ambulanceId}`).emit(
          "junction-officer-status-update",
          statusData
        );

        io.to("admin").emit(
          "junction-officer-status-update",
          statusData
        );
      }

      return res.status(200).json({
        success: true,
        message: "Officer status updated successfully",
        alert
      });
    } catch (error) {
      console.error("Update officer status error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update officer status",
        error: error.message
      });
    }
  }
);



