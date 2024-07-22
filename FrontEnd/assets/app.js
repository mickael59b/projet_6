const url_api = "http://localhost:5678/api/users/login";
const btn_login = document.getElementById('login_connect');
const errors = document.getElementById('error_msg');
const email = document.getElementById('email');
const password = document.getElementById('password');

if(localStorage.getItem('authToken')){
    localStorage.removeItem('authToken');
    errors.innerHTML = 'Vous venez d\'etre deconnecter , vous pouvais vous reconnecter';
}

btn_login.addEventListener('click', async function(e){
    e.preventDefault();
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(email.value.trim() === '' || password.value.trim() === ''){
        errors.innerHTML = "Tous les champs sont obligatoire";
    }else if(!emailPattern.test(email.value)){
        errors.innerHTML = "veuillez entrer un email valide";
    }else{
        errors.innerHTML = ""; // Efface les erreurs précédentes
        const user = {
            email : email.value,
            password : password.value
        }

        try{

            const response = await fetch(url_api,{
                method : 'POST',
                headers : {
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify(user)
            });

            
            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', result.token);
                window.location.href = 'index.html';
            }else{
                errors.innerHTML = "Nom d'utilisateur ou mot de passe incorrect."
            }

        }catch{
            
        }
    }
});