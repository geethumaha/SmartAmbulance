// ==========================================
// DISTANCE CALCULATOR
// ==========================================

// Calculates the distance between two GPS
// coordinates using the Haversine formula.
//
// Result is returned in metres.

function calculateDistance(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {

  const earthRadius = 6371000;


  const lat1 =
    latitude1 * Math.PI / 180;

  const lat2 =
    latitude2 * Math.PI / 180;


  const latitudeDifference =
    (latitude2 - latitude1) *
    Math.PI / 180;

  const longitudeDifference =
    (longitude2 - longitude1) *
    Math.PI / 180;


  const a =
    Math.sin(
      latitudeDifference / 2
    ) *
    Math.sin(
      latitudeDifference / 2
    ) +

    Math.cos(lat1) *
    Math.cos(lat2) *

    Math.sin(
      longitudeDifference / 2
    ) *
    Math.sin(
      longitudeDifference / 2
    );


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  const distance =
    earthRadius * c;


  return distance;

}


module.exports =
  calculateDistance;