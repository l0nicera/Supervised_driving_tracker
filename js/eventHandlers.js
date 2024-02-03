import * as sessionManager from "./sessionManager.js";
import * as utils from "./utils.js";
import * as locationService from "./locationServices.js";
import * as wakeLock from "./wakeLock.js";
import { displaySessions } from "./drivingSessionTable.js";
import { sessionDateField } from "./uiComponents.js";
import { initGauge } from "./gaugeKm.js";

export function setupHomeHandlers() {
  const sessionControlBtn = document.getElementById("sessionControlBtn");
  const homePageModal = document.getElementById("homePageModal");
  const continueDataEntryLink = document.getElementById(
    "continueDataEntryLink"
  );
  const sessionInfo = document.getElementById("sessionInfo");
  const chartCointainer = document.getElementById("chartCointainer");
  const continueToSessionDetails = document.getElementById(
    "continueToSessionDetails"
  );
  addEventHandler(sessionControlBtn, "click", toggleSessionState);

  function toggleSessionState() {
    const btn = document.getElementById("sessionControlBtn");
    if (btn.classList.contains("start")) {
      if (!startSession()) {
        alert(
          "Veuillez autoriser l'utilisation de la position de l'appareil ou effectuez une saisie manuelle"
        );
        return;
      }
      btn.classList.remove("start");
      btn.classList.add("stop");
      btn.textContent = "Stop";
      chartCointainer.style.display = "none";
    } else {
      if (!stopSession()) {
        console.error("Erreur de traitement de la session");
        return;
      }
      btn.classList.remove("stop");
      btn.classList.add("start");
      btn.textContent = "Start";
      chartCointainer.style.display = "block";
    }
  }

  // const totalDistanceCovered = document.getElementById("totalDistanceCovered");
  // totalDistanceCovered.textContent = `${totalDistance} / 3000 km`;

  function startSession() {
    const gpsTrackingStarted = locationService.startGpsTracking();
    if (!gpsTrackingStarted) {
      return false;
    }

    wakeLock.requestWakeLock();
    const currentSession = sessionManager.createDrivingSession();
    currentSession.startDatetime = utils.setCurrentDateTime();
    sessionManager.saveSessionsToLocalStorage();
    utils.toggleCounter();
    return true;
  }

  function stopSession() {
    const gpsTrackingStopped = locationService.stopGpsTracking();
    if (!gpsTrackingStopped) {
      return false;
    }

    wakeLock.releaseWakeLock();

    if (sessionManager.currentSession) {
      const currentSession = sessionManager.currentSession;
      currentSession.stopDatetime = utils.setCurrentDateTime();
      currentSession.travelDistance = Math.round(
        locationService.calculateTrackedDistance()
      );
      currentSession.gpsPoints = [...locationService.gpsPoints];

      if (currentSession.gpsPoints && currentSession.gpsPoints.length > 0) {
        currentSession.startCoords = currentSession.gpsPoints[0];
        currentSession.stopCoords =
          currentSession.gpsPoints[currentSession.gpsPoints.length - 1];
      }

      sessionManager.saveSessionsToLocalStorage();
      initGauge();

      sessionInfo.innerHTML = `
            Date de début: ${utils.formatDatetime(
              currentSession.startDatetime,
              "combined"
            )}<br>
            Date de fin: ${utils.formatDatetime(
              currentSession.stopDatetime,
              "combined"
            )}<br>
            Distance parcourue: ${currentSession.travelDistance} km
        `;
      continueToSessionDetails.setAttribute(
        "href",
        `./pages/SessionDetails.html?id=${currentSession.idExp}`
      );
      homePageModal.style.display = "block";
      continueDataEntryLink.setAttribute(
        "href",
        `./pages/DataEntry.html?id=${currentSession.idExp}&source=homePage`
      );

      utils.toggleCounter();
    } else {
      console.error("Aucune session active");
      return false;
    }
    return true;
  }

  const closeModal = document.getElementsByClassName("close")[0];
  closeModal.onclick = function () {
    homePageModal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == homePageModal) {
      homePageModal.style.display = "none";
    }
  };
}

export function setupSessionsOvwHandlers() {
  const sessionsTable = document.getElementById("sessionsTable");
  const sessionsTableBody = sessionsTable.querySelector("tbody");

  window.onload = () => {
    displaySessions(sessionsTableBody);
  };

  addEventHandler(sessionsTableBody, "click", function (event) {
    const target = event.target;

    if (target.classList.contains("delete-session-link")) {
      event.stopPropagation();
      event.preventDefault();
      const sessionId = target.dataset.sessionId;
      //console.log(`Clic sur le lien de suppression pour la session ${sessionId}.`);
      if (handleDelete(parseInt(sessionId), sessionsTableBody)) {
        displaySessions(sessionsTableBody);
      }
    } else if (target.tagName === "TD") {
      const row = target.parentElement;
      const sessionId = row.dataset.sessionId;
      window.location.href = `SessionDetails.html?id=${sessionId}`;
    }
  });

  function handleDelete(sessionId, tableBody) {
    //console.log(`Demande de suppression de la session avec l'ID : ${sessionId}`);
    if (confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      sessionManager.deleteSession(sessionId);
      sessionManager.clearTable(tableBody);
      displaySessions(tableBody);
      //console.log(`Tableau mis à jour après suppression de la session ${sessionId}.`);
      return true;
    }
    //console.log(`Suppression annulée pour la session ${sessionId}.`);
    return false;
  }
}

export function setupSessionDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = parseInt(urlParams.get("id"), 10);

  if (sessionId) {
    const session = sessionManager.getStoredDrivingSessions(sessionId);
    if (session) {
    }
  }
}

export function setupFormHandlers() {
  const elements = {
    sessionForm: document.getElementById("sessionForm"),
    setDateTimeStartButton: document.getElementById("setDateTimeStartButton"),
    setDateTimeStopButton: document.getElementById("setDateTimeStopButton"),
    submitFormButton: document.getElementById("submitFormButton"),
    departureInput: document.getElementById("departureCoordinates"),
    destinationInput: document.getElementById("destinationCoordinates"),
    getDeparturePositionButton: document.getElementById(
      "getDeparturePositionButton"
    ),
    getDestinationPositionButton: document.getElementById(
      "getDestinationPositionButton"
    ),
    calculateBtn: document.getElementById("calculateBtn"),
    startDatetime: document.getElementById("startDatetime"),
    stopDatetime: document.getElementById("stopDatetime"),
    distanceInput: document.getElementById("travelDistance"),
    startDateSelect: document.querySelector("#startDateSelect"),
    endDateSelect: document.querySelector("#endDateSelect"),
    resetStartDateSelect: document.getElementById("resetStartDateSelect"),
    resetEndDateSelect: document.getElementById("resetEndDateSelect"),
  };

  // Leur valeur initiale
  console.log(
    "Index initial de startDateSelect : " + startDateSelect.selectedIndex
  );
  console.log(
    "Index initial de endDateSelect : " + endDateSelect.selectedIndex
  );
  addEventHandler(elements.startDateSelect, "change", () => {
    sessionDateField(startDateSelect);
  });
  addEventHandler(elements.endDateSelect, "change", () => {
    sessionDateField(endDateSelect);
  });

  addEventHandler(elements.setDateTimeStartButton, "click", () => {
    elements.startDatetime.value = utils.setCurrentDateTime();
  });

  addEventHandler(elements.setDateTimeStopButton, "click", () => {
    elements.stopDatetime.value = utils.setCurrentDateTime();
  });

  addEventHandler(elements.submitFormButton, "click", () => {
    const sessionId = document.getElementById("sessionId").value;

    if (utils.validateForm()) {
      if (sessionId) {
        const updatedData = sessionManager.getUpdatedSessionData("sessionForm");
        if (updatedData) {
          sessionManager.updateSession(parseInt(sessionId), updatedData);
          elements.sessionForm.reset();
          window.location.href = `./SessionDetails.html?id=${sessionId}`;
        }
      } else {
        const newSession = sessionManager.createDrivingSession();
        const newSessionId = newSession.idExp;
        sessionManager.setDrivingExperienceInfo(newSession);
        sessionManager.saveSessionsToLocalStorage();
        elements.sessionForm.reset();
        window.location.href = `./SessionDetails.html?id=${newSessionId}`;
      }
    } else {
      console.log("Erreur de validation des données");
    }
  });

  addEventHandler(elements.departureInput, "click", () => {
    locationService.setupManualEntry(elements.departureInput);
  });

  addEventHandler(elements.destinationInput, "click", () => {
    locationService.setupManualEntry(elements.destinationInput);
  });

  addEventHandler(elements.getDeparturePositionButton, "click", () => {
    locationService.getGPSLocation(elements.departureInput);
  });

  addEventHandler(elements.getDestinationPositionButton, "click", () => {
    locationService.getGPSLocation(elements.destinationInput);
  });

  addEventHandler(elements.calculateBtn, "click", () => {
    const setDistanceStatus = locationService.setDistance(
      elements.distanceInput
    );
    if (!setDistanceStatus) {
      elements.departureInput.setCustomValidity("Coordonnées invalides.");
      elements.destinationInput.setCustomValidity("Coordonnées invalides.");
      elements.departureInput.reportValidity();
      elements.destinationInput.reportValidity();
    } else {
      elements.calculateBtn.value = setDistanceStatus;
      elements.departureInput.setCustomValidity("");
    }
  });
}

function addEventHandler(element, eventType, handler) {
  if (element) {
    element.addEventListener(eventType, handler);
  }
}
