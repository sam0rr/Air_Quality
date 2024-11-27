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

    function isHeatIndexApplicable(temperature) {
        return temperature >= 18;
    }

    function calculateBaseHeatIndex(temperature, humidity) {
        const c1 = -42.379,
            c2 = 2.04901523,
            c3 = 10.14333127,
            c4 = -0.22475541,
            c5 = -0.00683783,
            c6 = -0.05481717,
            c7 = 0.00122874,
            c8 = 0.00085282,
            c9 = -0.00000199;

        return (
            c1 +
            c2 * temperature +
            c3 * humidity +
            c4 * temperature * humidity +
            c5 * temperature * temperature +
            c6 * humidity * humidity +
            c7 * temperature * temperature * humidity +
            c8 * temperature * humidity * humidity +
            c9 * temperature * temperature * humidity * humidity
        );
    }

    function applyLowHumidityAdjustment(heatIndex, temperature, humidity) {
        if (humidity < 13 && temperature >= 27 && temperature <= 43) {
            heatIndex -= ((13 - humidity) / 4) * Math.sqrt((17 - Math.abs(temperature - 27)) / 17);
        }
        return heatIndex;
    }

    function applyHighHumidityAdjustment(heatIndex, temperature, humidity) {
        if (humidity > 85 && temperature >= 27 && temperature <= 35) {
            heatIndex += ((humidity - 85) / 10) * ((35 - temperature) / 5);
        }
        return heatIndex;
    }

    function calculateHeatIndex(temperature, humidity) {
        if (!isHeatIndexApplicable(temperature)) return temperature.toFixed(2);

        let heatIndex = calculateBaseHeatIndex(temperature, humidity);
        heatIndex = applyLowHumidityAdjustment(heatIndex, temperature, humidity);
        heatIndex = applyHighHumidityAdjustment(heatIndex, temperature, humidity);

        return heatIndex.toFixed(2);
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
