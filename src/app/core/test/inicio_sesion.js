/*
const container = document.querySelector('.container');
const signupButton = document.querySelector('.signup-section div.sigup');
const loginButton = document.querySelector('.login-section div.login');

// Cargar el estado "active" desde localStorage
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('active') === 'true') {
        container.classList.add('active');
    }
});

loginButton.addEventListener('click', () => {
    container.classList.add('active');
    localStorage.setItem('active', 'true');
});

signupButton.addEventListener('click', () => {
    container.classList.remove('active');
    localStorage.setItem('active', 'false');
});
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('errorUser')) {
        // Quitar el parámetro de error de la URL sin recargar la página
        urlParams.delete('errorUser');
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        history.replaceState({}, document.title, newUrl);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        // Quitar el parámetro de error de la URL sin recargar la página
        urlParams.delete('error');
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        history.replaceState({}, document.title, newUrl);
    }
});
*/