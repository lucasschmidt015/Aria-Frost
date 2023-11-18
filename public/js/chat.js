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
      window.location.href = response.url;
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
      window.location.href = response.url;
    })
    .catch((err) => {});
}
//--------------------------------------------------------------------------------

//onLoad-----------------------------------------------------------------------

window.onload = () => {
  const message_container = document.getElementById("allChats");
  message_container.scrollTop = message_container.scrollHeight;
};

//--------------------------------------------------------------------------------

function rotateIcon() {
  isImageRotated = !isImageRotated;
  var rotationDegree = isImageRotated ? 180 : 0;
  optionsBtn.classList.toggle("rotated");
}
