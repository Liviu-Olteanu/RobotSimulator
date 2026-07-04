function onLoad() {
  const CLASS_CONTROL_BTN_STOP = "btn_control--stop";
  const CLASS_CONTROL_BTN_START = "btn_control--start";
  const ClASS_BTN_CHARGE_READY = "btn_charge--ready";
  const ClASS_BTN_CHARGE_CHARGING = "btn_charge--charging";
  const CLASS_MOTOR_STATUS_RUNNING = "motor_status_card--running";
  const CLASS_MOTOR_STATUS_STOPPED = "motor_status_card--stopped";
  const CLASS_MOTOR_STATUS_CHARGING = "motor_status_card--charging";
  const CLASS_CIRCLE_RUNNING = "circle--running";
  const CLASS_CIRCLE_STOPPED = "circle--stopped";
  const CLASS_CIRCLE_CHARGING = "circle--charging";
  const controlButton = document.querySelector(".btn_control");
  const chargeButton = document.querySelector(".btn_charge");
  const buttonStateText = document.querySelector(".button_state_text");
  const motorStatus = document.querySelector(".motor_status_card");
  const motorStatusText = document.querySelector(".motor_status_text");
  const motorStatusCircle = document.querySelector(".circle");

  function updateMotorStatus() {
    if (!motorStatus) {
      console.warn("The motor status card has not been found.");
      return;
    } else if (!motorStatusCircle) {
      console.warn("The status circle has not been found.");
      return;
    }
    if (motorStatus.classList.contains(CLASS_MOTOR_STATUS_STOPPED) && motorStatusCircle.classList.contains(CLASS_CIRCLE_STOPPED)) {
      motorStatusCircle.classList.replace(CLASS_CIRCLE_STOPPED, CLASS_CIRCLE_RUNNING);
      motorStatus.classList.replace(CLASS_MOTOR_STATUS_STOPPED, CLASS_MOTOR_STATUS_RUNNING);
      motorStatusText.textContent = "Running";
    } else if (motorStatus.classList.contains(CLASS_MOTOR_STATUS_RUNNING) && motorStatusCircle.classList.contains(CLASS_CIRCLE_RUNNING)) {
      motorStatusCircle.classList.replace(CLASS_CIRCLE_RUNNING, CLASS_CIRCLE_STOPPED);
      motorStatus.classList.replace(CLASS_MOTOR_STATUS_RUNNING, CLASS_MOTOR_STATUS_STOPPED);
      motorStatusText.textContent = "Stopped";
    } else {
      motorStatus.classList.add(CLASS_MOTOR_STATUS_STOPPED);
      motorStatusCircle.classList.add(CLASS_CIRCLE_STOPPED);
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
    if (motorStatus.classList.contains(CLASS_MOTOR_STATUS_STOPPED) && motorStatusCircle.classList.contains(CLASS_CIRCLE_STOPPED)) {
      motorStatusCircle.classList.replace(CLASS_CIRCLE_STOPPED, CLASS_CIRCLE_CHARGING);
      motorStatus.classList.replace(CLASS_MOTOR_STATUS_STOPPED, CLASS_MOTOR_STATUS_CHARGING);
      motorStatusText.textContent = "Charging";
    } else if (motorStatus.classList.contains(CLASS_MOTOR_STATUS_CHARGING) && motorStatusCircle.classList.contains(CLASS_CIRCLE_CHARGING)) {
      motorStatusCircle.classList.replace(CLASS_CIRCLE_CHARGING, CLASS_CIRCLE_STOPPED);
      motorStatus.classList.replace(CLASS_MOTOR_STATUS_CHARGING, CLASS_MOTOR_STATUS_STOPPED);
      motorStatusText.textContent = "Stopped";
    } else {
      motorStatus.classList.add(CLASS_MOTOR_STATUS_STOPPED);
      motorStatusCircle.classList.add(CLASS_CIRCLE_STOPPED);
    }
  }

  function toggleMotorButtonState() {
    if (!controlButton) {
      console.warn("The control button has not been found.");
      return;
    }
    if (controlButton.classList.contains(CLASS_CONTROL_BTN_STOP)) {
      controlButton.classList.replace(CLASS_CONTROL_BTN_STOP, CLASS_CONTROL_BTN_START);
      controlButton.textContent = "Start motor";
      buttonStateText.textContent = "Motor is stopped. You can start motor or charge.";
      chargeButton.disabled = false;
      updateMotorStatus();
    } else if (controlButton.classList.contains(CLASS_CONTROL_BTN_START)) {
      controlButton.classList.replace(CLASS_CONTROL_BTN_START, CLASS_CONTROL_BTN_STOP);
      controlButton.textContent = "Stop motor";
      buttonStateText.textContent = "Motor is running. Stop motor before charging.";
      chargeButton.disabled = true;
      updateMotorStatus();
    } else {
      controlButton.classList.add(CLASS_BTN_STOP);
    }
  }

  function toggleChargeButtonState() {
    if (!chargeButton) {
      console.warn("The charge button has not been found.");
      return;
    }
    if (chargeButton.classList.contains(ClASS_BTN_CHARGE_READY)) {
      controlButton.disabled = true;
      chargeButton.textContent = "Stop charging";
      chargeButton.classList.replace(ClASS_BTN_CHARGE_READY, ClASS_BTN_CHARGE_CHARGING);
      buttonStateText.textContent = "Charging... battery at 72%";
      updateChargeStatus();
    } else if (chargeButton.classList.contains(ClASS_BTN_CHARGE_CHARGING)) {
      controlButton.disabled = false;
      chargeButton.textContent = "Charge";
      chargeButton.classList.replace(ClASS_BTN_CHARGE_CHARGING, ClASS_BTN_CHARGE_READY);
      buttonStateText.textContent = "Motor is stopped. You can start motor or charge.";
      updateChargeStatus();
    } else {
      chargeButton.classList.add(ClASS_BTN_CHARGE_READY);
    }
  }

  controlButton.addEventListener("click", toggleMotorButtonState);
  chargeButton.addEventListener("click", toggleChargeButtonState);

  toggleMotorButtonState();
}
window.addEventListener("load", onLoad);
