const fileInput = document.getElementById("chatImage");
const img = document.getElementById("imgChat");

const baseURL = document.baseURI;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];

  if (file) {
    const render = new FileReader();
    render.onload = (e) => {
      img.src = e.target.result;
    };
    render.readAsDataURL(file);
  } else {
    img.src = "/src/default_img.jpg";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newChatForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });

    const chatId = formData.get("chatId");

    if (chatId !== "") {
      defineToastMessage("Chat updated successfully.");
    } else {
      defineToastMessage("Chat created successfully.");
    }

    window.location.href = response.url;
  });
});

window.onload = async () => {
  const chatId = document.getElementById("chatIdNewChat").value;

  if (chatId !== "") {
    const response = await fetch(
      `${baseURL}chat/chat-data/${chatId}`
    );
    const responseData = await response.json();
    if (!responseData.error && responseData.imageName != null) {
      img.src = `/chat_img/${responseData.imageName}`;
    }
  }
};
