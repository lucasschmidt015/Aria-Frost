const fileInput = document.getElementById("chatImage");
const img = document.getElementById("imgChat");

fileInput.addEventListener('change', () => {
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
})