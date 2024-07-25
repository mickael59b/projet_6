const url_api = "http://localhost:5678/api/";
const errors = document.getElementById('error_msg');
const email = document.getElementById('email');
const password = document.getElementById('password');
const btn_login = document.getElementById('login_connect');

if(localStorage.getItem('authToken')){
    localStorage.removeItem('authToken');
    errors.innerHTML = "Vous venez d'etre deconnecter";
}
if(btn_login){
    btn_login.addEventListener('click', function (e) {
        e.preventDefault();
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (email.value.trim() === '' || password.value.trim() === '') {
            errors.innerHTML = "Tous les champs sont obligatoires";
        } else if (!emailPattern.test(email.value)) {
            errors.innerHTML = "Veuillez entrer un email valide";
        } else {
            errors.innerHTML = ""; // Efface les erreurs précédentes
            const user = {
                email: email.value,
                password: password.value
            }
            login(user);
        }
    });
}

async function login(user) {
    try {
        const result = await fetch(url_api + 'users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });
        const response = await result.json();
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            window.location.href = 'index.html';
        } else {
            errors.innerHTML = response.message;
        }
    } catch (error) {
        errors.innerHTML = 'Erreur de connexion : ' + error.message;
    }
}