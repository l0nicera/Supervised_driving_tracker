import { setupFormHandlers } from "./eventHandlers.js";
import { loadGoogleMapsApi, initDataEntryMaps } from "./locationServices.js";
import { initializeSessionData, editSession } from "./sessionManager.js";
import { initialiseForm } from "./uiComponents.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeSessionData();

  setupFormHandlers();

  initialiseForm("sessionForm");

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("id");
  const source = urlParams.get("source");
  const headerSubtitleElement = document.querySelector("header hgroup p");

  const librariesDataEntry = ["places"];
  loadGoogleMapsApi(initDataEntryMaps, librariesDataEntry)
    .then(() => {
      console.log("Google Maps API loaded and initialized for DataEntry page");
      if (sessionId) {
        if (source === "SessionsOverview") {
          headerSubtitleElement.textContent =
            "Modification d'une session de conduite";
        }
        editSession(parseInt(sessionId, 10));
      } else {
        const sessionForm = document.getElementById("sessionForm");

        if (sessionForm) {
          sessionForm.reset();
        }
      }
    })

    .catch((error) => {
      console.error(error);
    });
});
