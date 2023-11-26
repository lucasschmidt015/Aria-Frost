//Dropdown manager-------------------------------------------------------
const optionsBtn = document.getElementById("options-btn");
const dropdownMenu = document.getElementById("dropdown-menu");

let isImageRotated = false;

optionsBtn.addEventListener("click", () => {
  if (
    dropdownMenu.style.display === "none" ||
    dropdownMenu.style.display === ""
  ) {
    dropdownMenu.style.display = "flex";
  } else {
    dropdownMenu.style.display = "none";
  }

  rotateIcon();
});
//-----------------------------------------------------------------------

//manege people -------------------------------------------------------------
const manegePeopleButton = document.getElementById("manege-people-button");
const closeManegePeopleButtom = document.getElementById("close-btn");
const manegePeopleClass = document.getElementById("manege-people");

const copyLinkBtn = document.getElementById("copyLinkBtn");
const chatLinkField = document.getElementById("chatLink");

manegePeopleButton.addEventListener("click", () => {
  dropdownMenu.style.display = "none";
  rotateIcon();
  manegePeopleClass.style.display = "flex";
});

closeManegePeopleButtom.addEventListener("click", () => {
  manegePeopleClass.style.display = "none";
});

copyLinkBtn.addEventListener("click", async () => {
  const link = chatLinkField.value;
  await navigator.clipboard.writeText(link);
});

//-------------------------------------------------------------------------------

//Remove People--------------------------------------------------------------------

function removePeople(userId, chatId, csrfToken) {
  const body = new URLSearchParams({
    userId,
    chatId,
    _csrf: csrfToken,
  });

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  };

  fetch("http://localhost:3000/removeMember", requestOptions)
    .then((response) => {
      const userDiv = document.getElementById("user_" + userId);
      if (userDiv) {
        userDiv.remove();
      }
      showToast("User removal completed successfully.");
    })
    .catch((err) => {});
}

//---------------------------------------------------------------------------------

//Make Admin-----------------------------------------------------------------------
function makeAdmin(userId, chatId, csrfToken) {
  const body = new URLSearchParams({
    userId,
    chatId,
    _csrf: csrfToken,
  });
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  };

  fetch("http://localhost:3000/makeAdmin", requestOptions)
    .then((response) => {
      showToast("Admin updated");

      setTimeout(() => {
        window.location.href = response.url;
      }, 5000);
    })
    .catch((err) => {});
}
//--------------------------------------------------------------------------------

//onLoad-----------------------------------------------------------------------

window.onload = () => {
  const chatMessages = document.getElementById("chatMessages");
  renderMessages(JSON.parse(chatMessages.value));
};

//--------------------------------------------------------------------------------

function rotateIcon() {
  isImageRotated = !isImageRotated;
  var rotationDegree = isImageRotated ? 180 : 0;
  optionsBtn.classList.toggle("rotated");
}

//Socket comunication-----------------------------------------------------------------------
const socket = io();
const messageContainer = document.getElementById("allChats");
const messageInput = document.getElementById("messageInput");
const sendMessageButtom = document.getElementById("sendMessageButtom");
const chatId = document.getElementById("chatId");
const userId = document.getElementById("userId");

socket.emit("joinChat", chatId.value);

sendMessageButtom.addEventListener("click", emitMessage);

function onPressEnter(event) {
  if (event.keyCode === 13) {
    emitMessage();
  }
}

function emitMessage() {
  showToast("test");
  if (messageInput.value !== "") {
    socket.emit("chat message", {
      userId: userId.value,
      chatId: chatId.value,
      message: messageInput.value,
      date: Date.now(),
    });
    messageInput.value = "";
    return false;
  }
}

socket.on("chat message", (msg) => {
  renderMessages([msg]);
});

function showToast(message) {
  ///<--------
  // Swal.fire({
  //   position: "top-end",
  //   icon: "success",
  //   title: "Your work has been saved",
  //   showConfirmButton: false,
  //   timer: 1500,
  // });

  Toastify({
    text: message,
    className: "success",
    backgroundColor: "#4CAF50",
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
//--------------------------------------------------------------------------------

function checkIftheUserChanges(userId) {
  try {
    const lastDiv = messageContainer.lastElementChild;
    if (lastDiv && lastDiv.tagName.toLowerCase() !== "input") {
      const lastUserIdInput = lastDiv.querySelector("input");

      // Verificar se o input foi encontrado antes de tentar acessar o valor
      if (lastUserIdInput) {
        const lastUserId = lastUserIdInput.value;
        return lastUserId.toString() !== userId.toString();
      }
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

function isLoggedUser(messageUserId) {
  const userId = document.getElementById("userId").value;
  return userId.toString() === messageUserId.toString();
}

function createMessageElement(message, userHasChangedByScrooling) {
  let userChanges;

  if (userHasChangedByScrooling != undefined) {
    userChanges = userHasChangedByScrooling;
  } else {
    userChanges = checkIftheUserChanges(message.userId);
  }

  const thisIsLoggedUser = isLoggedUser(message.userId);

  const messageLine = document.createElement("div");
  messageLine.classList.add(
    thisIsLoggedUser ? "message_line_right" : "message_line_left"
  );

  if (userChanges && !thisIsLoggedUser) {
    var userImage = document.createElement("img");
    if (message.userImage.length)
      userImage.src = "/chat_img/" + message.userImage;
    else userImage.src = "/src/User_Default.png";
    userImage.alt = "";
  } else {
    var avancarLinha = document.createElement("div");
    avancarLinha.classList.add(
      thisIsLoggedUser ? "advance_line_right" : "advance_line_left"
    );
  }

  const messageArea = document.createElement("div");
  messageArea.classList.add(
    thisIsLoggedUser ? "message_area_right" : "message_area_left"
  );

  if (userChanges && !thisIsLoggedUser) {
    var userName = document.createElement("p");
    userName.textContent = message.userName;
  }

  const messageItself = document.createElement("div");
  messageItself.classList.add("message_itself");

  const messageText = document.createElement("p");
  messageText.textContent = message.message;

  const messageTime = document.createElement("span");
  messageTime.textContent = message.time;

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = "userId";
  hiddenInput.value = message.userId;

  messageItself.appendChild(messageText);
  messageItself.appendChild(messageTime);

  if (userChanges && !thisIsLoggedUser) {
    messageArea.appendChild(userName);
  }

  messageArea.appendChild(messageItself);

  if (userChanges && !thisIsLoggedUser) {
    messageLine.appendChild(userImage);
  } else {
    messageLine.appendChild(avancarLinha);
  }
  messageLine.appendChild(messageArea);
  messageLine.appendChild(hiddenInput);

  return messageLine;
}
function renderMessages(formattedMessages, renderTop = false) {
  const scrollTopBefore = messageContainer.scrollTop;
  const scrollHeightBefore = messageContainer.scrollHeight;

  let messageElement;

  for (let I = 0; I < formattedMessages.length; I++) {
    let userHasChanged = undefined;
    let dateHasChanged = undefined;

    if (renderTop) {
      if (formattedMessages[I + 1]) {
        userHasChanged =
          formattedMessages[I].userId.toString() !==
          formattedMessages[I + 1].userId.toString();
      } else if (formattedMessages[I - 1]) {
        userHasChanged =
          formattedMessages[I].userId.toString() !==
          formattedMessages[I - 1].userId.toString();
      }
    }

    if (!renderTop) printDate(formattedMessages[I], renderTop);

    messageElement = createMessageElement(formattedMessages[I], userHasChanged);

    if (!renderTop) messageContainer.appendChild(messageElement);
    else messageContainer.prepend(messageElement);

    if (renderTop) printDate(formattedMessages[I], renderTop);
  }

  const scrollHeightAfter = messageContainer.scrollHeight;

  const diff = scrollHeightAfter - scrollHeightBefore;

  if (!renderTop) messageContainer.scrollTop = messageContainer.scrollHeight;
  else {
    messageContainer.scrollTop = scrollTopBefore + diff;
  }
}

function printDate(message, renderTop) {
  if (message.firstMessageDay) {
    const dateLine = document.createElement("div");
    dateLine.classList.add("message_date");

    const dateItself = document.createElement("p");
    dateItself.textContent = formatDateToPrint(message.date);
    dateLine.appendChild(dateItself);

    if (!renderTop) {
      messageContainer.appendChild(dateLine);
    } else {
      messageContainer.prepend(dateLine);
    }
  }
}

function formatToDDMMYYYY(dateString) {
  const dateObject = new Date(dateString);
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1; // Os meses começam do zero
  const year = dateObject.getFullYear();

  // Adiciona um zero à esquerda se for necessário
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedMonth = month < 10 ? `0${month}` : month;

  return `${formattedDay}/${formattedMonth}/${year}`;
}

function formatDateToPrint(dateString) {
  const messageDate = new Date(dateString);
  const currentDate = new Date();

  if (
    messageDate.getDate() === currentDate.getDate() &&
    messageDate.getMonth() === currentDate.getMonth() &&
    messageDate.getFullYear() === currentDate.getFullYear()
  ) {
    return "Today";
  } else if (
    messageDate.getDate() === currentDate.getDate() - 1 &&
    messageDate.getMonth() === currentDate.getMonth() &&
    messageDate.getFullYear() === currentDate.getFullYear()
  ) {
    return "Yesterday";
  } else {
    return formatToDDMMYYYY(dateString);
  }
}

//Pagination controll -----------------------------------------------
const paginationAmount = parseInt(
  document.getElementById("paginationAmount").value
);

let messageCount = paginationAmount;

messageContainer.addEventListener("scroll", () => {
  if (messageContainer.scrollTop === 0) {
    const _csrf = document.getElementById("csrfToken").value;
    const body = new URLSearchParams({
      chatId: chatId.value,
      _csrf,
      messageCount,
    });
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    };

    fetch("http://localhost:3000/findOldestMessages", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        return response.json();
      })
      .then((newMessages) => {
        messageCount += paginationAmount;
        renderMessages(newMessages, true);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

//-------------------------------------------------------------------
