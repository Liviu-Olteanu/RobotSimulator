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
  let motorState = MOTOR_STATES.stopped;
  let batteryCharge = "-";
  let temperatureValue = "-";
  let motorSpeedValue = "-";
  let temperatureArray = [];
  let motorSpeedArray = [];
  let timeArray = [];
  let speedChartAppearance = null;
  let temperatureChartAppearance = null;

  function getDataLoop() {
    setInterval(() => {
      fetchAndUpdate();
    }, 1000);
  }

  async function fetchAndUpdate() {
    const telemetryResponse = await fetch("/api/telemetry");
    const telemetryData = await telemetryResponse.json();

    const historyResponse = await fetch("/api/history");
    const historyData = await historyResponse.json();

    motorState = telemetryData.motorState;

    batteryCharge = telemetryData.batteryCharge;
    temperatureValue = telemetryData.temperatureValue;
    motorSpeedValue = telemetryData.motorSpeedValue;

    temperatureArray = historyData.temperatureArray;
    motorSpeedArray = historyData.motorSpeedArray;
    timeArray = historyData.timeArray;

    speedChartAppearance.data.labels = timeArray;
    speedChartAppearance.data.datasets[0].data = motorSpeedArray;
    temperatureChartAppearance.data.labels = timeArray;
    temperatureChartAppearance.data.datasets[0].data = temperatureArray;

    motorSpeedUIControl();
    motorTemperatureUIControl();
    batteryUIControl();
    render();
    chartsDataLoop();
  }

  function chartsDataLoop() {
    speedChartAppearance.update("none");
    temperatureChartAppearance.update("none");
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

  function overheatingUI() {
    const OVERHEATING_TEMP_STOP_POINT = 40;
    if (temperatureValue <= OVERHEATING_TEMP_STOP_POINT && motorState === MOTOR_STATES.overheated) {
      temperatureStateBanner.style.display = "none";
    } else if (temperatureValue <= OVERHEATING_TEMP_STOP_POINT && motorState === MOTOR_STATES.charging) {
      temperatureStateBanner.style.display = "none";
    }
  }

  function motorTemperatureUIControl() {
    const MIN_TEMP = 20;
    const MAX_TEMP = 80;
    if (motorState !== MOTOR_STATES.running) {
      if (temperatureValue <= MIN_TEMP) {
        motorTemperature.textContent = `${temperatureValue}`;
        return;
      }
      temperatureColorControl();
      overheatingUI();
      motorTemperature.textContent = `${temperatureValue}`;
    } else {
      if (temperatureValue >= MAX_TEMP) {
        motorTemperature.textContent = `${temperatureValue}`;
        temperatureStateBanner.style.display = "block";
        return;
      }
      temperatureColorControl();
      motorTemperature.textContent = `${temperatureValue}`;
    }
  }

  function motorSpeedUIControl() {
    if (motorState !== MOTOR_STATES.running) {
      motorSpeed.textContent = `━`;
      motorSpeedText.style.display = "none";
      return;
    }
    motorSpeed.textContent = `${motorSpeedValue}`;
    motorSpeedText.style.display = "inline";
  }

  function batteryUIControl() {
    bannerControl();
    batteryCardColorControl();
    if (batteryCharge <= 0) {
      batteryChargePercentage.textContent = `${batteryCharge}%`;
      progressBarFill.style.width = `${batteryCharge}%`;
    } else if (batteryCharge >= 100) {
      batteryChargePercentage.textContent = `${batteryCharge.toFixed(0)}%`;
      progressBarFill.style.width = `${batteryCharge}%`;
    } else {
      batteryChargePercentage.textContent = `${batteryCharge.toFixed(1)}%`;
      progressBarFill.style.width = `${batteryCharge}%`;
      if (motorState === MOTOR_STATES.charging) {
        buttonStateText.textContent = MESSAGES.chargingStatus(batteryCharge.toFixed(1));
      }
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

  async function sendAction(actionName) {
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: actionName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error("The action could not be sent", error);
    }
  }

  async function toggleMotorButtonState() {
    if (!controlButton) {
      console.warn("The control button has not been found.");
      return;
    }
    if (motorState === MOTOR_STATES.running) {
      await sendAction("stop");
      await fetchAndUpdate();
    } else if (motorState === MOTOR_STATES.stopped) {
      await sendAction("start");
      await fetchAndUpdate();
    } else {
      console.warn("No valid motor states found while toggling motor");
    }
    render();
  }

  async function toggleChargeButtonState() {
    if (!chargeButton) {
      console.warn("The charge button has not been found.");
      return;
    }
    if (
      motorState === MOTOR_STATES.stopped ||
      motorState === MOTOR_STATES.overheated ||
      motorState === MOTOR_STATES.depleted
    ) {
      await sendAction("charge");
      await fetchAndUpdate();
    } else if (motorState === MOTOR_STATES.charging) {
      await sendAction("stop_charge");
      await fetchAndUpdate();
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
    getDataLoop();
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
