import { getMultipleValues, setFormField, toggleAttribute } from "./utils.js";
import { drivingSessions } from "./data.js";
import {
  resetLastDisplayedSessionIndex,
  displaySessions,
} from "./drivingSessionTable.js";
import { updateInsertDatePicker } from "./uiComponents.js";
import { setCoordinates, getCoords } from "./locationServices.js";

let currentSession = null; // session active pour enregistrement des données

/**
 *Créé un nouvel objet correspondant aux données de session de conduite
 * @returns {Object} Une nouvelle session réinitialisée
 */
function createDrivingSession() {
  const newSession = {
    idExp: getLastSessionId() + 1,
    startDatetime: null,
    stopDatetime: null,
    startCoords: null,
    stopCoords: null,
    travelDistance: null,
    nighttime: null,
    idHazard: null,
    idWeather: null,
    idRoadType: null,
    idParking: null,
    idManoeuver: null,
    gpsPoints: null,
  };
  drivingSessions.push(newSession);
  currentSession = newSession;
  return newSession;
}

function setDrivingExperienceInfo() {
  if (!currentSession) {
    console.log("Aucune session active");
    return;
  }
  const sessionForm = document.getElementById("sessionForm");
  if (!sessionForm) {
    console.log("Aucune condition de conduite à enregistrer dans " + session);
    return;
  }
  currentSession.startDatetime = sessionForm["startDateSelect"].value;
  currentSession.stopDatetime = sessionForm["endDateSelect"].value;
  currentSession.travelDistance = parseInt(sessionForm["travelDistance"].value);
  currentSession.nighttime = sessionForm["nightDriving"].checked;
  currentSession.idHazard = getMultipleValues(sessionForm, "hazard");
  currentSession.idWeather = sessionForm["weather"].value;
  currentSession.idRoadType = getMultipleValues(sessionForm, "roadType");
  currentSession.idParking = getMultipleValues(sessionForm, "parking");
  currentSession.idManoeuver = getMultipleValues(sessionForm, "manoeuver");
  currentSession.startCoords = getCoords(sessionForm, "departureCoordinates");
  (currentSession.stopCoords = getCoords(
    sessionForm,
    "destinationCoordinates"
  )),
    console.log(currentSession);
}

function initializeSessionData() {
  const storedSessions = localStorage.getItem("drivingSessions");
  if (storedSessions) {
    const parsedSessions = JSON.parse(storedSessions);
    drivingSessions.length = 0;
    drivingSessions.push(...parsedSessions);
    return parsedSessions;
  }
  return [];
}

function getUpdatedSessionData(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    console.log(`Formulaire ${formId} non trouvé`);
    return null;
  }
  return {
    startDatetime: form["startDateSelect"].value,
    stopDatetime: form["endDateSelect"].value,
    startCoords: getCoords(form, "departureCoordinates"),
    stopCoords: getCoords(form, "destinationCoordinates"),
    travelDistance: parseInt(form["travelDistance"].value),
    nighttime: form["nightDriving"].checked,
    idHazard: getMultipleValues(sessionForm, "hazard"),
    idWeather: form["weather"].value,
    idRoadType: getMultipleValues(form, "roadType"),
    idParking: getMultipleValues(sessionForm, "parking"),
    idManoeuver: getMultipleValues(sessionForm, "manoeuver"),
  };
}

function getLastSessionId() {
  return drivingSessions.length > 0
    ? Math.max(...drivingSessions.map((session) => session.idExp))
    : 0;
}

function saveSessionsToLocalStorage() {
  localStorage.setItem("drivingSessions", JSON.stringify(drivingSessions));
  console.log("Sessions sauvegardées dans localStorage:", drivingSessions);
}

function saveNewSession(newSession) {
  newSession.idExp = getLastSessionId() + 1;
  drivingSessions.push(newSession);
  saveSessionsToLocalStorage();
}

function loadSessionsFromLocalStorage() {
  const storedSessions = localStorage.getItem("drivingSessions");
  return storedSessions ? JSON.parse(storedSessions) : [];
}

function editSession(sessionId) {
  const session = drivingSessions.find((s) => s.idExp === sessionId);
  const form = document.getElementById("sessionForm");
  if (session) {
    document.getElementById("startDateSelect").value = session.startDatetime;
    document.getElementById("endDateSelect").value = session.stopDatetime;
    document.getElementById("travelDistance").value = session.travelDistance;
    setCoordinates("departureCoordinates", session.startCoords);
    setCoordinates("destinationCoordinates", session.stopCoords);
    setFormField(form, "nightDriving", session.nighttime);
    setFormField(form, "hazard", session.idHazard);
    setFormField(form, "weather", session.idWeather);
    setFormField(form, "roadType", session.idRoadType);
    setFormField(form, "parking", session.idParking);
    setFormField(form, "manoeuver", session.idManoeuver);
    document.getElementById("sessionId").value = sessionId;

    // Gère le cas des inputs insertDatePicker
    if (session.startDatetime) {
      updateInsertDatePicker(startDateSelect, session.startDatetime);
    }

    if (session.stopDatetime) {
      updateInsertDatePicker(endDateSelect, session.stopDatetime);
    }
  }
}

function deleteSession(sessionId = null) {
  console.log(
    `Tentative de suppression de la session avec l'ID : ${sessionId}`
  );
  if (sessionId === null) {
    drivingSessions.length = 0;
  } else {
    const index = drivingSessions.findIndex((s) => s.idExp === sessionId);
    if (index > -1) {
      drivingSessions.splice(index, 1);
      console.log(`Session avec l'ID ${sessionId} supprimée.`);
    } else {
      console.warn(`Aucune session trouvée avec l'ID ${sessionId}.`);
    }
  }
  resetLastDisplayedSessionIndex();
  saveSessionsToLocalStorage();
}

function clearTable(tableBody) {
  //let rowCount = 0;
  //console.log("Début du nettoyage de la table");
  while (tableBody.firstChild) {
    //console.log(`Suppression de la ligne ${rowCount + 1}`);
    tableBody.removeChild(tableBody.firstChild);
  }
  //console.log(`Table nettoyée, nombre de lignes supprimées : ${rowCount}`);
}

function updateSession(sessionId, updatedData) {
  const session = drivingSessions.find((s) => s.idExp === sessionId);
  if (session) {
    Object.assign(session, updatedData);
    saveSessionsToLocalStorage();
  }
}

function getStoredDrivingSessions() {
  return JSON.parse(localStorage.getItem("drivingSessions") || "[]");
}

export {
  currentSession,
  setDrivingExperienceInfo,
  createDrivingSession,
  saveSessionsToLocalStorage,
  loadSessionsFromLocalStorage,
  deleteSession,
  updateSession,
  saveNewSession,
  initializeSessionData,
  clearTable,
  getUpdatedSessionData,
  editSession,
  getStoredDrivingSessions,
};
