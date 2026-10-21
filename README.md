# Quiz Halloween — Le mystère de la mairie

Petit quiz autonome en HTML/CSS/JavaScript, conçu pour être publié gratuitement avec **GitHub Pages**. Aucun framework ni compilation nécessaires.

## Prévisualiser en local
Ouvre `index.html` dans un navigateur. La vidéo d’introduction est dans `assets/intro-halloween.mp4`.

## Publier avec GitHub Pages
1. Crée un dépôt GitHub, par exemple `quiz-halloween-conflans`.
2. Envoie le contenu de ce dossier à la racine du dépôt : `index.html`, `style.css`, `script.js`, `assets/` et `references-genially/`.
3. Dans le dépôt, ouvre **Settings → Pages**.
4. Dans **Build and deployment**, choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
5. Attends quelques minutes : GitHub affichera l’adresse publique de la page dans la section Pages.

## Personnaliser les questions
Ouvre `script.js` et modifie le tableau `questions` :
- `text` : énoncé ;
- `hint` : indice sous l’énoncé ;
- `answers` : les choix proposés ;
- `correct` : index de la bonne réponse (la première réponse a l’index `0`) ;
- `explanation` : explication affichée après validation.

Le quiz contient cinq questions principales et une question bonus. Le bonus est volontairement à personnaliser : confirme le surnom que tu veux faire deviner pour Conflans-Sainte-Honorine, puis remplace ses propositions et sa réponse dans l’objet `bonus`.

Les questions 3 et 5 sont des propositions éditables : ajuste-les aux informations exactes que tu veux transmettre. Les images exportées de Genially sont rangées dans `references-genially/` comme références visuelles ; elles ne sont pas utilisées comme fonds d’écran. Le design du site est recréé en CSS pour rester lisible sur mobile et ordinateur.

## Accessibilité et fonctionnement
- Mise en page responsive ;
- commandes utilisables au clavier via les boutons natifs ;
- animation réduite si le système préfère `prefers-reduced-motion` ;
- aucune donnée de joueur n’est envoyée ou enregistrée.
