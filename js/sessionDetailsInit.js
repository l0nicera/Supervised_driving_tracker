import { setupSessionDetails } from "./eventHandlers.js";
import {
  loadGoogleMapsApi,
  initSessionDetails,
  displayRouteOnMap,
} from "./locationServices.js";
import { initializeSessionData } from "./sessionManager.js";
import {
  formatDistance,
  formatDuration,
  calculateDuration,
  formatTime,
  formatDate,
  translateDataToFrench,
} from "./utils.js";
import { drivingConditions, translations } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const storedSessions = initializeSessionData();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = parseInt(urlParams.get("id"));
  const routeMap = document.getElementById("routeMap");
  let selectedSession = null;

  if (sessionId) {
    selectedSession = storedSessions.find(
      (session) => session.idExp === sessionId
    );
  }

  const librariesDataEntry = ["places", "geometry"];
  loadGoogleMapsApi(initSessionDetails, librariesDataEntry)
    .then(() => {
      console.log("Google Maps API loaded and initialized for DataEntry page");
      if (selectedSession) {
        displaySessionDetails(selectedSession);
        if (
          selectedSession.gpsPoint ||
          (selectedSession.startCoords && selectedSession.stopCoords)
        ) {
          displayRouteOnMap(selectedSession);
          routeMap.removeAttribute("hidden");
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });

  setupSessionDetails();
});

function displaySessionDetails(session) {
  const headerSubtitleElement = document.querySelector("header hgroup p");
  const formattedStartDate = formatDate(session.startDatetime);
  headerSubtitleElement.textContent = `Détails de la session du ${formattedStartDate}`;

  const detailsContainer = document.getElementById("sessionDetails");
  const duration = calculateDuration(
    session.startDatetime,
    session.stopDatetime
  );
  addDetail(detailsContainer, "Durée", formatDuration(duration));
  addDetail(
    detailsContainer,
    "Distance parcourue",
    formatDistance(session.travelDistance)
  );

  const conditionsDetails = document.getElementById("conditionsDetails");

  translateAndAddDetails(
    session,
    drivingConditions,
    translations,
    conditionsDetails
  );

  const editSessionLink = document.getElementById("editSessionLink");
  editSessionLink.setAttribute("href", `DataEntry.html?id=${session.idExp}`);
  const addInfosLink = document.getElementById("addInfosLink");
  addInfosLink.setAttribute("href", `DataEntry.html?id=${session.idExp}`);
}

function translateAndAddDetails(
  session,
  drivingConditions,
  translations,
  container
) {
  const translateIds = (ids, conditionIndex) => {
    console.log(`Index de drivingCondition : ${conditionIndex}`);
    console.log(`ID à traduire : ${ids}`);
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    return ids
      .map((id) => {
        console.log(`ID : ${id}`);

        const conditionIdKey = `id${Object.keys(
          drivingConditions[conditionIndex][0]
        )
          .find((key) => /id[A-Z]/.test(key))
          .slice(2)}`;

        const condition = drivingConditions[conditionIndex].find((c) => {
          console.log(
            `Recherche avec la clé : ${conditionIdKey} et la valeur : ${id}`
          );
          return c[conditionIdKey] === parseInt(id);
        });

        if (condition) {
          console.log(`Correspondance trouvée :`, condition);
          const translationKey = Object.keys(condition).find(
            (key) => key !== conditionIdKey
          );
          console.log(
            `Clé : ${translationKey}, Valeur traduite : ${
              translations[condition[translationKey]]
            }`
          );
          return translations[condition[translationKey]];
        } else {
          console.log(`Aucune correspondance trouvée pour l'ID : ${id}`);
          return "";
        }
      })
      .filter((t) => {
        if (t === "") {
          console.log("Traduction vide filtrée");
        }
        return t !== "";
      });
  };

  if (session.nighttime) {
    addDetail(container, translations["nightDriving"]);
  }

  if (session.idHazard) {
    const hazards = translateIds(session.idHazard, 1);
    if (hazards.length > 0) {
      addDetail(container, translations["hazard"], hazards.join(", "));
    }
  }

  if (session.idWeather) {
    const weather = translateIds(session.idWeather, 2);
    if (weather.length > 0) {
      addDetail(container, translations["weather"], weather.join(", "));
    }
  }

  if (session.idRoadType) {
    const roadType = translateIds(session.idRoadType, 3);
    if (roadType.length > 0) {
      addDetail(container, translations["roadType"], roadType.join(", "));
    }
  }

  if (session.idParking) {
    const parking = translateIds(session.idParking, 4);
    if (parking.length > 0) {
      addDetail(container, translations["parking"], parking.join(", "));
    }
  }

  if (session.idManoeuver) {
    const manoeuver = translateIds(session.idManoeuver, 5);
    if (manoeuver.length > 0) {
      addDetail(container, translations["manoeuver"], manoeuver.join(", "));
    }
  }
}

function addDetail(container, label, value = "") {
  const detail = document.createElement("p");
  if (value !== "") {
    detail.innerHTML = `<strong>${label}:</strong> ${value}`;
  } else {
    detail.innerHTML = `<strong>${label}</strong>`;
  }
  container.appendChild(detail);
}
