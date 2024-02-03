import { translations } from "./data.js";
import { setDistance, calculateTrackedDistance } from "./locationServices.js";

/**
 * Retourne la date et l'heure actuelle sous le même format que datetime-local en prennant en compte le
 * décalage horaire
 */
function setCurrentDateTime() {
  const initDate = new Date();

  const timezoneDiff = initDate.getTimezoneOffset() * 60000; // Date() utilise les millisecondes comme unité

  const localDateTime = new Date(initDate - timezoneDiff).toISOString(); // On soustrait le décallage horaire (getTimezoneOffset() donne des valeurs inversées : UTC+1 = -60)

  return localDateTime.slice(0, 16); // On garde que la date et l'heure sans secondes et millisecondes
}

/**
 *  Récupère les valeurs multiples d'un champ (checkbox ou select) lorsqu'il y en a
 * @param {HTMLElement} form - le form dans lequel se trouve ce champ
 * @param {string} fieldName - le nom du champ dans lequel récupérer les valeurs
 * @returns {Array} - tableau contenant toutes les valeurs du champ
 */
function getMultipleValues(form, fieldName) {
  const allFieldElements = form.querySelectorAll(`[name="${fieldName}"]`); //  récupère tous les éléments correspondants au nom du champ
  let selectedValues = []; // initialise le tableau pour stocker les valeurs

  allFieldElements.forEach((e) => {
    if (e.type === "checkbox" && e.checked) {
      selectedValues.push(e.value); // si la case est coché, push sa valeur dans le tableau
    } else if (e.type === "select-multiple") {
      Array.from(e.selectedOptions).forEach((opt) => {
        // créé une collection avec les options qui sont selectionnées puis parcours chaque élément
        selectedValues.push(opt.value); //si une option est selectionnée, push sa valeur dans le tableau
      });
    }
  });
  return selectedValues;
}

/**
 * Renvoie la traduction ou le string d'origine si pas trouvé
 */
function translateDataToFrench(str) {
  if (typeof translations === "undefined") {
    console.log("Translations object is undefined");
    return str;
  }
  if (!translations[str]) {
    console.log("No translation found for " + str);
    return str;
  }
  return translations[str];
}

function resetElement(elementId) {
  var element = document.getElementById(elementId);
  element.value = "";
  element.setAttribute("data-source", "");
}

function toggleAttribute(element, attr) {
  if (element.hasAttribute(attr)) {
    element.removeAttribute(attr);
  } else {
    element.setAttribute(attr, "");
  }
}

function setFormField(form, fieldName, sessionValue) {
  const fields = form[fieldName];

  if (!fields) {
    console.warn(`Champ "${fieldName}" non trouvé dans le formulaire.`);
    return;
  }

  if (fields.type === "checkbox") {
    // Gestion d'un seul checkbox avec valeur booléenne
    fields.checked = Boolean(sessionValue);
  } else if (
    fields.type === "select-one" ||
    fields.type === "select-multiple"
  ) {
    // Gestion des champs de type select
    if (Array.isArray(sessionValue)) {
      Array.from(fields.options).forEach((option) => {
        option.selected = sessionValue.includes(option.value);
      });
    } else {
      fields.value = sessionValue || "";
    }
  } else if (fields.length) {
    // Gestion d'un groupe de checkboxes ou de boutons radio (choix multiples)
    Array.from(fields).forEach((field) => {
      if (field.type === "checkbox") {
        field.checked =
          Array.isArray(sessionValue) && sessionValue.includes(field.value);
      } else if (field.type === "radio") {
        field.checked = field.value === sessionValue;
      }
    });
  } else {
    // Pour les autres types de champs
    fields.value = sessionValue || "";
  }
}

function formatDatetime(datetimeStr, formatType = "combined") {
  const dt = new Date(datetimeStr);
  const date = dt.toLocaleDateString("fr-FR");
  const time = dt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (formatType === "combined") {
    return `${date} à ${time}`;
  } else if (formatType === "split") {
    return [date, time];
  }
}

function calculElapsedTime(startDatetimeStr, endDatetimeStr) {
  const startDt = new Date(startDatetimeStr);
  const endDt = new Date(endDatetimeStr);
  const elapsedMs = endDt - startDt;

  const hours = Math.floor(elapsedMs / 3600000); // 3600000 ms dans une heure
  const minutes = Math.round((elapsedMs % 3600000) / 60000); // 60000 ms dans une minute

  return [hours, minutes];
}

let timerInterval;
let startTime;
let distance = 0;

function toggleCounter() {
  const timerDisplay = document.getElementById("timerDisplay");
  const timeElapsedSpan = document.getElementById("timeElapsed");
  const distanceCoveredSpan = document.getElementById("distanceCovered");

  if (sessionControlBtn.classList.contains("start")) {
    startTime = new Date();
    timerInterval = setInterval(() => {
      const currentTime = new Date();
      const timeElapsed = new Date(currentTime - startTime);
      const hours = String(timeElapsed.getUTCHours()).padStart(2, "0");
      const minutes = String(timeElapsed.getUTCMinutes()).padStart(2, "0");
      const seconds = String(timeElapsed.getUTCSeconds()).padStart(2, "0");
      timeElapsedSpan.textContent = `${hours}:${minutes}:${seconds}`;

      const distance = calculateTrackedDistance();
      distanceCoveredSpan.textContent = `${distance.toFixed(1)}`;
    }, 1000);
    timerDisplay.style.display = "block";
  } else {
    clearInterval(timerInterval);
    timerDisplay.style.display = "none";
  }
}

function convertToDateTimeLocalFormat(dateTimeStr) {
  const date = new Date(dateTimeStr);
  const localDateStr = date.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM
  return localDateStr;
}

function formatDate(datetime) {
  const date = new Date(datetime);
  return date.toString() !== "Invalid Date" ? date.toLocaleDateString() : "-";
}

function formatTime(datetime) {
  const time = new Date(datetime);
  return time.toString() !== "Invalid Date" ? time.toLocaleTimeString() : "-";
}

function calculateDuration(startDatetime, stopDatetime) {
  const start = new Date(startDatetime);
  const stop = new Date(stopDatetime);
  return stop - start;
}

function formatDuration(duration) {
  if (isNaN(duration) || duration <= 0) return "-";
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
}

function formatDistance(distance) {
  return distance && distance >= 1 ? `${distance} km` : "-";
}

function validateForm() {
  const startDateSelect = document.getElementById("startDateSelect");
  const endDateSelect = document.getElementById("endDateSelect");
  const distanceInput = document.getElementById("travelDistance");
  const departureInput = document.getElementById("departureCoordinates");
  const destinationInput = document.getElementById("destinationCoordinates");

  if (!startDateSelect || startDateSelect.value === "") {
    startDateSelect.setCustomValidity("La date de départ est obligatoire.");
    startDateSelect.reportValidity();
  } else {
    startDateSelect.setCustomValidity("");
  }

  if (!endDateSelect || endDateSelect.value === "") {
    endDateSelect.setCustomValidity("La date d'arrivée est obligatoire.");
    endDateSelect.reportValidity();
  } else {
    endDateSelect.setCustomValidity("");
  }

  if (
    !startDateSelect ||
    startDateSelect.value === "" ||
    !endDateSelect ||
    endDateSelect.value === ""
  ) {
    return false;
  }
  const startDate = new Date(startDateSelect.value);
  const endDate = new Date(endDateSelect.value);
  const startYear = startDate.getFullYear().toString();
  const endYear = endDate.getFullYear().toString();
  if (startYear.length !== 4 || endYear.length !== 4) {
    startDateSelect.setCustomValidity(
      "Les années doivent être composées de 4 chiffres."
    );
    startDateSelect.reportValidity();
    endDateSelect.setCustomValidity(
      "Les années doivent être composées de 4 chiffres."
    );
    endDateSelect.reportValidity();
    return false;
  } else {
    startDateSelect.setCustomValidity("");
    endDateSelect.setCustomValidity("");
  }

  if (
    startDate.getFullYear() < 1900 ||
    startDate.getFullYear() > 2099 ||
    endDate.getFullYear() < 1900 ||
    endDate.getFullYear() > 2099
  ) {
    startDateSelect.setCustomValidity(
      "Les dates doivent être entre 1900 et 2099."
    );
    startDateSelect.reportValidity();
    endDateSelect.setCustomValidity(
      "Les dates doivent être entre 1900 et 2099."
    );
    endDateSelect.reportValidity();
    return false;
  } else {
    startDateSelect.setCustomValidity("");
    endDateSelect.setCustomValidity("");
  }

  if (startDate >= endDate) {
    startDateSelect.setCustomValidity(
      "La date ou l'heure de départ doit être inférieure à celle d'arrivée."
    );
    startDateSelect.reportValidity();
    endDateSelect.setCustomValidity(
      "La date ou l'heure de départ doit être inférieure à celle d'arrivée."
    );
    endDateSelect.reportValidity();
    return false;
  } else {
    startDateSelect.setCustomValidity("");
    endDateSelect.setCustomValidity("");
  }

  let distance = parseInt(distanceInput.value, 10);

  if (isNaN(distance) || distance < 1 || distance > 9999) {
    if (departureInput.value && destinationInput.value) {
      distance = setDistance(distanceInput);

      if (isNaN(distance) || distance < 1 || distance > 9999) {
        distanceInput.setCustomValidity(
          "Distance invalide ou impossible à calculer."
        );
        distanceInput.reportValidity();
        return false;
      } else {
        distanceInput.setCustomValidity("");
        distanceInput.value = distance;
      }
    } else {
      distanceInput.setCustomValidity(
        "Veuillez entrer une distance valide (1 à 9999)."
      );
      distanceInput.reportValidity();
      return false;
    }
  } else {
    distanceInput.setCustomValidity("");
  }

  return true;
}

export {
  validateForm,
  setCurrentDateTime,
  getMultipleValues,
  translateDataToFrench,
  resetElement,
  toggleAttribute,
  setFormField,
  formatDatetime,
  calculElapsedTime,
  toggleCounter,
  convertToDateTimeLocalFormat,
  formatDistance,
  formatDuration,
  calculateDuration,
  formatTime,
  formatDate,
};
