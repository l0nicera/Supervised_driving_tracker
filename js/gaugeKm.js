import { initializeSessionData } from "./sessionManager.js";

let progressChartInstance = null;

export function initGauge() {
  const storedSessions = initializeSessionData();
  const totalDistance = storedSessions.reduce((sum, session) => {
    const distance = parseInt(session.travelDistance, 10);
    if (!Number.isNaN(distance)) {
      return sum + distance;
    }
    return sum;
  }, 0);
  const totalDistanceCovered = document.getElementById("totalDistanceCovered");
  totalDistanceCovered.textContent = `${totalDistance} / 3000 km`;

  if (storedSessions) {
    // Calculer la différence avec 3000 km
    let difference = 3000 - totalDistance;

    // Affecte la valeur de difference dans une nouvelle variable
    let decompte = difference;
    if (difference <= 0) {
      // Empêche la distance parcourue d'être négative
      decompte = 0;
    }

    if (progressChartInstance) {
      progressChartInstance.destroy();
    }

    // Créer le demi-donut avec Chart.js
    let ctx = document.getElementById("progressChart").getContext("2d");
    progressChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [totalDistance, decompte],
            backgroundColor: ["#36A2EB", "#fcf6bd"],
            borderWidth: 0,
            circumference: 270,
            rotation: -135,
            cutout: "80%",
          },
        ],
      },
      options: {
        layout: { padding: 0, margin: 0 },
        events: [],
      },
    });
  }
}
