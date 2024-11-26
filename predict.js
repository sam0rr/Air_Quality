document.addEventListener("DOMContentLoaded", function () {
    function predictAirQuality(temperature, humidity, gasResistance) {
        if (humidity > 70 && gasResistance < 10000) {
            return "Air quality is likely to decline due to high humidity and low gas resistance.";
        }
        if (humidity < 50 && gasResistance > 15000) {
            return "Air quality is likely to improve with low humidity and high gas resistance.";
        }
        return "Air quality is expected to remain stable.";
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
        }
        if (
            temperature < 22 ||
            temperature > 26 ||
            humidity < 30 ||
            humidity > 70
        ) {
            return "Uncomfortable";
        }
        return "Moderately Comfortable";
    }

    function getParsedValue(elementId, unit) {
        const element = document.getElementById(elementId);
        if (!element) return NaN;
        return parseFloat(element.textContent.replace(unit, "").trim());
    }

    function fetchSensorData() {
        return {
            temperature: getParsedValue("temperature", "°C"),
            humidity: getParsedValue("humidity", "%"),
            gasResistance: getParsedValue("gasResistance", "Ω"),
        };
    }

    function updateTextContent(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element && element.textContent !== newValue) {
            element.textContent = newValue;
        }
    }

    function updatePrediction() {
        const { temperature, humidity, gasResistance } = fetchSensorData();
        if (!isNaN(temperature) && !isNaN(humidity) && !isNaN(gasResistance)) {
            const predictions = {
                airQuality: predictAirQuality(temperature, humidity, gasResistance),
                dewPoint: `${calculateDewPoint(temperature, humidity)} °C`,
                heatIndex: `${calculateHeatIndex(temperature, humidity)} °C`,
                comfortLevel: calculateComfortLevel(temperature, humidity, gasResistance),
            };
            applyPredictions(predictions);
        } else {
            applyPredictions({
                airQuality: "Unavailable",
                dewPoint: "Unavailable",
                heatIndex: "Unavailable",
                comfortLevel: "Unavailable",
            });
        }
    }

    function applyPredictions(predictions) {
        updateTextContent("prediction", predictions.airQuality);
        updateTextContent("dewPoint", predictions.dewPoint);
        updateTextContent("heatIndex", predictions.heatIndex);
        updateTextContent("comfortLevel", predictions.comfortLevel);
        console.log("Updated Predictions:", predictions);
    }

    function setupNetworkListener() {
        window.addEventListener("online", () => {
            console.log("Connection restored. Updating predictions...");
            updatePrediction();
        });

        window.addEventListener("offline", () => {
            console.log("Connection lost. Waiting for reconnection...");
        });
    }

    function setupCarousel() {
        const carouselElement = document.querySelector("#predictionCarousel");
        new bootstrap.Carousel(carouselElement, { interval: 5000 });
    }

    function initializeApp() {
        setupNetworkListener();
        setupCarousel();
        setInterval(updatePrediction, 10000);
        updatePrediction();
    }

    initializeApp();
});
