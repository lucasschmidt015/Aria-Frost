const optionsBtn = document.getElementById("options-btn");
const dropdownMenu = document.getElementById("dropdown-menu");
const manegePeopleButton = document.getElementById("manege-people-button");
const closeManegePeopleButtom = document.getElementById("close-btn");
const manegePeopleClass = document.getElementById("manege-people");

const copyLinkBtn = document.getElementById("copyLinkBtn");
const chatLinkField = document.getElementById("chatLink");

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

function rotateIcon() {
  isImageRotated = !isImageRotated;
  var rotationDegree = isImageRotated ? 180 : 0;
  optionsBtn.classList.toggle("rotated");
}
