const trigger = document.getElementById('header-menu');
const dropdown = document.getElementById('menu-dropdown');

const user_trigger = document.getElementById('user-menu');
const user_dropdown = document.getElementById('user-dropdown');


trigger.addEventListener('click', () => {
    event.stopPropagation();
    dropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    user_dropdown.classList.remove('open'); 
});

user_trigger.addEventListener('click', () => {
    event.stopPropagation();
    user_dropdown.classList.toggle('open');
});

user_dropdown.addEventListener('click', () => {
    user_dropdown.classList.remove('open');
});