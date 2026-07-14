function onLoad() {
  const CLASSES = {
    motorStop: "btn--stop",
    motorStart: "btn--start",
    chargeReady: "btn--ready",
    chargeCharging: "btn--charging",
    motorStatusRunning: "card__status--running",
    motorStatusStopped: "card__status--stopped",
    motorStatusCharging: "card__status--charging",
    circleRunning: "circle--running",
    circleStopped: "circle--stopped",
    circleCharging: "circle--charging",
  };

  const MESSAGES = {
    batteryDepleted: "The battery is fully depleted.",
    batteryFull: "The battery is fully charged.",
    motorStopped: "Motor is stopped. You can start motor or charge.",
    motorRunning: "Motor is running. Stop motor before charging.",
    btnStartMotor: "Start motor",
    btnStopMotor: "Stop motor",
    btnCharge: "Charge",
    btnStopCharging: "Stop charging",
    chargingStatus: (charge) => `Charging... battery at ${charge}%`,
    motorStatusRunning: "Running",
    motorStatusStopped: "Stopped",
    motorStatusCharging: "Charging",
  };

  const controlButton = document.querySelector(".js-motor-btn");
  const chargeButton = document.querySelector(".js-charge-btn");
  const buttonStateText = document.querySelector(".control-panel__state-text");
  const batteryChargePercentage = document.querySelector(".card__battery");
  const motorStatus = document.querySelector(".card__status");
  const motorStatusText = document.querySelector(".card__status-text");
  const motorStatusCircle = document.querySelector(".circle");
  const motorSpeed = document.querySelector(".card__speed-value");
  const motorSpeedText = document.querySelector(".card__speed-text");
  const motorTemperature = document.querySelector(".card__temperature");

  let temperatureValue = 20;
  let temperatureClimbingInterval = null;
  let temperatureFallingInterval = null;
  let motorSpeedValue = 1000;
  let motorSpeedControlInterval = null;
  let batteryCharge = 99;
  let batteryControl = null;

  batteryChargePercentage.textContent = `${batteryCharge}%`;
  motorTemperature.textContent = `${temperatureValue}`;
  motorSpeed.textContent = `━`;

  function motorTemperatureControl(motorOn) {
    if (motorOn) {
      clearInterval(temperatureFallingInterval);
      temperatureClimbingInterval = setInterval(() => {
        if (temperatureValue >= 80) {
          temperatureValue = 80;
          motorTemperature.textContent = `${temperatureValue}`;
        }
        motorTemperature.textContent = `${temperatureValue}`;
        temperatureValue += Math.floor(Math.random() * 5) + 1;
      }, 4500);
    } else if (!motorOn) {
      clearInterval(temperatureClimbingInterval);
      temperatureFallingInterval = setInterval(() => {
        temperatureValue -= Math.floor(Math.random() * 10) + 1;
        if (temperatureValue <= 20) {
          temperatureValue = 20;
          motorTemperature.textContent = `${temperatureValue}`;
          clearInterval(temperatureFallingInterval);
        }
        motorTemperature.textContent = `${temperatureValue}`;
      }, 2500);
    }
  }

  function motorSpeedControl(motorOn) {
    if (motorOn) {
      motorSpeed.textContent = `${motorSpeedValue}`;
      motorSpeedText.style.display = "inline";
      motorSpeedControlInterval = setInterval(() => {
        if (motorSpeedValue >= 1200) {
          motorSpeedValue = 1200;
          motorSpeed.textContent = `${motorSpeedValue}`;
          motorSpeedText.style.display = "inline";
          motorSpeedValue -= Math.floor(Math.random() * 50) + 1;
        } else if (motorSpeedValue <= 1000) {
          motorSpeedValue = 1000;
          motorSpeed.textContent = `${motorSpeedValue}`;
          motorSpeedText.style.display = "inline";
          motorSpeedValue += Math.floor(Math.random() * 50) + 1;
        }
        motorSpeed.textContent = `${motorSpeedValue}`;
        motorSpeedText.style.display = "inline";
        let temp = Math.floor(Math.random() * 50) + 1;
        if (temp <= 20) {
          motorSpeedValue -= Math.floor(Math.random() * 80) + 1;
        } else if (temp > 20) {
          motorSpeedValue += Math.floor(Math.random() * 80) + 1;
        }
      }, 3000);
    } else if (!motorOn) {
      clearInterval(motorSpeedControlInterval);
      motorSpeed.textContent = `━`;
      motorSpeedText.style.display = "none";
      motorSpeedValue = 1000;
    }
  }

  function batteryLevelControl(level, time) {
    batteryControl = setInterval(() => {
      batteryCharge += level;
      if (batteryCharge <= 0) {
        batteryCharge = 0;
        batteryChargePercentage.textContent = `${batteryCharge}%`;
        buttonStateText.textContent = MESSAGES.batteryDepleted;
        clearInterval(batteryControl);
      } else if (batteryCharge >= 100) {
        batteryCharge = 100;
        batteryChargePercentage.textContent = `${batteryCharge.toFixed(0)}%`;
        buttonStateText.textContent = MESSAGES.batteryFull;
        clearInterval(batteryControl);
      } else {
        batteryChargePercentage.textContent = `${batteryCharge.toFixed(1)}%`;
        if (level > 0) {
          buttonStateText.textContent = MESSAGES.chargingStatus(batteryCharge.toFixed(1));
        }
      }
    }, time);
  }

  function updateMotorStatus() {
    if (!motorStatus) {
      console.warn("The motor status card has not been found.");
      return;
    } else if (!motorStatusCircle) {
      console.warn("The status circle has not been found.");
      return;
    }
    if (motorStatus.classList.contains(CLASSES.motorStatusStopped) && motorStatusCircle.classList.contains(CLASSES.circleStopped)) {
      motorStatusCircle.classList.replace(CLASSES.circleStopped, CLASSES.circleRunning);
      motorStatus.classList.replace(CLASSES.motorStatusStopped, CLASSES.motorStatusRunning);
      motorStatusText.textContent = MESSAGES.motorStatusRunning;
    } else if (motorStatus.classList.contains(CLASSES.motorStatusRunning) && motorStatusCircle.classList.contains(CLASSES.circleRunning)) {
      motorStatusCircle.classList.replace(CLASSES.circleRunning, CLASSES.circleStopped);
      motorStatus.classList.replace(CLASSES.motorStatusRunning, CLASSES.motorStatusStopped);
      motorStatusText.textContent = MESSAGES.motorStatusStopped;
    } else {
      motorStatus.classList.add(CLASSES.motorStatusStopped);
      motorStatusCircle.classList.add(CLASSES.circleStopped);
    }
  }

  function updateChargeStatus() {
    if (!motorStatus) {
      console.warn("The motor status card has not been found.");
      return;
    } else if (!motorStatusCircle) {
      console.warn("The status circle has not been found.");
      return;
    }
    if (motorStatus.classList.contains(CLASSES.motorStatusStopped) && motorStatusCircle.classList.contains(CLASSES.circleStopped)) {
      motorStatusCircle.classList.replace(CLASSES.circleStopped, CLASSES.circleCharging);
      motorStatus.classList.replace(CLASSES.motorStatusStopped, CLASSES.motorStatusCharging);
      motorStatusText.textContent = MESSAGES.motorStatusCharging;
    } else if (
      motorStatus.classList.contains(CLASSES.motorStatusCharging) &&
      motorStatusCircle.classList.contains(CLASSES.circleCharging)
    ) {
      motorStatusCircle.classList.replace(CLASSES.circleCharging, CLASSES.circleStopped);
      motorStatus.classList.replace(CLASSES.motorStatusCharging, CLASSES.motorStatusStopped);
      motorStatusText.textContent = MESSAGES.motorStatusStopped;
    } else {
      motorStatus.classList.add(CLASSES.motorStatusStopped);
      motorStatusCircle.classList.add(CLASSES.circleStopped);
    }
  }

  function toggleMotorButtonState() {
    if (!controlButton) {
      console.warn("The control button has not been found.");
      return;
    }

    if (controlButton.classList.contains(CLASSES.motorStop)) {
      controlButton.classList.replace(CLASSES.motorStop, CLASSES.motorStart);
      updateMotorStatus();
      motorSpeedControl(false);
      motorTemperatureControl(false);
      controlButton.textContent = MESSAGES.btnStartMotor;
      clearInterval(batteryControl);
      buttonStateText.textContent = MESSAGES.motorStopped;
      chargeButton.disabled = false;
    } else if (controlButton.classList.contains(CLASSES.motorStart)) {
      controlButton.classList.replace(CLASSES.motorStart, CLASSES.motorStop);
      updateMotorStatus();
      motorSpeedControl(true);
      motorTemperatureControl(true);
      controlButton.textContent = MESSAGES.btnStopMotor;
      batteryLevelControl(-1, 10000);
      buttonStateText.textContent = MESSAGES.motorRunning;
      chargeButton.disabled = true;
    } else {
      controlButton.classList.add(CLASSES.motorStop);
    }
  }

  function toggleChargeButtonState() {
    if (!chargeButton) {
      console.warn("The charge button has not been found.");
      return;
    }
    if (chargeButton.classList.contains(CLASSES.chargeReady)) {
      controlButton.disabled = true;
      buttonStateText.textContent = MESSAGES.chargingStatus(batteryCharge.toFixed(1));
      updateChargeStatus();
      chargeButton.textContent = MESSAGES.btnStopCharging;
      chargeButton.classList.replace(CLASSES.chargeReady, CLASSES.chargeCharging);
      batteryLevelControl(+0.1, 1000);
    } else if (chargeButton.classList.contains(CLASSES.chargeCharging)) {
      controlButton.disabled = false;
      chargeButton.textContent = MESSAGES.btnCharge;
      updateChargeStatus();
      chargeButton.classList.replace(CLASSES.chargeCharging, CLASSES.chargeReady);
      clearInterval(batteryControl);
      buttonStateText.textContent = MESSAGES.motorStopped;
    } else {
      chargeButton.classList.add(CLASSES.chargeReady);
    }
  }

  controlButton.addEventListener("click", toggleMotorButtonState);
  chargeButton.addEventListener("click", toggleChargeButtonState);

  toggleMotorButtonState();
}

window.addEventListener("load", onLoad);
