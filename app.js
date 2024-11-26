document.addEventListener("DOMContentLoaded", async function () {
    let bluetoothDevice = null;
    let gattServer = null;
    let dataCharacteristic = null;

    const SERVICE_UUID = "00001234-0000-1000-8000-00805f9b34fb";
    const CHARACTERISTIC_UUID = "00005678-0000-1000-8000-00805f9b34fb";

    async function connectBluetooth() {
        try {
            if (bluetoothDevice && bluetoothDevice.gatt.connected) {
                alert("Already connected to ESP32.");
                return;
            }
            bluetoothDevice = await requestBluetoothDevice();
            await setupBluetoothConnection();
            fetchCurrentStats();
        } catch (error) {
            handleConnectionError(error);
        }
    }

    async function requestBluetoothDevice() {
        return navigator.bluetooth.requestDevice({
            filters: [{ name: "ESP32_AirQuality" }],
            optionalServices: [SERVICE_UUID],
        });
    }

    async function setupBluetoothConnection() {
        gattServer = await bluetoothDevice.gatt.connect();
        const service = await gattServer.getPrimaryService(SERVICE_UUID);
        dataCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
        bluetoothDevice.addEventListener("gattserverdisconnected", handleDisconnect);
        console.log("Bluetooth connected successfully.");
        alert("Connected to ESP32 via Bluetooth.");
    }

    async function fetchCurrentStats() {
        if (!dataCharacteristic) {
            console.warn("No active Bluetooth connection. Skipping fetch.");
            return;
        }

        try {
            const stats = await readStats();
            displayStats(stats);
        } catch (error) {
            console.error("Failed to fetch current stats:", error);
        }
    }

    async function readStats() {
        const decoder = new TextDecoder();
        const value = await dataCharacteristic.readValue();
        return JSON.parse(decoder.decode(value));
    }

    function displayStats(stats) {
        const vocLevel = calculateVOCLevel(stats.gas_resistance);

        document.getElementById("temperature").textContent = `${stats.temperature} °C`;
        document.getElementById("humidity").textContent = `${stats.humidity} %`;
        document.getElementById("pressure").textContent = `${stats.pressure} hPa`;
        document.getElementById("gasResistance").textContent = `${stats.gas_resistance} Ω`;
        document.getElementById("vocLevel").textContent = vocLevel;

        console.log("Current stats fetched:", stats);
    }

    function calculateVOCLevel(gasResistance) {
        if (gasResistance > 20000) return "Excellent";
        if (gasResistance > 15000) return "Good";
        if (gasResistance > 10000) return "Moderate";
        if (gasResistance > 5000) return "Poor";
        return "Very Poor";
    }

    function handleDisconnect() {
        console.warn("Bluetooth device disconnected.");
        alert("Bluetooth device disconnected. Reconnecting...");
        resetBluetoothState();
        setTimeout(() => connectBluetooth(), 5000);
    }

    function handleConnectionError(error) {
        if (bluetoothDevice && bluetoothDevice.gatt.connected) {
            alert("Already connected to ESP32.");
        } else {
            console.error("Failed to connect to Bluetooth device:", error);
            alert("Failed to connect to ESP32. Try again.");
        }
    }

    function resetBluetoothState() {
        bluetoothDevice = null;
        gattServer = null;
        dataCharacteristic = null;
    }

    document.getElementById("connectBluetoothButton").addEventListener("click", connectBluetooth);

    setInterval(() => {
        if (dataCharacteristic) {
            fetchCurrentStats();
        } else {
            console.log("No connection. Skipping periodic fetch.");
        }
    }, 10000);
});
