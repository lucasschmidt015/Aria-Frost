const optionsBtn = document.getElementById('options-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

let isImageRotated = false;

optionsBtn.addEventListener('click', () => {
    if (dropdownMenu.style.display === 'none' || dropdownMenu.style.display === '') {
        dropdownMenu.style.display = 'flex'
    } else {
        dropdownMenu.style.display = 'none'
    }

    isImageRotated = !isImageRotated;
    var rotationDegree = isImageRotated ? 180 : 0;
    console.log(rotationDegree);
    optionsBtn.classList.toggle('rotated')
})