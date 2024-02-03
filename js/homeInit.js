import { setupHomeHandlers } from "./eventHandlers.js";
import { loadGoogleMapsApi, initHomeMaps } from "./locationServices.js";
import { initializeSessionData } from "./sessionManager.js";
import { initGauge } from "./gaugeKm.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeSessionData();
  const librariesHome = ["geometry"];
  loadGoogleMapsApi(initHomeMaps, librariesHome)
    .then(() => {
      console.log("Google Maps API loaded for the home page");
    })
    .catch((error) => {
      console.error(error);
    });

  setupHomeHandlers();
  initGauge();
});
