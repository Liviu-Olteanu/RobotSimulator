import express from "express";
import { JSONFilePreset } from "lowdb/node";

const app = express();
const PORT = process.env.PORT || 3000;
const db = await JSONFilePreset(process.env.DB_PATH || "db.json", {
  motorState: "stopped",
  oldState: null,
  isCoolingFromOverheat: false,
  batteryCharge: 70.0,
  motorSpeedValue: 0,
  temperatureValue: 20,
});

const MOTOR_STATES = {
  stopped: "stopped",
  running: "running",
  charging: "charging",
  overheated: "overheated",
  depleted: "depleted",
};

let temperatureValue = 20;
let motorSpeedValue = 0;
let batteryCharge = 70.0;
let motorState = MOTOR_STATES.stopped;
let oldState = null;
let temperatureStep = temperatureValue;
let temperatureArray = new Array(30).fill(20);
let temperatureControlInterval = null;
let motorSpeedArray = new Array(30).fill(0);
let motorSpeedControlInterval = null;
let batteryControlInterval = null;
let timeArray = [];
let isCoolingFromOverheat = false;

function initialiseValues() {
  if (!db) {
    console.log("No database has been found.");
  } else {
    oldState = db.data.oldState;
    isCoolingFromOverheat = db.data.isCoolingFromOverheat;
    temperatureValue = db.data.temperatureValue;
    motorSpeedValue = db.data.motorSpeedValue;
    batteryCharge = db.data.batteryCharge;
    motorState = db.data.motorState;
    applyState(motorState);
    if (temperatureValue > 20 && motorState !== MOTOR_STATES.running) motorTemperatureControl(false);
  }
}

function saveData() {
  setInterval(async () => {
    db.data.oldState = oldState;
    db.data.isCoolingFromOverheat = isCoolingFromOverheat;
    db.data.temperatureValue = temperatureValue;
    db.data.motorSpeedValue = motorSpeedValue;
    db.data.batteryCharge = batteryCharge;
    db.data.motorState = motorState;
    await db.write();
  }, 5000);
}

function init() {
  initialiseValues();
  fillDateArray();
  chartsDataLoop();
  saveData();
}

function chartsDataLoop() {
  setInterval(() => {
    timeArray.shift();
    let now = new Date();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    timeArray.push(String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0"));
    motorSpeedArray.shift();
    motorSpeedArray.push(motorSpeedValue);
    temperatureArray.shift();
    temperatureArray.push(temperatureValue);
  }, 1000);
}

function fillDateArray() {
  let now = new Date();

  for (let i = 0; i < 30; i++) {
    let pastTime = new Date(now.getTime() - i * 1000);

    let minutes = String(pastTime.getMinutes()).padStart(2, "0");
    let seconds = String(pastTime.getSeconds()).padStart(2, "0");

    timeArray[29 - i] = `${minutes}:${seconds}`;
  }
}

function overheatingLogic() {
  const OVERHEATING_TEMP_STOP_POINT = 40;
  if (temperatureValue <= OVERHEATING_TEMP_STOP_POINT && motorState === MOTOR_STATES.overheated) {
    isCoolingFromOverheat = false;
    applyState(MOTOR_STATES.stopped);
  } else if (temperatureValue <= OVERHEATING_TEMP_STOP_POINT && motorState === MOTOR_STATES.charging) {
    isCoolingFromOverheat = false;
  }
}

function motorTemperatureControl(isMotorRunning) {
  clearInterval(temperatureControlInterval);
  temperatureStep = temperatureValue;
  const MIN_TEMP = 20;
  const MAX_TEMP = 80;
  if (!isMotorRunning) {
    temperatureControlInterval = setInterval(() => {
      if (temperatureStep <= MIN_TEMP) {
        temperatureValue = MIN_TEMP;
        clearInterval(temperatureControlInterval);
        return;
      }
      temperatureValue = temperatureStep;
      overheatingLogic();
      temperatureStep -= randomInt(1, 10);
      if (temperatureStep < MIN_TEMP) temperatureStep = MIN_TEMP;
    }, 3000);
  } else {
    temperatureControlInterval = setInterval(() => {
      if (temperatureStep >= MAX_TEMP) {
        temperatureValue = MAX_TEMP;
        clearInterval(temperatureControlInterval);
        applyState(MOTOR_STATES.overheated);
        return;
      }
      temperatureValue = temperatureStep;
      temperatureStep += randomInt(1, 5);
    }, 5000);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function motorSpeedControl(isMotorRunning) {
  clearInterval(motorSpeedControlInterval);
  if (!isMotorRunning) {
    motorSpeedValue = 0;
    return;
  }
  const MIN_SPEED = 1000;
  const MAX_SPEED = 1200;
  motorSpeedValue = MIN_SPEED;
  motorSpeedControlInterval = setInterval(() => {
    const step = randomInt(1, 80);
    const goingDown = Math.random() < 0.4;
    motorSpeedValue += goingDown ? -step : step;
    if (motorSpeedValue > MAX_SPEED) motorSpeedValue = MAX_SPEED;
    if (motorSpeedValue < MIN_SPEED) motorSpeedValue = MIN_SPEED;
  }, 3000);
}

function batteryLevelControl(changePerTick, intervalMs) {
  clearInterval(batteryControlInterval);
  batteryControlInterval = setInterval(() => {
    batteryCharge += changePerTick;
    if (batteryCharge <= 0) {
      batteryCharge = 0;
      applyState(MOTOR_STATES.depleted);
      clearInterval(batteryControlInterval);
    } else if (batteryCharge >= 100) {
      batteryCharge = 100;
      applyState(isCoolingFromOverheat ? MOTOR_STATES.overheated : MOTOR_STATES.stopped);
      clearInterval(batteryControlInterval);
    }
  }, intervalMs);
}

function applyState(newState) {
  if (!Object.values(MOTOR_STATES).includes(newState)) {
    console.error(`Invalid state: ${newState}`);
    return;
  }
  oldState = motorState;
  motorState = newState;

  // Clean up behaviors from the previous state
  if (oldState === MOTOR_STATES.running) {
    motorSpeedControl(false);
    motorTemperatureControl(false);
    clearInterval(batteryControlInterval);
  } else if (oldState === MOTOR_STATES.charging) {
    clearInterval(batteryControlInterval);
  }

  // Start behaviors for the new state
  if (motorState === MOTOR_STATES.running) {
    motorSpeedControl(true);
    motorTemperatureControl(true);
    batteryLevelControl(-1, 10000);
  } else if (motorState === MOTOR_STATES.charging) {
    batteryLevelControl(+0.1, 1000);
  } else if (motorState === MOTOR_STATES.overheated) {
    isCoolingFromOverheat = true;
  }
}

function toggleMotorButtonState() {
  if (batteryCharge === 0) {
    applyState(MOTOR_STATES.depleted);
  } else if (motorState === MOTOR_STATES.running) {
    applyState(MOTOR_STATES.stopped);
  } else if (motorState === MOTOR_STATES.stopped) {
    applyState(MOTOR_STATES.running);
  } else {
    console.warn("No valid motor states found while toggling motor");
  }
}

function toggleChargeButtonState() {
  if (motorState === MOTOR_STATES.charging && isCoolingFromOverheat) {
    applyState(MOTOR_STATES.overheated);
  } else if (
    motorState === MOTOR_STATES.stopped ||
    motorState === MOTOR_STATES.overheated ||
    motorState === MOTOR_STATES.depleted
  ) {
    applyState(MOTOR_STATES.charging);
  } else if (batteryCharge <= 0 && motorState === MOTOR_STATES.charging) {
    applyState(MOTOR_STATES.depleted);
  } else if (motorState === MOTOR_STATES.charging) {
    applyState(MOTOR_STATES.stopped);
  } else {
    console.warn("No valid motor states found while toggling charge");
  }
}

app.use(express.static("public"));
app.use(express.json());

app.get("/api/telemetry", (req, res) => {
  res.status(200).json({
    batteryCharge: batteryCharge,
    motorState: motorState,
    temperatureValue: temperatureValue,
    motorSpeedValue: motorSpeedValue,
  });
});

app.get("/api/history", (req, res) => {
  res.status(200).json({ timeArray: timeArray, motorSpeedArray: motorSpeedArray, temperatureArray: temperatureArray });
});

app.post("/api/command", (req, res) => {
  if (!req.body || !req.body.action) {
    res.status(400).send("Bad Request");
    return;
  }
  let action = req.body.action;
  if (action === "start") {
    toggleMotorButtonState();
    res.sendStatus(200);
  } else if (action === "stop") {
    toggleMotorButtonState();
    res.sendStatus(200);
  } else if (action === "charge") {
    toggleChargeButtonState();
    res.sendStatus(200);
  } else if (action === "stop_charge") {
    toggleChargeButtonState();
    res.sendStatus(200);
  } else {
    res.status(400).send("Bad Request");
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

init();

app.listen(PORT, () => {
  console.log("Server is online.");
});
