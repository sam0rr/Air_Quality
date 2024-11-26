document.addEventListener("DOMContentLoaded", function () {
    function predictAirQuality(temperature, humidity, gasResistance) {
        if (humidity > 70 && gasResistance < 10000) {
            return "Air quality is likely to decline due to high humidity and low gas resistance.";
        } else if (humidity < 50 && gasResistance > 15000) {
            return "Air quality is likely to improve with low humidity and high gas resistance.";
        } else {
            return "Air quality is expected to remain stable.";
        }
    }

    function calculateDewPoint(temperature, humidity) {
        return (temperature - ((100 - humidity) / 5)).toFixed(2);
    }

    function calculateHeatIndex(temperature, humidity) {
        return (
            -8.784 +
            1.611 * temperature +
            2.338 * humidity -
            0.146 * temperature * humidity
        ).toFixed(2);
    }

    function calculateComfortLevel(temperature, humidity, gasResistance) {
        if (
            temperature >= 22 &&
            temperature <= 26 &&
            humidity >= 40 &&
            humidity <= 60 &&
            gasResistance > 15000
        ) {
            return "Very Comfortable";
        } else if (
            temperature < 22 ||
            temperature > 26 ||
            humidity < 30 ||
            humidity > 70
        ) {
            return "Uncomfortable";
        } else {
            return "Moderately Comfortable";
        }
    }

    function getParsedValue(elementId, unit) {
        const element = document.getElementById(elementId);
        if (!element) return NaN;
        return parseFloat(element.textContent.replace(unit, "").trim());
    }

    function fetchSensorData() {
        const temperature = getParsedValue("temperature", "°C");
        const humidity = getParsedValue("humidity", "%");
        const gasResistance = getParsedValue("gasResistance", "Ω");

        return { temperature, humidity, gasResistance };
    }

    function updatePrediction() {
        const { temperature, humidity, gasResistance } = fetchSensorData();

        if (!isNaN(temperature) && !isNaN(humidity) && !isNaN(gasResistance)) {
            const airQuality = predictAirQuality(temperature, humidity, gasResistance);
            const dewPoint = calculateDewPoint(temperature, humidity);
            const heatIndex = calculateHeatIndex(temperature, humidity);
            const comfortLevel = calculateComfortLevel(temperature, humidity, gasResistance);

            updateTextContent("prediction", airQuality);
            updateTextContent("dewPoint", `${dewPoint} °C`);
            updateTextContent("heatIndex", `${heatIndex} °C`);
            updateTextContent("comfortLevel", comfortLevel);

            console.log("Updated Predictions:", { airQuality, dewPoint, heatIndex, comfortLevel });
        } else {
            updateTextContent("prediction", "Prediction unavailable.");
            updateTextContent("dewPoint", "-- °C");
            updateTextContent("heatIndex", "-- °C");
            updateTextContent("comfortLevel", "Unavailable");
        }
    }

    function updateTextContent(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element && element.textContent !== newValue) {
            element.textContent = newValue; // Update only if the value has changed
        }
    }

    // Listen for connection status changes
    function setupNetworkListener() {
        window.addEventListener("online", () => {
            console.log("Connection restored. Updating predictions...");
            updatePrediction(); // Trigger an immediate update when connection is restored
        });

        window.addEventListener("offline", () => {
            console.log("Connection lost. Waiting for reconnection...");
        });
    }

    setInterval(updatePrediction, 10000);

    const carouselElement = document.querySelector("#predictionCarousel");
    const bootstrapCarousel = new bootstrap.Carousel(carouselElement, {
        interval: 5000,
    });

    setupNetworkListener();
    updatePrediction();
});
