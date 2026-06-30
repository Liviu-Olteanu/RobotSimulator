function onLoad() {
  const CLASS_CONTROL_BTN_STOP = "btn_control--stop";
  const CLASS_CONTROL_BTN_START = "btn_control--start";
  const ClASS_BTN_CHARGE_READY = "btn_charge--ready";
  const ClASS_BTN_CHARGE_CHARGING = "btn_charge--charging";
  const controlButton = document.querySelector(".btn_control");
  const chargeButton = document.querySelector(".btn_charge");
  const buttonStateText = document.querySelector(".button_state_text");

  function toggleMotorButtonState() {
    if (!controlButton) {
      console.warn("The control button has not been found.");
      return;
    }
    if (controlButton.classList.contains(CLASS_CONTROL_BTN_STOP)) {
      controlButton.classList.replace(
        CLASS_CONTROL_BTN_STOP,
        CLASS_CONTROL_BTN_START,
      );
      controlButton.textContent = "Start motor";
      buttonStateText.textContent =
        "Motor is stopped. You can start motor or charge.";
      chargeButton.disabled = false;
    } else if (controlButton.classList.contains(CLASS_CONTROL_BTN_START)) {
      controlButton.classList.replace(
        CLASS_CONTROL_BTN_START,
        CLASS_CONTROL_BTN_STOP,
      );
      controlButton.textContent = "Stop motor";
      buttonStateText.textContent =
        "Motor is running. Stop motor before charging.";
      chargeButton.disabled = true;
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
      chargeButton.classList.replace(
        ClASS_BTN_CHARGE_READY,
        ClASS_BTN_CHARGE_CHARGING,
      );
      buttonStateText.textContent = "Charging... battery at 72%";
    } else if (chargeButton.classList.contains(ClASS_BTN_CHARGE_CHARGING)) {
      controlButton.disabled = false;
      chargeButton.textContent = "Charge";
      chargeButton.classList.replace(
        ClASS_BTN_CHARGE_CHARGING,
        ClASS_BTN_CHARGE_READY,
      );
      buttonStateText.textContent =
        "Motor is stopped. You can start motor or charge.";
    } else {
      chargeButton.classList.add(ClASS_BTN_CHARGE_READY);
    }
  }

  controlButton.addEventListener("click", toggleMotorButtonState);
  chargeButton.addEventListener("click", toggleChargeButtonState);

  toggleMotorButtonState();
}
window.addEventListener("load", onLoad);
