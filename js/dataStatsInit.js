import { initializeSessionData } from "./sessionManager.js";
import { drivingConditions, translations } from "./data.js";

const storedSessions = initializeSessionData();

const totalSession = storedSessions.length;

/******************************************
 *                DISTANCE                *
 ******************************************/

export const totalDistance = storedSessions.reduce(
  (sum, session) => sum + parseInt(session.travelDistance, 10),
  0
);

const distanceBeforeGoal = 3000 - totalDistance;

const longestDistance = Math.max(
  ...storedSessions.map((session) => parseInt(session.travelDistance, 10))
);
const shortestDistance = Math.min(
  ...storedSessions.map((session) => parseInt(session.travelDistance, 10))
);
const averageDistance = Math.round(totalDistance / storedSessions.length);

/******************************************
 *                 DUREE                  *
 ******************************************/

function calculateTotalDuration(sessions) {
  const totalDuration = sessions.reduce((total, session) => {
    const start = new Date(session.startDatetime);
    const end = new Date(session.stopDatetime);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return total + (end - start);
    } else {
      console.log(
        `Session invalide avec les dates : ${session.startDatetime} - ${session.stopDatetime}`
      );
      return total;
    }
  }, 0);
  return (totalDuration / (1000 * 60 * 60)).toFixed(2);
}

function calculateAverageDuration(sessions) {
  const totalDuration = sessions.reduce((sum, session) => {
    const start = new Date(session.startDatetime);
    const end = new Date(session.stopDatetime);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return sum + (end - start);
    } else {
      console.log(
        `Session invalide avec les dates : ${session.startDatetime} - ${session.stopDatetime}`
      );
      return sum;
    }
  }, 0);

  return (totalDuration / (sessions.length * 1000 * 60 * 60)).toFixed(2);
}

function calculateLongestDuration(sessions) {
  const durations = sessions.map((session) => {
    const start = new Date(session.startDatetime);
    const end = new Date(session.stopDatetime);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return end - start;
    } else {
      console.log(
        `Session invalide avec les dates : ${session.startDatetime} - ${session.stopDatetime}`
      );
      return 0;
    }
  });

  const longestDuration = Math.max(...durations);
  return (longestDuration / (1000 * 60 * 60)).toFixed(2);
}

function calculateShortestDuration(sessions) {
  const durations = sessions
    .map((session) => {
      const start = new Date(session.startDatetime);
      const end = new Date(session.stopDatetime);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return end - start;
      } else {
        console.log(
          `Session invalide avec les dates : ${session.startDatetime} - ${session.stopDatetime}`
        );
        return Infinity;
      }
    })
    .filter((duration) => duration !== Infinity);

  const shortestDuration = durations.length > 0 ? Math.min(...durations) : 0;
  return (shortestDuration / (1000 * 60 * 60)).toFixed(2);
}

/******************************************
 *            CONDUITE DE NUIT            *
 ******************************************/

function calculateNighttimePercentage(sessions) {
  const nightSessionsCount = sessions.reduce((count, session) => {
    return count + (session.nighttime ? 1 : 0);
  }, 0);

  const percentage = (nightSessionsCount / totalSession) * 100;

  return {
    count: nightSessionsCount,
    percentage: percentage.toFixed(2),
  };
}

const nightTimeStats = calculateNighttimePercentage(storedSessions);

/******************************************
 *               CONDITIONS               *
 ******************************************/

function calculateConditionPercentages(
  sessions,
  conditions,
  conditionIndex,
  conditionKey,
  translations
) {
  const conditionList = conditions[conditionIndex];
  let conditionCounts = {};

  sessions.forEach((session) => {
    let conditionIds =
      session[
        `id${conditionKey.charAt(0).toUpperCase() + conditionKey.slice(1)}`
      ];

    if (Array.isArray(conditionIds)) {
      conditionIds.forEach((id) => {
        conditionCounts[id] = (conditionCounts[id] || 0) + 1;
      });
    } else if (conditionIds) {
      conditionCounts[conditionIds] = (conditionCounts[conditionIds] || 0) + 1;
    }
  });

  const totalConditions = Object.values(conditionCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  let results = [];

  conditionList.forEach((condition) => {
    const conditionId =
      condition[
        `id${conditionKey.charAt(0).toUpperCase() + conditionKey.slice(1)}`
      ].toString();
    const count = conditionCounts[conditionId] || 0;
    const percentage =
      totalConditions > 0 ? (count / totalConditions) * 100 : 0;

    const conditionNameKey =
      conditionKey.charAt(0).toLowerCase() + conditionKey.slice(1);
    const conditionName = condition[conditionNameKey];
    const name =
      translations[conditionName] ||
      `Non traduit ${conditionKey}(${conditionId})`;

    results.push({
      name: name,
      percentage: percentage.toFixed(2),
      count: count,
    });
  });

  return results;
}

//dangers
const hazardStat = calculateConditionPercentages(
  storedSessions,
  drivingConditions,
  1,
  "Hazard",
  translations
);
const denseTrafficStats = hazardStat[0];
const blackIceStats = hazardStat[1];
const highWindsStats = hazardStat[2];
const sinuousRoadStats = hazardStat[3];

//meteo
const weatherStat = calculateConditionPercentages(
  storedSessions,
  drivingConditions,
  2,
  "Weather",
  translations
);
const sunnyStats = weatherStat[0];
const cloudyStats = weatherStat[1];
const rainyStats = weatherStat[2];
const stormyStats = weatherStat[3];
const foggyStats = weatherStat[4];
const snowyStats = weatherStat[5];

//typologie route
const roadTypeStat = calculateConditionPercentages(
  storedSessions,
  drivingConditions,
  3,
  "RoadType",
  translations
);
const mainStats = roadTypeStat[0];
const secondaryStats = roadTypeStat[1];
const urbanStats = roadTypeStat[2];
const ruralStats = roadTypeStat[3];
const highwayStats = roadTypeStat[4];
const peripheralStats = roadTypeStat[5];

// stationnement
const parkingStat = calculateConditionPercentages(
  storedSessions,
  drivingConditions,
  4,
  "Parking",
  translations
);
const perpendicularStats = parkingStat[0];
const angledStats = parkingStat[1];
const parallelStats = parkingStat[2];

// autres manoeuvres
const manoeuverStat = calculateConditionPercentages(
  storedSessions,
  drivingConditions,
  5,
  "Manoeuver",
  translations
);
const uturnStats = manoeuverStat[0];
const hillStartStats = manoeuverStat[1];
const emergencyStopStats = manoeuverStat[2];
const roundaboutStats = manoeuverStat[3];

function calculateKilometersPerRoadType(sessions, translations) {
  // stocker les kilomètres parcourus par type de route
  let roadTypeKilometers = {};

  // pour chaque session
  sessions.forEach((session) => {
    // converti la distance en nombre
    const distance = parseFloat(session.travelDistance);
    // récupére les types de route pour la session
    const roadTypes = session.idRoadType;

    // check si des types de route existent et si la distance est un nombre valide
    if (roadTypes && roadTypes.length > 0 && !isNaN(distance)) {
      // calcul la distance parcourue pour chaque type de route
      const distancePerRoadType = distance / roadTypes.length;

      // répartiti la distance parcourue entre les types de route
      roadTypes.forEach((roadTypeId) => {
        // set la distance à 0 si pas déjà présent
        if (!roadTypeKilometers[roadTypeId]) {
          roadTypeKilometers[roadTypeId] = 0;
        }
        // ajoute la distance pour chaque type de route
        roadTypeKilometers[roadTypeId] += distancePerRoadType;
      });
    }
  });

  let result = {};
  const roadTypeConditions = drivingConditions[3];
  // pour chaque type de route
  roadTypeConditions.forEach((roadType) => {
    // conversti l'ID en string pour retrouver les clef dans roadTypeKilometers
    const roadTypeId = roadType.idRoadType.toString();
    // récupére le nom traduit
    const name = translations[roadType.roadType];
    // récupére la distance totale
    const kilometers = roadTypeKilometers[roadTypeId] || 0;
    // créé un objet {type de route : valeur}
    result[name] = Math.round(kilometers);
  });

  return result;
}

const kilometersPerRoadType = calculateKilometersPerRoadType(
  storedSessions,
  translations
);

/******************************************
 *                AFFICHAGE               * ----> Prévoir de migrer cette section vers une autre page
 ******************************************/
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dataStatContent")) {
    //session
    const totalSessionStat = document.getElementById("totalSessionStat");
    totalSessionStat.textContent = totalSession;

    //distance
    const totalDistanceStat = document.getElementById("totalDistanceStat");
    const maxDistanceStat = document.getElementById("maxDistanceStat");
    const minDistanceStat = document.getElementById("minDistanceStat");
    const aveDistanceStat = document.getElementById("aveDistanceStat");

    totalDistanceStat.textContent = totalDistance + " km";
    maxDistanceStat.textContent = longestDistance + " km";
    minDistanceStat.textContent = shortestDistance + " km";
    aveDistanceStat.textContent = averageDistance + " km";

    //durée
    const totalDurationStat = document.getElementById("totalDurationStat");
    const maxDurationStat = document.getElementById("maxDurationStat");
    const minDurationStat = document.getElementById("minDurationStat");
    const aveDurationStat = document.getElementById("aveDurationStat");

    totalDurationStat.textContent =
      calculateTotalDuration(storedSessions) + " h";
    maxDurationStat.textContent =
      calculateLongestDuration(storedSessions) + " h";
    minDurationStat.textContent =
      calculateShortestDuration(storedSessions) + " h";
    aveDurationStat.textContent =
      calculateAverageDuration(storedSessions) + " h";

    // conduite de nuit
    const nightDrivingStat = document.getElementById("nightDrivingStat");
    const nightDrivingCount = document.getElementById("nightDrivingCount");

    nightDrivingStat.textContent = nightTimeStats.percentage + " %";
    nightDrivingCount.textContent = nightTimeStats.count + " trajet(s)";

    // dangers
    const denseTrafficLabel = document.getElementById("denseTrafficLabel");
    const denseTrafficStat = document.getElementById("denseTrafficStat");
    const blackIceLabel = document.getElementById("blackIceLabel");
    const blackIceStat = document.getElementById("blackIceStat");
    const highWindsLabel = document.getElementById("highWindsLabel");
    const highWindsStat = document.getElementById("highWindsStat");
    const sinuousRoadLabel = document.getElementById("sinuousRoadLabel");
    const sinuousRoadStat = document.getElementById("sinuousRoadStat");

    denseTrafficLabel.textContent = denseTrafficStats.name;
    denseTrafficStat.textContent = denseTrafficStats.percentage + " %";
    blackIceLabel.textContent = blackIceStats.name;
    blackIceStat.textContent = blackIceStats.percentage + " %";
    highWindsLabel.textContent = highWindsStats.name;
    highWindsStat.textContent = highWindsStats.percentage + " %";
    sinuousRoadLabel.textContent = sinuousRoadStats.name;
    sinuousRoadStat.textContent = sinuousRoadStats.percentage + " %";

    // meteo
    const sunnyLabel = document.getElementById("sunnyLabel");
    const sunnyStat = document.getElementById("sunnyStat");
    const cloudyLabel = document.getElementById("cloudyLabel");
    const cloudyStat = document.getElementById("cloudyStat");
    const rainyLabel = document.getElementById("rainyLabel");
    const rainyStat = document.getElementById("rainyStat");
    const stormyLabel = document.getElementById("stormyLabel");
    const stormyStat = document.getElementById("stormyStat");
    const foggyLabel = document.getElementById("foggyLabel");
    const foggyStat = document.getElementById("foggyStat");
    const snowyLabel = document.getElementById("snowyLabel");
    const snowyStat = document.getElementById("snowyStat");

    sunnyLabel.textContent = sunnyStats.name;
    sunnyStat.textContent = sunnyStats.percentage + " %";
    cloudyLabel.textContent = cloudyStats.name;
    cloudyStat.textContent = cloudyStats.percentage + " %";
    rainyLabel.textContent = rainyStats.name;
    rainyStat.textContent = rainyStats.percentage + " %";
    stormyLabel.textContent = stormyStats.name;
    stormyStat.textContent = stormyStats.percentage + " %";
    foggyLabel.textContent = foggyStats.name;
    foggyStat.textContent = foggyStats.percentage + " %";
    snowyLabel.textContent = snowyStats.name;
    snowyStat.textContent = snowyStats.percentage + " %";

    // typologie routes
    const mainLabel = document.getElementById("mainLabel");
    const mainStat = document.getElementById("mainStat");
    const mainDistance = document.getElementById("mainDistance");
    const secondaryLabel = document.getElementById("secondaryLabel");
    const secondaryStat = document.getElementById("secondaryStat");
    const secondaryDistance = document.getElementById("secondaryDistance");
    const urbanLabel = document.getElementById("urbanLabel");
    const urbanStat = document.getElementById("urbanStat");
    const urbanDistance = document.getElementById("urbanDistance");
    const ruralLabel = document.getElementById("ruralLabel");
    const ruralStat = document.getElementById("ruralStat");
    const ruralDistance = document.getElementById("ruralDistance");
    const highwayLabel = document.getElementById("highwayLabel");
    const highwayStat = document.getElementById("highwayStat");
    const highwayDistance = document.getElementById("highwayDistance");
    const peripheralLabel = document.getElementById("peripheralLabel");
    const peripheralStat = document.getElementById("peripheralStat");
    const peripheralDistance = document.getElementById("peripheralDistance");

    mainLabel.textContent = mainStats.name;
    mainStat.textContent = mainStats.percentage + " %";
    mainDistance.textContent =
      kilometersPerRoadType["Routes principales"] + " km";
    secondaryLabel.textContent = secondaryStats.name;
    secondaryStat.textContent = secondaryStats.percentage + " %";
    secondaryDistance.textContent =
      kilometersPerRoadType["Routes secondaires"] + " km";
    urbanLabel.textContent = urbanStats.name;
    urbanStat.textContent = urbanStats.percentage + " %";
    urbanDistance.textContent = kilometersPerRoadType["Voie urbaine"] + " km";
    ruralLabel.textContent = ruralStats.name;
    ruralStat.textContent = ruralStats.percentage + " %";
    ruralDistance.textContent = kilometersPerRoadType["Chemin rural"] + " km";
    highwayLabel.textContent = highwayStats.name;
    highwayStat.textContent = highwayStats.percentage + " %";
    highwayDistance.textContent = kilometersPerRoadType["Autoroute"] + " km";
    peripheralLabel.textContent = peripheralStats.name;
    peripheralStat.textContent = peripheralStats.percentage + " %";
    peripheralDistance.textContent =
      kilometersPerRoadType["Boulevard périphérique"] + " km";

    // stationnement
    const perpendicularLabel = document.getElementById("perpendicularLabel");
    const perpendicularStat = document.getElementById("perpendicularStat");
    const perpendicularCount = document.getElementById("perpendicularCount");
    const angledLabel = document.getElementById("angledLabel");
    const angledStat = document.getElementById("angledStat");
    const angledCount = document.getElementById("angledCount");
    const parallelLabel = document.getElementById("parallelLabel");
    const parallelStat = document.getElementById("parallelStat");
    const parallelCount = document.getElementById("parallelCount");

    perpendicularLabel.textContent = perpendicularStats.name;
    perpendicularStat.textContent = perpendicularStats.percentage + " %";
    perpendicularCount.textContent = perpendicularStats.count;
    angledLabel.textContent = angledStats.name;
    angledStat.textContent = angledStats.percentage + " %";
    angledCount.textContent = angledStats.count;
    parallelLabel.textContent = parallelStats.name;
    parallelStat.textContent = parallelStats.percentage + " %";
    parallelCount.textContent = parallelStats.count;

    // autres manoeuvres
    const uturnLabel = document.getElementById("uturnLabel");
    const uturnStat = document.getElementById("uturnStat");
    const uturnCount = document.getElementById("uturnCount");
    const hillStartLabel = document.getElementById("hillStartLabel");
    const hillStartStat = document.getElementById("hillStartStat");
    const hillStartCount = document.getElementById("hillStartCount");
    const emergencyStopLabel = document.getElementById("emergencyStopLabel");
    const emergencyStopStat = document.getElementById("emergencyStopStat");
    const emergencyStopCount = document.getElementById("emergencyStopCount");
    const roundaboutLabel = document.getElementById("roundaboutLabel");
    const roundaboutStat = document.getElementById("roundaboutStat");
    const roundaboutCount = document.getElementById("roundaboutCount");

    uturnLabel.textContent = uturnStats.name;
    uturnStat.textContent = uturnStats.percentage + " %";
    uturnCount.textContent = uturnStats.count;
    hillStartLabel.textContent = hillStartStats.name;
    hillStartStat.textContent = hillStartStats.percentage + " %";
    hillStartCount.textContent = hillStartStats.count;
    emergencyStopLabel.textContent = emergencyStopStats.name;
    emergencyStopStat.textContent = emergencyStopStats.percentage + " %";
    emergencyStopCount.textContent = emergencyStopStats.count;
    roundaboutLabel.textContent = roundaboutStats.name;
    roundaboutStat.textContent = roundaboutStats.percentage + " %";
    roundaboutCount.textContent = roundaboutStats.count;
  }
}); //fin du domload listener
