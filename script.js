function onLoad() {
  const MOTOR_STATES = {
    stopped: "stopped",
    running: "running",
    charging: "charging",
    overheated: "overheated",
    depleted: "depleted",
  };

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
    bannerTextWarning: "banner__battery-text--warning",
    bannerTextDanger: "banner__battery-text--danger",
    cardBatteryFull: "card__battery--charged",
    cardBatteryMid: "card__battery--mid",
    cardBatteryLow: "card__battery--low",
    progressBarFull: "bar__fill--charged",
    progressBarMid: "bar__fill--mid",
    progressBarLow: "bar__fill--low",
    cardTemperatureMid: "card__temperature--mid",
    cardTemperatureHigh: "card__temperature--high",
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
    motorStatusOverheated: "Overheated",
    bannerTextWarning: (charge) => `Low battery ━ ${charge}% remaining`,
    bannerTextDanger: "Battery depleted ━ motor shut down automatically",
    motorOverheated: "Overheated! Motor locked until temp drops below 40°C. You can charge while waiting.",
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
  const batteryChargeBanner = document.querySelector(".banner__battery");
  const batteryBannerText = document.querySelector(".banner__battery-text");
  const progressBarFill = document.querySelector(".bar__fill");
  const temperatureStateBanner = document.querySelector(".banner__temperature");
  const speedChart = document.querySelector(".chart__speed");
  const temperatureChart = document.querySelector(".chart__temperature");

  const SPEED_CHART_LINE_COLOR = "#378add";
  const SPEED_CHART_COLOR_OPACITY = "15";
  const SPEED_CHART_BG_COLOR = SPEED_CHART_LINE_COLOR + SPEED_CHART_COLOR_OPACITY;
  const TEMP_CHART_LINE_COLOR = "#d85a30";
  const TEMP_CHART_COLOR_OPACITY = "15";
  const TEMP_CHART_BG_COLOR = TEMP_CHART_LINE_COLOR + TEMP_CHART_COLOR_OPACITY;
  let oldState = null;
  let motorState = MOTOR_STATES.stopped;
  let temperatureValue = 20;
  let temperatureArray = new Array(30).fill(20);
  let temperatureControlInterval = null;
  let motorSpeedValue = 0;
  let motorSpeedArray = new Array(30).fill(0);
  let motorSpeedControlInterval = null;
  let batteryCharge = 70.0;
  let batteryControlInterval = null;
  let timeArray = [];
  let isCoolingFromOverheat = false;
  let speedChartAppearance = null;
  let temperatureChartAppearance = null;

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
      speedChartAppearance.update("none");
      temperatureChartAppearance.update("none");
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

  function initCharts() {
    fillDateArray();
    speedChartAppearance = new Chart(speedChart, {
      type: "line",
      data: {
        labels: timeArray,
        datasets: [
          {
            data: motorSpeedArray,
            fill: "origin",
            backgroundColor: SPEED_CHART_BG_COLOR,
            borderColor: SPEED_CHART_LINE_COLOR,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        elements: {
          point: {
            pointStyle: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 5,
            },
          },
          y: {
            suggestedMin: 0,
            suggestedMax: 1200,
          },
        },
      },
    });

    temperatureChartAppearance = new Chart(temperatureChart, {
      type: "line",
      data: {
        labels: timeArray,
        datasets: [
          {
            data: temperatureArray,
            fill: "origin",
            backgroundColor: TEMP_CHART_BG_COLOR,
            borderColor: TEMP_CHART_LINE_COLOR,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        elements: {
          point: {
            pointStyle: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 5,
            },
          },
          y: {
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    });
    chartsDataLoop();
  }

  function batteryCardColorControl() {
    if (!batteryChargePercentage || !progressBarFill) {
      console.warn("The battery card or the progress bar filling has not been found.");
      return;
    }

    const CHARGED_THRESHOLD = 50;
    const LOW_THRESHOLD = 20;

    // className acts as a reset, removing all previous modifier classes
    batteryChargePercentage.className = "card__battery";
    progressBarFill.className = "bar__fill";
    if (batteryCharge > CHARGED_THRESHOLD) {
      batteryChargePercentage.classList.add(CLASSES.cardBatteryFull);
      progressBarFill.classList.add(CLASSES.progressBarFull);
    } else if (batteryCharge > LOW_THRESHOLD && batteryCharge <= CHARGED_THRESHOLD) {
      batteryChargePercentage.classList.add(CLASSES.cardBatteryMid);
      progressBarFill.classList.add(CLASSES.progressBarMid);
    } else {
      batteryChargePercentage.classList.add(CLASSES.cardBatteryLow);
      progressBarFill.classList.add(CLASSES.progressBarLow);
    }
  }

  function bannerControl() {
    if (!batteryChargeBanner || !batteryBannerText) {
      console.warn("The battery banner or the battery banner text has not been found.");
      return;
    }

    const LOW_BATTERY_THRESHOLD = 15;

    batteryChargeBanner.className = "banner";
    batteryChargeBanner.classList.add("banner__battery");
    batteryBannerText.className = "banner__battery-text";

    if (batteryCharge > LOW_BATTERY_THRESHOLD) {
      batteryChargeBanner.style.display = "none";
    } else if (batteryCharge <= LOW_BATTERY_THRESHOLD && batteryCharge !== 0) {
      batteryChargeBanner.style.display = "block";
      batteryBannerText.textContent = MESSAGES.bannerTextWarning(batteryCharge.toFixed(1));
      batteryChargeBanner.classList.add(CLASSES.bannerStatusWarning);
      batteryBannerText.classList.add(CLASSES.bannerTextWarning);
    } else if (batteryCharge === 0) {
      batteryChargeBanner.style.display = "block";
      batteryBannerText.textContent = MESSAGES.bannerTextDanger;
      batteryChargeBanner.classList.add(CLASSES.bannerStatusDanger);
      batteryBannerText.classList.add(CLASSES.bannerTextDanger);
    }
  }

  function temperatureColorControl() {
    const LOW_THRESHOLD = 45;
    const HIGH_THRESHOLD = 60;
    motorTemperature.className = "card__temperature";

    if (temperatureValue <= LOW_THRESHOLD) {
      return;
    }

    if (temperatureValue <= HIGH_THRESHOLD) {
      motorTemperature.classList.add(CLASSES.cardTemperatureMid);
    } else {
      motorTemperature.classList.add(CLASSES.cardTemperatureHigh);
    }
  }

  function overheatingLogic() {
    const OVERHEATING_TEMP_STOP_POINT = 40;
    if (temperatureValue <= OVERHEATING_TEMP_STOP_POINT && motorState === MOTOR_STATES.overheated) {
      isCoolingFromOverheat = false;
      applyState(MOTOR_STATES.stopped);
      temperatureStateBanner.style.display = "none";
      render();
    } else if (temperatureValue <= OVERHEATING_TEMP_STOP_POINT && motorState === MOTOR_STATES.charging) {
      isCoolingFromOverheat = false;
      temperatureStateBanner.style.display = "none";
    }
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function motorTemperatureControl(isMotorRunning) {
    clearInterval(temperatureControlInterval);
    let temperatureStep = temperatureValue;
    const MIN_TEMP = 20;
    const MAX_TEMP = 80;
    if (!isMotorRunning) {
      temperatureControlInterval = setInterval(() => {
        if (temperatureStep <= MIN_TEMP) {
          temperatureValue = MIN_TEMP;
          motorTemperature.textContent = `${temperatureValue}`;
          clearInterval(temperatureControlInterval);
          return;
        }
        temperatureValue = temperatureStep;
        temperatureColorControl();
        overheatingLogic();
        motorTemperature.textContent = `${temperatureValue}`;
        temperatureStep -= randomInt(1, 10);
        if (temperatureStep < MIN_TEMP) temperatureStep = MIN_TEMP;
      }, 3000);
    } else {
      temperatureControlInterval = setInterval(() => {
        if (temperatureStep >= MAX_TEMP) {
          temperatureValue = MAX_TEMP;
          motorTemperature.textContent = `${temperatureValue}`;
          temperatureStateBanner.style.display = "block";
          clearInterval(temperatureControlInterval);
          applyState(MOTOR_STATES.overheated);
          render();
          return;
        }
        temperatureValue = temperatureStep;
        temperatureColorControl();
        motorTemperature.textContent = `${temperatureValue}`;
        temperatureStep += randomInt(1, 5);
      }, 5000);
    }
  }

  function motorSpeedControl(isMotorRunning) {
    clearInterval(motorSpeedControlInterval);
    if (!isMotorRunning) {
      motorSpeed.textContent = `━`;
      motorSpeedText.style.display = "none";
      motorSpeedValue = 0;
      return;
    }
    const MIN_SPEED = 1000;
    const MAX_SPEED = 1200;
    motorSpeedValue = MIN_SPEED;
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

  function batteryLevelControl(changePerTick, intervalMs) {
    clearInterval(batteryControlInterval);
    bannerControl();
    batteryControlInterval = setInterval(() => {
      batteryCharge += changePerTick;
      batteryCardColorControl();
      if (batteryCharge <= 0) {
        batteryCharge = 0;
        batteryChargePercentage.textContent = `${batteryCharge}%`;
        progressBarFill.style.width = `${batteryCharge}%`;
        applyState(MOTOR_STATES.depleted);
        bannerControl();
        render();
        clearInterval(batteryControlInterval);
      } else if (batteryCharge >= 100) {
        batteryCharge = 100;
        batteryChargePercentage.textContent = `${batteryCharge.toFixed(0)}%`;
        progressBarFill.style.width = `${batteryCharge}%`;
        applyState(isCoolingFromOverheat ? MOTOR_STATES.overheated : MOTOR_STATES.stopped);
        render();
        clearInterval(batteryControlInterval);
      } else {
        batteryChargePercentage.textContent = `${batteryCharge.toFixed(1)}%`;
        progressBarFill.style.width = `${batteryCharge}%`;
        bannerControl();
        if (changePerTick > 0) {
          buttonStateText.textContent = MESSAGES.chargingStatus(batteryCharge.toFixed(1));
        }
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

  function updateStatusCard() {
    if (!motorStatus) {
      console.warn("The motor status card has not been found.");
      return;
    } else if (!motorStatusCircle) {
      console.warn("The status circle has not been found.");
      return;
    } else if (!motorStatusText) {
      console.warn("The status text has not been found.");
      return;
    }
    motorStatusCircle.className = "circle";
    motorStatus.className = "card__status";
    if (motorState === MOTOR_STATES.overheated) {
      motorStatusCircle.classList.add(CLASSES.circleDanger);
      motorStatus.classList.add(CLASSES.motorStatusDanger);
      motorStatusText.textContent = MESSAGES.motorStatusOverheated;
    } else if (motorState === MOTOR_STATES.charging) {
      motorStatusCircle.classList.add(CLASSES.circleCharging);
      motorStatus.classList.add(CLASSES.motorStatusCharging);
      motorStatusText.textContent = MESSAGES.motorStatusCharging;
    } else if (motorState === MOTOR_STATES.depleted) {
      motorStatusCircle.classList.add(CLASSES.circleDanger);
      motorStatus.classList.add(CLASSES.motorStatusDanger);
      motorStatusText.textContent = MESSAGES.motorStatusDepleted;
    } else if (motorState === MOTOR_STATES.running) {
      motorStatusCircle.classList.add(CLASSES.circleRunning);
      motorStatus.classList.add(CLASSES.motorStatusRunning);
      motorStatusText.textContent = MESSAGES.motorStatusRunning;
    } else if (motorState === MOTOR_STATES.stopped) {
      motorStatusCircle.classList.add(CLASSES.circleStopped);
      motorStatus.classList.add(CLASSES.motorStatusStopped);
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
    if (batteryCharge === 0) {
      applyState(MOTOR_STATES.depleted);
    } else if (motorState === MOTOR_STATES.running) {
      applyState(MOTOR_STATES.stopped);
    } else if (motorState === MOTOR_STATES.stopped) {
      applyState(MOTOR_STATES.running);
    } else {
      console.warn("No valid motor states found while toggling motor");
    }
    render();
  }

  function toggleChargeButtonState() {
    if (!chargeButton) {
      console.warn("The charge button has not been found.");
      return;
    }
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
    render();
  }

  function baseMotorStop() {
    controlButton.disabled = false;
    if (batteryCharge >= 100) {
      chargeButton.disabled = true;
    } else {
      chargeButton.disabled = false;
    }
    chargeButton.className = "btn";
    chargeButton.classList.add("js-charge-btn", CLASSES.chargeReady);
    controlButton.className = "btn";
    controlButton.classList.add("js-motor-btn", CLASSES.motorStart);
    controlButton.textContent = MESSAGES.btnStartMotor;
    buttonStateText.textContent = MESSAGES.motorStopped;
    chargeButton.textContent = MESSAGES.btnCharge;
  }

  function init() {
    initCharts();
    render();
    batteryChargePercentage.textContent = `${batteryCharge.toFixed(1)}%`;
    progressBarFill.style.width = `${batteryCharge}%`;
    motorTemperature.textContent = `${temperatureValue}`;
    bannerControl();
    batteryCardColorControl();
  }

  function render() {
    updateStatusCard();
    if (motorState === MOTOR_STATES.stopped) {
      baseMotorStop();
      if (batteryCharge >= 100) {
        buttonStateText.textContent = MESSAGES.batteryFull;
      }
    } else if (motorState === MOTOR_STATES.running) {
      controlButton.disabled = false;
      chargeButton.disabled = true;
      // className acts as a reset, removing all previous modifier classes
      controlButton.className = "btn";
      controlButton.classList.add("js-motor-btn", CLASSES.motorStop);
      controlButton.textContent = MESSAGES.btnStopMotor;
      buttonStateText.textContent = MESSAGES.motorRunning;
    } else if (motorState === MOTOR_STATES.charging) {
      controlButton.disabled = true;
      chargeButton.disabled = false;
      chargeButton.className = "btn";
      chargeButton.classList.add("js-charge-btn", CLASSES.chargeCharging);
      chargeButton.textContent = MESSAGES.btnStopCharging;
      buttonStateText.textContent = MESSAGES.chargingStatus(batteryCharge.toFixed(1));
    } else if (motorState === MOTOR_STATES.depleted) {
      baseMotorStop();
      controlButton.disabled = true;
      chargeButton.disabled = false;
      buttonStateText.textContent = MESSAGES.batteryDepleted;
    } else if (motorState === MOTOR_STATES.overheated) {
      baseMotorStop();
      controlButton.disabled = true;
      chargeButton.disabled = false;
      buttonStateText.textContent = MESSAGES.motorOverheated;
    } else {
      console.log("No valid motor states were found");
    }
  }

  controlButton.addEventListener("click", toggleMotorButtonState);
  chargeButton.addEventListener("click", toggleChargeButtonState);
  init();
}

window.addEventListener("load", onLoad);
