function onLoad() {
  const CLASSES = {
    motorStop: "btn--stop",
    motorStart: "btn--start",
    chargeReady: "btn--ready",
    chargeCharging: "btn--charging",
    motorStatusRunning: "card__status--running",
    motorStatusStopped: "card__status--stopped",
    motorStatusCharging: "card__status--charging",
    motorStatusDanger: "card__status--warning",
    circleRunning: "circle--running",
    circleStopped: "circle--stopped",
    circleCharging: "circle--charging",
    circleDanger: "circle--warning",
    bannerStatusWarning: "banner--warning",
    bannerStatusDanger: "banner--danger",
    bannerTextWarning: "banner__text--warning",
    bannerTextDanger: "banner__text--danger",
    cardBatteryFull: "card__battery--charged",
    cardBatteryMid: "card__battery--mid",
    cardBatteryLow: "card__battery--low",
    progressBarFull: "bar__fill--charged",
    progressBarMid: "bar__fill--mid",
    progressBarLow: "bar__fill--low",
  };

  const MESSAGES = {
    batteryDepleted: "Battery depleted! Charge to continue.",
    batteryFull: "The battery is fully charged. You can start motor at any time.",
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
    motorStatusDepleted: "Depleted",
    bannerTextWarning: (charge) => `Low battery ━ ${charge}% remaining`,
    bannerTextDanger: "Battery depleted ━ motor shut down automatically",
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
  const batteryChargeBanner = document.querySelector(".banner");
  const batteryBannerText = document.querySelector(".banner__text");
  const bannerTextValue = document.querySelector(".banner__text--value");
  const progressBarFill = document.querySelector(".bar__fill");

  let temperatureValue = 20;
  let temperatureControlInterval = null;
  let motorSpeedValue = 1000;
  let motorSpeedControlInterval = null;
  let batteryCharge = 55.0;
  let batteryControl = null;

  batteryChargePercentage.textContent = `${batteryCharge.toFixed(1)}%`;
  motorTemperature.textContent = `${temperatureValue}`;
  motorSpeed.textContent = `━`;

  function batteryCardColorControl() {
    if (!batteryChargePercentage) {
      console.warn("The battery card has not been found.");
      return;
    }
    if (batteryCharge > 50) {
      if (batteryChargePercentage.classList.contains(CLASSES.cardBatteryMid)) {
        batteryChargePercentage.classList.replace(CLASSES.cardBatteryMid, CLASSES.cardBatteryFull);
        progressBarFill.classList.replace(CLASSES.progressBarMid, CLASSES.progressBarFull);
      } else {
        batteryChargePercentage.classList.add(CLASSES.cardBatteryFull);
        progressBarFill.classList.add(CLASSES.progressBarFull);
      }
    } else if (batteryCharge > 20 && batteryCharge <= 50) {
      if (batteryChargePercentage.classList.contains(CLASSES.cardBatteryLow)) {
        batteryChargePercentage.classList.replace(CLASSES.cardBatteryLow, CLASSES.cardBatteryMid);
        progressBarFill.classList.replace(CLASSES.progressBarLow, CLASSES.progressBarMid);
      } else if (batteryChargePercentage.classList.contains(CLASSES.cardBatteryFull)) {
        batteryChargePercentage.classList.replace(CLASSES.cardBatteryFull, CLASSES.cardBatteryMid);
        progressBarFill.classList.replace(CLASSES.progressBarFull, CLASSES.progressBarMid);
      } else {
        batteryChargePercentage.classList.add(CLASSES.cardBatteryMid);
        progressBarFill.classList.add(CLASSES.progressBarMid);
      }
    } else {
      if (batteryChargePercentage.classList.contains(CLASSES.cardBatteryMid)) {
        batteryChargePercentage.classList.replace(CLASSES.cardBatteryMid, CLASSES.cardBatteryLow);
        progressBarFill.classList.replace(CLASSES.progressBarMid, CLASSES.progressBarLow);
      } else {
        batteryChargePercentage.classList.add(CLASSES.cardBatteryLow);
        progressBarFill.classList.add(CLASSES.progressBarLow);
      }
    }
  }

  function bannerControl() {
    if (!batteryChargeBanner) {
      console.warn("The battery banner has not been found.");
      return;
    }
    if (batteryCharge > 15) {
      batteryChargeBanner.style.display = "none";
    } else if (batteryCharge <= 15 && batteryCharge != 0) {
      batteryChargeBanner.style.display = "block";
      batteryBannerText.textContent = MESSAGES.bannerTextWarning(batteryCharge.toFixed(1));
      if (batteryChargeBanner.classList.contains(CLASSES.bannerStatusDanger)) {
        batteryChargeBanner.classList.replace(CLASSES.bannerStatusDanger, CLASSES.bannerStatusWarning);
        batteryBannerText.classList.replace(CLASSES.bannerTextDanger, CLASSES.bannerTextWarning);
      } else {
        batteryChargeBanner.classList.add(CLASSES.bannerStatusWarning);
        batteryBannerText.classList.add(CLASSES.bannerTextWarning);
      }
    } else if (batteryCharge === 0) {
      batteryChargeBanner.style.display = "block";
      batteryBannerText.textContent = MESSAGES.bannerTextDanger;
      if (batteryChargeBanner.classList.contains(CLASSES.bannerStatusWarning)) {
        batteryChargeBanner.classList.replace(CLASSES.bannerStatusWarning, CLASSES.bannerStatusDanger);
        batteryBannerText.classList.replace(CLASSES.bannerTextWarning, CLASSES.bannerTextDanger);
      } else {
        batteryChargeBanner.classList.add(CLASSES.bannerStatusDanger);
        batteryBannerText.classList.add(CLASSES.bannerTextDanger);
      }
    }
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function motorTemperatureControl(motorOn) {
    clearInterval(temperatureControlInterval);
    const MIN_TEMP = 20;
    const MAX_TEMP = 80;
    if (!motorOn) {
      temperatureControlInterval = setInterval(() => {
        if (temperatureValue <= MIN_TEMP) {
          temperatureValue = MIN_TEMP;
          motorTemperature.textContent = `${temperatureValue}`;
          return;
        }
        motorTemperature.textContent = `${temperatureValue}`;
        temperatureValue -= randomInt(1, 10);
      }, 2500);
    } else {
      temperatureControlInterval = setInterval(() => {
        if (temperatureValue >= MAX_TEMP) {
          temperatureValue = MAX_TEMP;
          motorTemperature.textContent = `${temperatureValue}`;
          clearInterval(temperatureControlInterval);
          toggleMotorButtonState();
          return;
        }
        temperatureValue += randomInt(1, 5);
        motorTemperature.textContent = `${temperatureValue}`;
      }, 5000);
    }
  }

  function motorSpeedControl(motorOn) {
    clearInterval(motorSpeedControlInterval);
    if (!motorOn) {
      motorSpeed.textContent = `━`;
      motorSpeedText.style.display = "none";
      motorSpeedValue = 1000;
      return;
    }
    const MIN_SPEED = 1000;
    const MAX_SPEED = 1200;
    motorSpeed.textContent = `${motorSpeedValue}`;
    motorSpeedText.style.display = "inline";
    motorSpeedControlInterval = setInterval(() => {
      motorSpeed.textContent = `${motorSpeedValue}`;
      motorSpeedText.style.display = "inline";
      const step = randomInt(1, 80);
      const goingDown = Math.random() < 0.4;
      motorSpeedValue += goingDown ? -step : step;
      if (motorSpeedValue > MAX_SPEED) motorSpeedValue = MAX_SPEED;
      if (motorSpeedValue < MIN_SPEED) motorSpeedValue = MIN_SPEED;
      motorSpeed.textContent = motorSpeedValue;
    }, 3000);
  }

  function batteryLevelControl(level, time) {
    bannerControl();
    batteryControl = setInterval(() => {
      batteryCharge += level;
      batteryCardColorControl();
      if (batteryCharge <= 0) {
        batteryCharge = 0;
        batteryChargePercentage.textContent = `${batteryCharge}%`;
        progressBarFill.style.width = `${batteryCharge}%`;
        toggleMotorButtonState();
        controlButton.disabled = true;
        bannerControl();
        clearInterval(batteryControl);
      } else if (batteryCharge >= 100) {
        batteryCharge = 100;
        batteryChargePercentage.textContent = `${batteryCharge.toFixed(0)}%`;
        progressBarFill.style.width = `${batteryCharge}%`;
        toggleChargeButtonState();
        chargeButton.disabled = true;
        buttonStateText.textContent = MESSAGES.batteryFull;
        clearInterval(batteryControl);
      } else {
        batteryChargePercentage.textContent = `${batteryCharge.toFixed(1)}%`;
        progressBarFill.style.width = `${batteryCharge}%`;
        bannerControl();
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
    } else if (motorStatus.classList.contains(CLASSES.motorStatusDanger) && motorStatusCircle.classList.contains(CLASSES.circleDanger)) {
      motorStatusCircle.classList.replace(CLASSES.circleDanger, CLASSES.circleRunning);
      motorStatus.classList.replace(CLASSES.motorStatusDanger, CLASSES.motorStatusRunning);
      motorStatusText.textContent = MESSAGES.motorStatusDepleted;
    } else if (motorStatus.classList.contains(CLASSES.motorStatusRunning) && motorStatusCircle.classList.contains(CLASSES.circleRunning)) {
      if (batteryCharge === 0) {
        motorStatusCircle.classList.replace(CLASSES.circleRunning, CLASSES.circleDanger);
        motorStatus.classList.replace(CLASSES.motorStatusRunning, CLASSES.motorStatusDanger);
        motorStatusText.textContent = MESSAGES.motorStatusDepleted;
      } else {
        motorStatusCircle.classList.replace(CLASSES.circleRunning, CLASSES.circleStopped);
        motorStatus.classList.replace(CLASSES.motorStatusRunning, CLASSES.motorStatusStopped);
        motorStatusText.textContent = MESSAGES.motorStatusStopped;
      }
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
    } else if (motorStatus.classList.contains(CLASSES.motorStatusDanger) && motorStatusCircle.classList.contains(CLASSES.circleDanger)) {
      motorStatusCircle.classList.replace(CLASSES.circleDanger, CLASSES.circleCharging);
      motorStatus.classList.replace(CLASSES.motorStatusDanger, CLASSES.motorStatusCharging);
      motorStatusText.textContent = MESSAGES.motorStatusCharging;
    } else if (
      motorStatus.classList.contains(CLASSES.motorStatusCharging) &&
      motorStatusCircle.classList.contains(CLASSES.circleCharging)
    ) {
      if (batteryCharge === 0) {
        motorStatusCircle.classList.replace(CLASSES.circleCharging, CLASSES.circleDanger);
        motorStatus.classList.replace(CLASSES.motorStatusCharging, CLASSES.motorStatusDanger);
        motorStatusText.textContent = MESSAGES.motorStatusDepleted;
      } else {
        motorStatusCircle.classList.replace(CLASSES.circleCharging, CLASSES.circleStopped);
        motorStatus.classList.replace(CLASSES.motorStatusCharging, CLASSES.motorStatusStopped);
        motorStatusText.textContent = MESSAGES.motorStatusStopped;
      }
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
      motorSpeedControl(false);
      motorTemperatureControl(false);
      controlButton.textContent = MESSAGES.btnStartMotor;
      clearInterval(batteryControl);
      if (batteryCharge === 100) {
        buttonStateText.textContent = MESSAGES.batteryFull;
        chargeButton.disabled = true;
      } else if (batteryCharge === 0) {
        buttonStateText.textContent = MESSAGES.batteryDepleted;
        controlButton.disabled = true;
        chargeButton.disabled = false;
      } else {
        buttonStateText.textContent = MESSAGES.motorStopped;
        chargeButton.disabled = false;
      }
      updateMotorStatus();
    } else if (controlButton.classList.contains(CLASSES.motorStart)) {
      controlButton.classList.replace(CLASSES.motorStart, CLASSES.motorStop);
      updateMotorStatus();
      motorSpeedControl(true);
      motorTemperatureControl(true);
      controlButton.textContent = MESSAGES.btnStopMotor;
      batteryLevelControl(-1, 1000);

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
      batteryLevelControl(+0.1, 100);
    } else if (chargeButton.classList.contains(CLASSES.chargeCharging)) {
      chargeButton.textContent = MESSAGES.btnCharge;
      chargeButton.classList.replace(CLASSES.chargeCharging, CLASSES.chargeReady);
      clearInterval(batteryControl);
      if (batteryCharge === 0) {
        buttonStateText.textContent = MESSAGES.batteryDepleted;
        controlButton.disabled = true;
      } else {
        controlButton.disabled = false;
        buttonStateText.textContent = MESSAGES.motorStopped;
      }
      updateChargeStatus();
    } else {
      chargeButton.classList.add(CLASSES.chargeReady);
    }
  }

  controlButton.addEventListener("click", toggleMotorButtonState);
  chargeButton.addEventListener("click", toggleChargeButtonState);

  toggleMotorButtonState();
  bannerControl();
  progressBarFill.style.width = `${batteryCharge}%`;
  batteryCardColorControl();
}

window.addEventListener("load", onLoad);
