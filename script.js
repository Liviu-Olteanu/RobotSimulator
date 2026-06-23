function onLoad() {
  const controlButton = document.querySelector(".btn_control");
  const chargeButton = document.querySelector(".btn_charge");
  const buttonStateText = document.querySelector(".button_state_text");

  function toggleMotorButtonState() {
    if (controlButton.classList.contains("btn_control--stop")) {
      controlButton.classList.replace(
        "btn_control--stop",
        "btn_control--start",
      );
      controlButton.textContent = "Start motor";
      buttonStateText.textContent =
        "Motor is stopped. You can start motor or charge.";
      chargeButton.disabled = false;
    } else {
      controlButton.classList.replace(
        "btn_control--start",
        "btn_control--stop",
      );
      controlButton.textContent = "Stop motor";
      buttonStateText.textContent =
        "Motor is running. Stop motor before charging.";
      chargeButton.disabled = true;
    }
  }

  function toggleChargeButtonState() {
    if (chargeButton.classList.contains("btn_charge--ready")) {
      controlButton.disabled = true;
      chargeButton.textContent = "Stop charging";
      chargeButton.classList.replace(
        "btn_charge--ready",
        "btn_charge--charging",
      );
      buttonStateText.textContent = "Charging... battery at 72%";
    } else {
      controlButton.disabled = false;
      chargeButton.textContent = "Charge";
      chargeButton.classList.replace(
        "btn_charge--charging",
        "btn_charge--ready",
      );
      buttonStateText.textContent =
        "Motor is stopped. You can start motor or charge.";
    }
  }

  controlButton.addEventListener("click", toggleMotorButtonState);
  chargeButton.addEventListener("click", toggleChargeButtonState);

  toggleMotorButtonState();
}
window.addEventListener("load", onLoad);
