import { setupSessionsOvwHandlers } from "./eventHandlers.js";
import { loadGoogleMapsApi, initSessionsOvwMaps } from "./locationServices.js";
import { initializeSessionData } from "./sessionManager.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeSessionData();

  const librariesDataEntry = ["places", "geometry"];
  loadGoogleMapsApi(initSessionsOvwMaps, librariesDataEntry)
    .then(() => {
      console.log("Google Maps API loaded and initialized for DataEntry page");
    })
    .catch((error) => {
      console.error(error);
    });

  setupSessionsOvwHandlers();
});
