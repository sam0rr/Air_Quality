document.addEventListener("DOMContentLoaded", function () {
    function predictAirQuality(temperature, humidity, gasResistance) {
        if (humidity > 70 && gasResistance < 10000) {
            return "Air quality is likely to decline.";
        } else if (humidity < 50 && gasResistance > 15000) {
            return "Air quality is likely to improve.";
        } else {
            return "Air quality is expected to remain stable.";
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

    function isConnectionAvailable() {
        return document.getElementById("temperature").textContent !== "-- °C";
    }

    function updatePrediction() {
        if (!isConnectionAvailable()) {
            console.warn("No connection available. Skipping prediction update.");
            document.getElementById("prediction").textContent = "Prediction unavailable.";
            return;
        }

        const { temperature, humidity, gasResistance } = fetchSensorData();

        if (!isNaN(temperature) && !isNaN(humidity) && !isNaN(gasResistance)) {
            const prediction = predictAirQuality(temperature, humidity, gasResistance);
            displayPrediction(prediction);
        } else {
            handleInvalidData();
        }
    }

    function displayPrediction(prediction) {
        document.getElementById("prediction").textContent = prediction;
        console.log("Prediction updated:", prediction);
    }

    function handleInvalidData() {
        console.warn("Incomplete or invalid data for prediction.");
        document.getElementById("prediction").textContent = "Prediction unavailable.";
    }

    setInterval(updatePrediction, 10000);
});
