const url_api = "http://localhost:5678/api/";
const filter_bar = document.querySelector('.filter');
const portfolio_h2 = document.querySelector("#portfolio h2");

window.onload = function() {
    setupEditorBar(); // Configure la barre d'édition et le modal
    load_works();
    loadCategoriesForSelect(); // Charge les catégories pour le select
    setupPhotoPreview(); // Configure la prévisualisation de la photo
};

function setupEditorBar() {
    if (localStorage.getItem('authToken')) {
        const body = document.querySelector('body');
        const bar_container = document.createElement('div');
        bar_container.className = 'bar_editor';
        const bar_editor = document.createElement('p');
        const icone = document.createElement('i');
        icone.className = "fa-solid fa-pen-to-square";
        bar_editor.textContent = 'Mode édition';
        bar_container.append(icone);
        bar_container.append(bar_editor);
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

        // Configurer le modal et le gestionnaire d'événements pour ouvrir le modal
        const openButton = document.querySelector('.link_modal');
        const modal = document.getElementById('modal');
        const galerieWorks = document.getElementById('galerie_works');
        const addPhoto = document.getElementById('add_photo');
        const closeButtons = document.querySelectorAll('.close-button');

        if (openButton && modal && closeButtons.length) {
            openButton.addEventListener('click', async function() {
                console.log('Modal ouvert');
                modal.style.display = 'flex'; // Affiche le modal
                galerieWorks.style.display = 'block'; // Affiche l'article de la galerie
                addPhoto.style.display = 'none'; // Cache l'article d'ajout de photo
                await loadWorksInModal(); // Charge les travaux dans le modal
            });

            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    modal.style.display = 'none'; // Cache le modal
                });
            });

            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none'; // Cache le modal en cliquant en dehors de la fenêtre du modal
                }
            });

            const addPhotoButton = document.getElementById('add-photo-button');
            if (addPhotoButton) {
                addPhotoButton.addEventListener('click', function() {
                    galerieWorks.style.display = 'none'; // Cache l'article de la galerie
                    addPhoto.style.display = 'block'; // Affiche l'article d'ajout de photo
                });
            }
        } else {
            console.error('Un ou plusieurs éléments nécessaires pour le modal sont manquants.');
            if (!openButton) console.error('Élément .link_modal non trouvé.');
            if (!modal) console.error('Élément #modal non trouvé.');
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

        const works = await result.json();
        load_galerie.innerHTML = ''; // Vider le contenu actuel

        if (works.length === 0) {
            load_galerie.innerHTML = '<p>Aucun travail trouvé.</p>';
            return;
        }
        // Récupérer le token depuis localStorage
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
                        } else {
                            console.error('Failed to delete work:', deleteResult.statusText);
                        }
                    } catch (error) {
                        console.error('Error deleting work:', error);
                    }
                }
            });

            workItem.appendChild(img);
            workItem.appendChild(deleteButton);

            load_galerie.appendChild(workItem);
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des travaux :', error);
    }
}

async function load_works(categorie) {
    const container_load = document.querySelector('.gallery');
    try {
        const result = await fetch(url_api + 'works', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

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

            const title = document.createElement('p');
            title.textContent = work.title;

            workItem.appendChild(img);
            workItem.appendChild(title);

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
                throw new Error('Erreur de réseau ou serveur : ' + response.statusText);
            }

            const categories = await response.json();
            const categoriesList = document.querySelector('.filter');
            if (!categoriesList) {
                console.error('Élément avec la classe "filter" non trouvé');
                return;
            }

            categoriesList.innerHTML = '';

            const btn_filter = document.createElement('button');
            btn_filter.textContent = 'Tous';
            btn_filter.className = 'btn_filter';
            btn_filter.dataset.nom = 'tous';
            btn_filter.addEventListener('click', function() {
                load_works('tous');
            });
            categoriesList.append(btn_filter);

            categories.forEach(category => {
                const button = document.createElement('button');
                button.textContent = category.name;
                button.className = 'btn_filter';
                button.dataset.nom = category.name;
                button.addEventListener('click', function(e) {
                    load_works(category.name);
                });
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
            throw new Error('Erreur de réseau ou serveur : ' + response.statusText);
        }

        const categories = await response.json();
        const selectElement = document.getElementById('photo-category');

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
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
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block'; // Affiche l'image prévisualisée
                defaultIcon.style.display = 'none'; // Cache l'icône par défaut
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.src = '';
            previewImage.style.display = 'none'; // Cache l'image prévisualisée si aucun fichier n'est sélectionné
            defaultIcon.style.display = 'block'; // Réaffiche l'icône par défaut
        }
    });

    addPhotoContainer.addEventListener('click', function() {
        fileInput.click(); // Ouvre la boîte de dialogue de sélection de fichier
    });
}


filter(); // Conserver l'appel à filter() si nécessaire pour d'autres éléments de filtrage

