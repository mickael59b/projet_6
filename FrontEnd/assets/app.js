const url_api = "http://localhost:5678/api/";
const link = document.getElementById('link_connect');
const btn_login = document.getElementById('login_connect');
const errors = document.getElementById('error_msg');
const filter_bar = document.querySelector('.filter');
const email = document.getElementById('email');
const password = document.getElementById('password');

if(localStorage.getItem('authToken')){
        
    // Création de la barre d'édition dans un élément <p> à l'intérieur d'une <div>
    const body = document.querySelector('body');
    const bar_container = document.createElement('div');
    bar_container.className = 'bar_editor';
    const bar_editor = document.createElement('p');
    const icon = document.createElement('i');
    icon.className = "fa-solid fa-pen-to-square";
    bar_editor.textContent = 'Barre d\'édition'; // Ajouter du texte à la barre d'édition
    bar_container.append(icon);
    bar_container.append(bar_editor);
    body.prepend(bar_container);

    if(filter_bar){
        filter_bar.style.display = "none";
    }
    if(link){
        link.innerText = "logout";
    }
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

async function filter() {
    if(filter_bar){
        try {
            // Effectuer la requête GET pour récupérer les catégories
            const response = await fetch(url_api + 'categories', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
    
            // Vérifier si la réponse est correcte
            if (!response.ok) {
                throw new Error('Erreur de réseau ou serveur : ' + response.statusText);
            }
    
            // Convertir la réponse en JSON
            const categories = await response.json();
    
            // Vérifiez si l'élément existe avant d'ajouter des éléments
            const categoriesList = document.querySelector('.filter');
            if (!categoriesList) {
                console.error('Élément avec la classe "filter" non trouvé');
                return;
            }
    
            categoriesList.innerHTML = ''; // Vider la liste avant d'ajouter de nouveaux éléments
    
            const btn_filter = document.createElement('button');
            btn_filter.textContent = 'Tous';
            btn_filter.className = 'btn_filter'; // Ajouter la classe CSS
            btn_filter.dataset.nom = 'tous';
            categoriesList.append(btn_filter);
    
            // Ajouter chaque catégorie à la liste
            categories.forEach(category => {
                // Créer un bouton pour chaque catégorie
                const button = document.createElement('button');
                button.textContent = category.name;
                button.className = 'btn_filter'; // Ajouter la classe CSS
                button.dataset.nom = category.name; // ajoute data-nom au bouton avec le nom de la category
                categoriesList.append(button);
                
            });
    
        } catch (error) {
            // Afficher l'erreur dans la console et dans l'élément HTML des erreurs
            console.error('Erreur lors de la récupération des catégories :', error);
            errors.innerHTML = 'Erreur lors de la récupération des catégories : ' + error.message;
        }
    }
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

// Appel initial de la fonction filter pour récupérer et afficher les catégories
filter();
