const drivingSessions = []; // stockage des session de conduite

const drivingConditions = [
  { nightDriving: null },
  [
    { idHazard: 1, hazard: "denseTraffic" },
    { idHazard: 2, hazard: "blackIce" },
    { idHazard: 3, hazard: "highWinds" },
    { idHazard: 4, hazard: "sinuousRoad" },
  ],
  [
    { idWeather: 1, weather: "sunny" },
    { idWeather: 2, weather: "cloudy" },
    { idWeather: 3, weather: "rainy" },
    { idWeather: 4, weather: "stormy" },
    { idWeather: 5, weather: "foggy" },
    { idWeather: 6, weather: "snowy" },
  ],
  [
    { idRoadType: 1, roadType: "main" },
    { idRoadType: 2, roadType: "secondary" },
    { idRoadType: 3, roadType: "urban" },
    { idRoadType: 4, roadType: "rural" },
    { idRoadType: 5, roadType: "highway" },
    { idRoadType: 6, roadType: "peripheral" },
  ],
  [
    { idParking: 1, parking: "perpendicular" },
    { idParking: 2, parking: "angled" },
    { idParking: 3, parking: "parallel" },
  ],
  [
    { idManoeuver: 1, manoeuver: "uturn" },
    { idManoeuver: 2, manoeuver: "hillStart" },
    { idManoeuver: 3, manoeuver: "emergencyStop" },
    { idManoeuver: 4, manoeuver: "roundabout" },
  ],
];

// Déclaration des variables pour chaque catégorie de conditions de conduite
const conditionsCategories = {
  nightDriving: drivingConditions[0],
  hazards: drivingConditions[1],
  weathers: drivingConditions[2],
  roadTypes: drivingConditions[3],
  parkingTypes: drivingConditions[4],
  manoeuvers: drivingConditions[5],
};

// Mapping des données vers leur traduction en Français
const translations = {
  nightDriving: "Conduite de nuit",
  hazard: "Danger",
  weather: "Météo",
  roadType: "Type de route",
  parking: "Stationnement",
  manoeuver: "Manoeuvre",
  denseTraffic: "Trafic dense",
  blackIce: "Verglas",
  highWinds: "Vents forts",
  sinuousRoad: "Route sinueuse",
  sunny: "Ensoleillé",
  cloudy: "Nuageux",
  rainy: "Pluvieux",
  stormy: "Orageux",
  foggy: "Brumeux",
  snowy: "Enneigé",
  main: "Routes principales",
  secondary: "Routes secondaires",
  urban: "Voie urbaine",
  rural: "Chemin rural",
  highway: "Autoroute",
  peripheral: "Boulevard périphérique",
  mountain: "Montagne",
  perpendicular: "En bataille",
  angled: "En épi",
  parallel: "En créneau",
  uturn: "Demi-tour",
  hillStart: "Démarrage en côte",
  emergencyStop: "Arrêt d'urgence",
  roundabout: "Rond-point",
};

const options = {
  componentRestrictions: { country: "fr" },
  fields: ["address_components", "geometry"],
};

export {
  drivingSessions,
  conditionsCategories,
  translations,
  drivingConditions,
  options,
};
