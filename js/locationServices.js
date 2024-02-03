import { options } from "./data.js";

let watchId;
let gpsPoints = [];

function startGpsTracking() {
  console.log("Démarrage du suivi GPS...");
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        gpsPoints.push({ lat, lng });
        console.log(`Position mise à jour : ${lat}, ${lng}`);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return true;
  } else {
    console.error("Géolocalisation non prise en charge par le navigateur.");
    return false;
  }
}

function stopGpsTracking() {
  if (watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId);
    console.log(
      `Suivi GPS arrêté. Nombre total de points collectés : ${gpsPoints.length}`
    );
    watchId = undefined;
    return true;
  } else {
    console.error("Le suivi GPS n'était pas actif.");
    return false;
  }
}

function calculateTrackedDistance() {
  console.log(`Calcul de la distance parcourue...`);
  let totalDistance = 0;
  for (let i = 1; i < gpsPoints.length; i++) {
    const prev = gpsPoints[i - 1];
    const curr = gpsPoints[i];
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(prev.lat, prev.lng),
      new google.maps.LatLng(curr.lat, curr.lng)
    );
    totalDistance += distance;
    console.log(`Distance du segment ${i}: ${distance} mètres`);
  }
  const totalDistanceInKm = totalDistance / 1000;
  console.log(`Distance totale parcourue : ${totalDistanceInKm} kilomètres`);
  return totalDistanceInKm;
}

function displayRouteOnMap(session) {
  console.log("Début de la fonction displayRouteOnMap");
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 4,
    },
  });

  directionsRenderer.setMap(map);
  console.log("DirectionsRenderer configuré");

  if (!session.gpsPoints || session.gpsPoints.length === 0) {
    console.log(
      "Aucun point GPS, utilisation des coordonnées de début et de fin"
    );
    if (!session.startCoords || !session.stopCoords) {
      console.error("Aucune donnée de position disponible pour cette session.");
      alert("Aucune donnée de position disponible pour cette session.");
      return;
    }

    alert(
      "Affichage d'un itinéraire supposé basé sur les coordonnées de départ et d'arrivée."
    );

    let origin, destination;

    if (typeof session.startCoords === "string") {
      console.log("Conversion des coordonnées de départ de type string");
      origin = convertToLatLng(session.startCoords);
    } else {
      console.log("Création de LatLng pour les coordonnées de départ");
      origin = new google.maps.LatLng(
        session.startCoords.lat,
        session.startCoords.lng
      );
    }

    if (typeof session.stopCoords === "string") {
      console.log("Conversion des coordonnées de fin de type string");
      destination = convertToLatLng(session.stopCoords);
    } else {
      console.log("Création de LatLng pour les coordonnées de fin");
      destination = new google.maps.LatLng(
        session.stopCoords.lat,
        session.stopCoords.lng
      );
    }

    if (!origin || !destination) {
      console.error(
        "Les coordonnées de départ ou d'arrivée ne sont pas valides."
      );
      return;
    }

    console.log(
      "Demande d'itinéraire pour les coordonnées de départ et d'arrivée"
    );
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        console.log("Status de la réponse: ", status);
        if (status === "OK") {
          console.log("Réponse d'itinéraire reçue: ", response);
          directionsRenderer.setDirections(response);
        } else {
          console.error("Erreur de demande d'itinéraire: ", status);
        }
      }
    );
  } else {
    console.log(
      "Points GPS disponibles, construction de l'itinéraire avec waypoints"
    );
    const waypoints = session.gpsPoints
      .slice(1, session.gpsPoints.length - 1)
      .map((point) => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        stopover: true,
      }));

    const origin = session.gpsPoints[0];
    const destination = session.gpsPoints[session.gpsPoints.length - 1];

    console.log("Demande d'itinéraire avec waypoints");
    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(
          destination.lat,

          destination.lng
        ),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        console.log(
          "Réponse reçue pour la demande d'itinéraire avec waypoints"
        );
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          console.error(
            "Erreur de demande d'itinéraire avec waypoints: " + status
          );
          drawPolylineFallback(session.gpsPoints);
        }
      }
    );
  }
  console.log("Fin de la fonction displayRouteOnMap");
}

function drawPolylineFallback(points) {
  const path = points.map(
    (point) => new google.maps.LatLng(point.lat, point.lng)
  );
  const fallbackRoute = new google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  fallbackRoute.setMap(map);
  const bounds = new google.maps.LatLngBounds();
  for (let point of path) {
    bounds.extend(point);
  }
  map.fitBounds(bounds);
}

const departureInput = document.getElementById("departureCoordinates");
const destinationInput = document.getElementById("destinationCoordinates");

function getGPSLocation(input) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        input.setAttribute("data-source", "navigator");
        input.setAttribute("data-lat", lat);
        input.setAttribute("data-lng", lng);
        input.value = `${lat}, ${lng}`;
        console.log(`Coordonnées GPS de ${input.id} : ${lat}, ${lng}`);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
      }
    );
  } else {
    console.error("Géolocalisation non prise en charge par le navigateur.");
  }
}

function initAutocomplete(input, option) {
  const placesAutocomplete = new google.maps.places.Autocomplete(input, option);

  placesAutocomplete.addListener("place_changed", () => {
    const place = placesAutocomplete.getPlace();
    if (!place.geometry) {
      console.error(`Impossible d'obtenir les coordonnées de ${input.name}`);
      return;
    }
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    input.setAttribute("data-source", "places");
    input.setAttribute("data-lat", lat);
    input.setAttribute("data-lng", lng);
    console.log(`Coordonnées de ${input.name} : ${lat}, ${lng}`);
  });

  return placesAutocomplete;
}

function setupManualEntry(input) {
  const source = input.getAttribute("data-source");
  if (!source || source === "navigator" || source === "places") {
    input.setAttribute("data-source", "manual");
  }
}

function getCoordinates(input, callback) {
  const lat = input.getAttribute("data-lat");
  const lng = input.getAttribute("data-lng");

  if (lat && lng) {
    const coords = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    console.log(`Coordonnées de ${input.name} : ${coords}`);
    callback(coords);
  } else {
    console.error(`Coordonnées non définies pour ${input.name}.`);
  }
}

function calculateDistance(departure, destination, callback) {
  if (!validMatrixValue(departure) || !validMatrixValue(destination)) {
    console.error(
      `Les coordonnées ${departure.value} et/ou ${destination.value} ne sont pas valides`
    );
    return;
  }
  const serviceMatrix = new google.maps.DistanceMatrixService();
  serviceMatrix.getDistanceMatrix(
    {
      origins: [departure],
      destinations: [destination],
      travelMode: "DRIVING", // voiture par défaut
      // avoidHighways : false, // true pour éviter les autoroutes
      avoidTolls: false, // true pour éviter les péages -> donner la posibilité à l'utilisateur pour changer ce parametre (voir pour d'autres)
    },
    function (response, status) {
      if (status === "OK") {
        const origin = response.originAddresses[0];
        const destination = response.destinationAddresses[0];
        if (response.rows[0].elements[0].status === "OK") {
          const distance = response.rows[0].elements[0].distance.text;
          const duration = response.rows[0].elements[0].duration.text;
          callback({ origin, destination, distance, duration });
        } else {
          console.warning("Aucune donnée pour ces adresses");
        }
      } else {
        console.error(
          `Erreur lors du calcul entre les deux positions données : ${status}`
        );
      }
    }
  );
}

/**
 * Vérifie que la valeur soit valide pour être utilisé avec DistanceMatrix
 * Elle peut être une instance de google.maps.LatLng() ou un object avec avec
 * des propriétés `lat` et `lng` qui sont des "number"
 * @param {google.maps.LatLng|Object} value - l'objet à vérifier
 * @returns {boolean} - retourne true si value correspond à un objet DistanceMatrix, faux sinon
 */
function validMatrixValue(value) {
  return (
    value instanceof google.maps.LatLng ||
    (value && typeof value.lat === "number" && typeof value.lng === "number")
  );
}

function extractNumberFromDistanceString(distanceStr) {
  const numberPattern = /[\d\s,]+/;
  let numberPart = distanceStr.match(numberPattern)[0];
  numberPart = numberPart.replace(/,/g, ".");
  numberPart = numberPart.replace(/\s/g, "");
  return Math.round(parseFloat(numberPart));
}

function setDistance(input) {
  const departureCoords = getLatLngFromInput(departureInput);
  const destinationCoords = getLatLngFromInput(destinationInput);

  if (!departureCoords || !destinationCoords) {
    console.error(
      "Les coordonnées de départ ou d'arrivée ne sont pas correctement définies."
    );
    return;
  }

  calculateDistance(departureCoords, destinationCoords, (data) => {
    const travelDistance = Math.round(
      extractNumberFromDistanceString(data.distance)
    );
    input.value = parseInt(travelDistance);
    console.log(
      `Distance parcourue estimée : ${data.distance}, temps de trajet estimé : ${data.duration} entre les points ${data.origin} et ${data.destination}`
    );
  });
}

function getLatLngFromInput(input) {
  const source = input.getAttribute("data-source");

  if (source === "places" || source === "navigator") {
    const lat = parseFloat(input.getAttribute("data-lat"));
    const lng = parseFloat(input.getAttribute("data-lng"));

    if (!isNaN(lat) && !isNaN(lng) && isValidLatLng(lat, lng)) {
      return new google.maps.LatLng(lat, lng);
    } else {
      console.error("Les données de latitude ou de longitude sont invalides.");
      return null;
    }
  } else if (source === "manual") {
    const userLatLng = input.value;
    if (userLatLng) {
      const convertLatLng = convertToLatLng(userLatLng);
      return convertLatLng;
    }
  } else {
    console.error("Source de données non reconnue.");
    return null;
  }
}

function convertToLatLng(coordsStr) {
  console.log("convertToLatLng called with:", coordsStr);
  const parts = coordsStr.split(",").map((part) => parseFloat(part.trim()));
  if (parts.length === 2 && isValidLatLng(parts[0], parts[1])) {
    const latLng = new google.maps.LatLng(parts[0], parts[1]);
    console.log("Converted to LatLng:", latLng);
    return latLng;
  } else {
    console.error("Format de coordonnées invalide pour:", coordsStr);
    return null;
  }
}

function isValidLatLng(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function getCoords(form, elementName) {
  const element = form[elementName];
  if (!element) {
    console.warn(`Element ${elementName} non trouvé`);
    return null;
  }
  const lat = parseFloat(element.getAttribute("data-lat"));
  const lng = parseFloat(element.getAttribute("data-lng"));

  if (isValidLatLng(lat, lng)) {
    return `${lat},${lng}`;
  } else {
    console.log(`Coordonnées de l'element ${elementName} nulles ou invalides`);
    return null;
  }
}

function setCoordinates(elementId, coords) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Élément avec l'ID ${elementId} introuvable.`);
    return;
  }

  if (!coords || coords === "") {
    console.log(`Aucune coordonnée fournie pour ${elementId}.`);
    return;
  }

  let lat, lng;

  if (typeof coords === "string") {
    const latLng = coords.split(",").map((part) => parseFloat(part.trim()));
    if (latLng.length === 2 && isValidLatLng(latLng[0], latLng[1])) {
      lat = latLng[0];
      lng = latLng[1];
    } else {
      console.error(
        `Erreur lors de la récupération des coordonnées pour ${elementId}.`
      );
      return;
    }
  } else if (
    typeof coords === "object" &&
    coords.hasOwnProperty("lat") &&
    coords.hasOwnProperty("lng")
  ) {
    lat = coords.lat;
    lng = coords.lng;
    if (!isValidLatLng(lat, lng)) {
      console.error(`Coordonnées invalides pour ${elementId}.`);
      return;
    }
  } else {
    console.error(`Format de coordonnées non reconnu pour ${elementId}.`);
    return;
  }

  element.value = `${lat},${lng}`;
  element.setAttribute("data-lat", lat.toString());
  element.setAttribute("data-lng", lng.toString());
}

function initHomeMaps() {}

function initDataEntryMaps() {
  initAutocomplete(departureInput, options);
  initAutocomplete(destinationInput, options);
}

function initSessionsOvwMaps() {}

let map;
function initSessionDetails() {
  const routeMap = document.getElementById("routeMap");
  if (routeMap) {
    map = new google.maps.Map(routeMap, {
      center: { lat: 48.8566, lng: 2.3522 }, // Paris
      zoom: 8,
    });
  } else {
    console.error("L'élément map n'a pas été trouvé dans le DOM.");
  }
}

function loadGoogleMapsApi(initCallback, libraries = []) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      initCallback();
      resolve();
      return;
    }

    const script = document.createElement("script");
    let librariesQuery = "";
    const apiKey = "";
    if (libraries.length > 0) {
      librariesQuery = `&libraries=${libraries.join(",")}`;
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${librariesQuery}&callback=initMaps`;

    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.initMaps = () => {
      initCallback();
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Google Maps API failed to load"));
    };
  });
}

export {
  initAutocomplete,
  getGPSLocation,
  calculateDistance,
  getCoordinates,
  setDistance,
  setupManualEntry,
  startGpsTracking,
  stopGpsTracking,
  calculateTrackedDistance,
  displayRouteOnMap,
  loadGoogleMapsApi,
  initDataEntryMaps,
  initHomeMaps,
  initSessionsOvwMaps,
  initSessionDetails,
  convertToLatLng,
  isValidLatLng,
  setCoordinates,
  getCoords,
  gpsPoints,
};
