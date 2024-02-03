import { translations, drivingConditions } from "./data.js";
import {
  formatDistance,
  formatDuration,
  calculateDuration,
  formatTime,
  formatDate,
} from "./utils.js";
import { getStoredDrivingSessions } from "./sessionManager.js";

export let lastDisplayedSessionIndex = -1;

export function resetLastDisplayedSessionIndex() {
  lastDisplayedSessionIndex = -1;
  //console.log(`resetLastDisplayedSessionIndex : ${lastDisplayedSessionIndex}`);
}
export function incrementLastDisplayedSessionIndex() {
  lastDisplayedSessionIndex++;
  //console.log(`incrementLastDisplayedSessionIndex : ${lastDisplayedSessionIndex}`);
}
export function displaySessions(tableBody) {
  //console.log("Affichage des sessions");
  initializeDisplay(tableBody);

  const sessions = getStoredDrivingSessions();
  sessions.slice(lastDisplayedSessionIndex + 1).forEach((session) => {
    const row = createSessionRow(tableBody, session);
    addLinksToRow(row, session);
    incrementLastDisplayedSessionIndex();
    //console.log(`Session ${session.idExp} affichée, index actuel: ${lastDisplayedSessionIndex}`);
  });
}

function initializeDisplay(tableBody) {
  tableBody.innerHTML = "";
  resetLastDisplayedSessionIndex();
}

function createSessionRow(tableBody, session) {
  //console.log(`Création de la ligne pour la session ${session.idExp}`);
  const row = tableBody.insertRow();
  row.dataset.sessionId = session.idExp;

  addCell(row, formatDate(session.startDatetime));
  addCell(row, formatTime(session.startDatetime));
  addCell(row, formatTime(session.stopDatetime));

  const duration = calculateDuration(
    session.startDatetime,
    session.stopDatetime
  );
  addCell(row, formatDuration(duration));

  addCell(row, formatDistance(session.travelDistance));

  const conditions = extractConditions(session);
  addCell(row, conditions || "-");

  return row;
}

function addCell(row, text) {
  const cell = row.insertCell();
  cell.textContent = text;
}

function extractConditions(session) {
  let conditions = [];

  if (session.nighttime) {
    conditions.push(translations.nightDriving);
  }

  drivingConditions.slice(1).forEach((conditionCategory) => {
    conditionCategory.forEach((condition) => {
      Object.entries(condition).forEach(([key, value]) => {
        if (key.startsWith("id") && checkCondition(session, key, value)) {
          let translationKey = getTranslationKey(condition, key);
          conditions.push(translations[translationKey]);
        }
      });
    });
  });

  return conditions.join(", ");
}

function checkCondition(session, key, value) {
  return Array.isArray(session[key])
    ? session[key].some((sessionCondition) => sessionCondition[key] == value)
    : session[key] == value;
}

function getTranslationKey(condition, excludeKey) {
  return condition[Object.keys(condition).find((key) => key !== excludeKey)];
}

function addLinksToRow(row, session) {
  //console.log(`Ajout de liens pour la session ${session.idExp}`);
  const editLink = createLink(
    "Éditer",
    `DataEntry.html?id=${session.idExp}&source=SessionsOverview`
  );
  editLink.classList.add("editLink-session-link");
  const deleteLink = createLink("Supprimer", "");
  deleteLink.classList.add("delete-session-link");
  deleteLink.dataset.sessionId = session.idExp;

  const actionCell = row.insertCell();
  actionCell.appendChild(editLink);
  actionCell.appendChild(deleteLink);
}

function createLink(text, href) {
  const link = document.createElement("a");
  link.textContent = text;
  link.href = href;
  return link;
}
