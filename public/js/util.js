async function showConfirmPrompt(title = "", message = "") {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ok",
  });

  if (result.isConfirmed) {
    return true;
  } else {
    return false;
  }
}

function defineToastMessage(message, success = true) {
  if (success) {
    localStorage.setItem("successMessage", message);
  } else {
    localStorage.setItem("failureMessage", message);
  }
}

function clearToastMessage() {
  localStorage.removeItem("successMessage");
  localStorage.removeItem("failureMessage");
}

function showToastMessage() {
  const successMessage = localStorage.getItem("successMessage");
  if (successMessage) {
    showToast(successMessage);
    return clearToastMessage();
  }

  const failureMessage = localStorage.getItem("failureMessage");
  if (failureMessage) {
    showToast(failureMessage, false);
    return clearToastMessage();
  }
}

function showToast(message, success = true) {
  Toastify({
    text: message,
    className: "success",
    backgroundColor: success ? "#4CAF50" : "#e19e05",
    style: {
      borderRadius: "7px",
    },
    duration: 5000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
  }).showToast();
}
