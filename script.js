const trigger = document.getElementById('header-menu');
const dropdown = document.getElementById('menu-dropdown');

trigger.addEventListener('click', () => {
    event.stopPropagation();
    dropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
    dropdown.classList.remove('open');
});
