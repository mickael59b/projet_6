const url_api = "http://localhost:5678/api/";
const filter_bar = document.querySelector('.filter');
const portfolio_h2 = document.querySelector("#portfolio h2");
let previousModalId = null;

window.onload = function() {
    setupEditorBar(); // Configure la barre d'édition et le modal
    load_works();
    loadCategoriesForSelect(); // Charge les catégories pour le select
    setupPhotoPreview(); // Configure la prévisualisation de la photo
    add_work(); // Ajoute la fonctionnalité d'ajout de travaux
};

function setupEditorBar() {
    const token = localStorage.getItem('authToken');
    if (token) {
        const body = document.querySelector('body');
        const bar_container = document.createElement('div');
        bar_container.className = 'bar_editor';
        const bar_editor = document.createElement('p');
        const icone = document.createElement('i');
        icone.className = "fa-solid fa-pen-to-square";
        bar_editor.textContent = 'Mode édition';
        bar_container.append(icone, bar_editor);
        body.prepend(bar_container);

        const btnModifier = `
            <span class="link_modal">
                <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Modifier
            </span>
        `;
        portfolio_h2.insertAdjacentHTML("beforeend", btnModifier);

        if (filter_bar) {
            filter_bar.style.display = "none";
        }

        const lien = document.querySelector('a');
        if (lien) {
            lien.innerText = "logout";
        }

        const openButton = document.querySelector('.link_modal');
        const modalWorks = document.getElementById('modalworks');
        const galerieWorks = document.getElementById('galerie_works');
        const addPhoto = document.getElementById('add_photo');
        const closeButtons = document.querySelectorAll('.close-button');

        if (openButton && modalWorks && closeButtons.length) {
            openButton.addEventListener('click', async function() {
                previousModalId = galerieWorks.style.display === 'block' ? 'galerie_works' : null; // Stocke l'ID de la modal précédente
                modalWorks.style.display = 'flex'; // Affiche le modal
                galerieWorks.style.display = 'block'; // Affiche l'article de la galerie
                addPhoto.style.display = 'none'; // Cache l'article d'ajout de photo
                await loadWorksInModal(); // Charge les travaux dans le modal
            });

            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    modalWorks.style.display = 'none'; // Cache le modal
                    if (previousModalId) {
                        document.getElementById(previousModalId).style.display = 'block'; // Affiche la modal précédente
                        previousModalId = null; // Réinitialise la variable après retour
                    } else {
                        load_works();
                    }
                });
            });

            modalWorks.addEventListener('click', function(event) {
                if (event.target === modalWorks) {
                    modalWorks.style.display = 'none'; // Cache le modal en cliquant en dehors de la fenêtre du modal
                    if (previousModalId) {
                        document.getElementById(previousModalId).style.display = 'block'; // Affiche la modal précédente
                        previousModalId = null; // Réinitialise la variable après retour
                    } else {
                        load_works();
                    }
                }
            });

            const addPhotoButton = document.getElementById('add-photo-button');
            if (addPhotoButton) {
                addPhotoButton.addEventListener('click', function() {
                    previousModalId = 'galerie_works'; // Stocke l'ID de la modal précédente
                    galerieWorks.style.display = 'none'; // Cache l'article de la galerie
                    addPhoto.style.display = 'block'; // Affiche l'article d'ajout de photo
                });
            }

            const returnLink = document.querySelector('.return-link');
            if (returnLink) {
                returnLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    if (previousModalId) {
                        document.getElementById(previousModalId).style.display = 'block'; // Affiche la modal précédente
                        addPhoto.style.display = 'none'; // Cache la modal d'ajout de photo
                        previousModalId = null; // Réinitialise la variable après retour
                    }
                });
            }
        } else {
            console.error('Un ou plusieurs éléments nécessaires pour le modal sont manquants.');
            if (!openButton) console.error('Élément .link_modal non trouvé.');
            if (!modalWorks) console.error('Élément #modalworks non trouvé.');
            if (!closeButtons.length) console.error('Élément(s) .close-button non trouvé(s).');
        }
    }
}

async function loadWorksInModal() {
    const load_galerie = document.getElementById('works');
    if (!load_galerie) {
        console.error('Élément #works non trouvé dans le modal.');
        return;
    }

    try {
        const result = await fetch(url_api + 'works', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!result.ok) {
            throw new Error('Erreur de chargement des travaux : ' + result.statusText);
        }

        const works = await result.json();
        load_galerie.innerHTML = ''; // Vider le contenu actuel

        if (works.length === 0) {
            load_galerie.innerHTML = '<p>Aucun travail trouvé.</p>';
            return;
        }

        const token = localStorage.getItem('authToken');
        works.forEach(work => {
            const workItem = document.createElement('div');
            workItem.className = 'work-item';

            const img = document.createElement('img');
            img.src = work.imageUrl;
            img.alt = work.title;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
            deleteButton.addEventListener('click', async () => {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
                    try {
                        const deleteResult = await fetch(url_api + 'works/' + work.id, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (deleteResult.ok) {
                            load_galerie.removeChild(workItem);
                            load_works();
                        } else {
                            console.error('Échec de la suppression du travail :', deleteResult.statusText);
                        }
                    } catch (error) {
                        console.error('Erreur lors de la suppression du travail :', error);
                    }
                }
            });

            workItem.append(img, deleteButton);
            load_galerie.appendChild(workItem);
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des travaux :', error);
    }
}

async function add_work() {
    const submitButton = document.getElementById('submit-photo-button');
    const titleInput = document.getElementById('photo-title');
    const categorySelect = document.getElementById('photo-category');
    const fileInput = document.getElementById('photo-file-input');
    const previewImage = document.getElementById('photo-preview');
    const defaultIcon = document.getElementById('default-icon');
    const addPhotoText = document.querySelector('.add-photo-text');
    const addPhotoNote = document.querySelector('.add-photo-note');
    const token = localStorage.getItem('authToken');

    submitButton.addEventListener('click', async function(event) {
        event.preventDefault(); // Empêche le comportement par défaut du bouton

        // Récupération des valeurs des champs
        const title = titleInput.value.trim();
        const category = categorySelect.value;
        const file = fileInput.files[0]; // Fichier image sélectionné

        // Vérification du token
        if (!token) {
            console.error('Token d\'authentification manquant');
            alert('Vous devez être connecté pour ajouter une œuvre.');
            return;
        }

        // Validation des champs
        if (!title || !category || !file) {
            alert('Veuillez remplir tous les champs requis et sélectionner une image.');
            return;
        }

        // Création du FormData
        const formData = new FormData();
        formData.append('image', file); // Ajoute le fichier
        formData.append('title', title);
        formData.append('category', category);

        try {
            // Envoi de la requête POST
            const response = await fetch(url_api + 'works', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Assurez-vous que l'en-tête est bien configuré
                },
                body: formData
            });

            const responseData = await response.text(); // Utilisez text() pour obtenir le corps brut en cas d'erreur

            if (response.ok) {
                const data = JSON.parse(responseData);
                alert('Travail ajouté avec succès.');

                // Réinitialisation des champs du formulaire
                titleInput.value = '';
                categorySelect.value = '';
                fileInput.value = '';

                // Réinitialisation de l'aperçu d'image
                previewImage.src = '';
                previewImage.style.display = 'none'; // Cache l'image prévisualisée
                defaultIcon.style.display = 'block'; // Affiche l'icône par défaut
                addPhotoText.style.display = 'block'; // Affiche le texte "+ Ajouter photo"
                addPhotoNote.style.display = 'block'; // Affiche la note "jpg, png : 4mo max"

                // Fermeture de la modale
                document.getElementById('add_photo').style.display = 'none';
                document.getElementById('modalworks').style.display = 'none';

                // Recharger les travaux
                load_works(); // Assurez-vous que cette fonction existe et fonctionne correctement
            } else {
                console.error('Échec de l\'ajout du travail :', response.status, response.statusText, responseData);
                alert('Erreur lors de l\'ajout du travail. Vérifiez la console pour plus d\'informations.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du travail :', error);
            alert('Erreur lors de l\'ajout du travail. Vérifiez la console pour plus d\'informations.');
        }
    });
}

async function load_works(categorie = 'tous') {
    const container_load = document.querySelector('.gallery');
    try {
        const result = await fetch(url_api + 'works', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!result.ok) {
            throw new Error('Erreur de chargement des travaux : ' + result.statusText);
        }

        const works = await result.json();
        container_load.innerHTML = '';

        const filteredWorks = categorie && categorie !== 'tous'
            ? works.filter(work => work.category.name === categorie)
            : works;

        filteredWorks.forEach(work => {
            const workItem = document.createElement('div');
            workItem.className = 'work-item';

            const img = document.createElement('img');
            img.src = work.imageUrl;
            img.alt = work.title;

            const title = document.createElement('figcaption');
            title.textContent = work.title;

            workItem.append(img, title);
            container_load.appendChild(workItem);
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des travaux :', error);
    }
}

async function filter() {
    if (filter_bar) {
        try {
            const response = await fetch(url_api + 'categories', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur de chargement des catégories : ' + response.statusText);
            }

            const categories = await response.json();
            const categoriesList = document.querySelector('.filter');
            if (!categoriesList) {
                console.error('Élément avec la classe "filter" non trouvé');
                return;
            }

            categoriesList.innerHTML = '';

            // Fonction pour gérer l'ajout et suppression de la classe active
            const handleFilterClick = (event, categoryName) => {
                const allButtons = document.querySelectorAll('.btn_filter');
                
                // Supprime la classe active de tous les boutons
                allButtons.forEach(button => button.classList.remove('active'));
                
                // Ajoute la classe active au bouton cliqué
                event.currentTarget.classList.add('active');
                
                // Charge les travaux filtrés
                load_works(categoryName);
            };

            // Bouton "Tous"
            const btn_filter = document.createElement('button');
            btn_filter.textContent = 'Tous';
            btn_filter.className = 'btn_filter active';
            btn_filter.dataset.nom = 'tous';
            btn_filter.addEventListener('click', (event) => handleFilterClick(event, 'tous'));
            categoriesList.append(btn_filter);

            // Boutons pour chaque catégorie
            categories.forEach(category => {
                const button = document.createElement('button');
                button.textContent = category.name;
                button.className = 'btn_filter';
                button.dataset.nom = category.name;
                button.addEventListener('click', (event) => handleFilterClick(event, category.name));
                categoriesList.append(button);
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des catégories :', error);
        }
    }
}

async function loadCategoriesForSelect() {
    try {
        const response = await fetch(url_api + 'categories', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erreur de chargement des catégories : ' + response.statusText);
        }

        const categories = await response.json();
        const selectElement = document.getElementById('photo-category');

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selectElement.appendChild(option);
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des catégories pour le select :', error);
    }
}

function setupPhotoPreview() {
    const fileInput = document.getElementById('photo-file-input');
    const previewImage = document.getElementById('photo-preview');
    const defaultIcon = document.getElementById('default-icon');
    const addPhotoContainer = document.getElementById('add-photo-container');
    const addPhotoText = addPhotoContainer.querySelector('.add-photo-text');
    const addPhotoNote = addPhotoContainer.querySelector('.add-photo-note');
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block'; // Affiche l'image prévisualisée
                defaultIcon.style.display = 'none'; // Cache l'icône par défaut
                addPhotoText.style.display = 'none'; // Cache le texte "+ Ajouter photo"
                addPhotoNote.style.display = 'none'; // Cache la note "jpg, png : 4mo max"
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.src = '';
            previewImage.style.display = 'none'; // Cache l'image prévisualisée si aucun fichier n'est sélectionné
            defaultIcon.style.display = 'block'; // Réaffiche l'icône par défaut
            addPhotoText.style.display = 'block'; // Réaffiche le texte "+ Ajouter photo"
            addPhotoNote.style.display = 'block'; // Réaffiche la note "jpg, png : 4mo max"
        }
    });

    addPhotoContainer.addEventListener('click', () => fileInput.click()); // Ouvre la boîte de dialogue de sélection de fichier
}

filter(); // Conserver l'appel à filter() si nécessaire pour d'autres éléments de filtrage
