# Obelisk Planner

Planificateur d'objets et de route pour *Across the Obelisk* : filtre les objets par acte, par affixe (Marque, Saignement, Vitalité, etc.), et détecte les incompatibilités entre objets (portails exclusifs, Void vs Nécropole, choix de node unique).

## Utiliser l'app

Aucune installation nécessaire — c'est un site statique.

- **En local** : ouvre `index.html` dans un navigateur, ou lance un petit serveur (`python3 -m http.server`) depuis ce dossier, car `fetch()` ne charge pas toujours un fichier JSON en local sans serveur selon le navigateur.
- **En ligne (GitHub Pages)** : Settings → Pages → Deploy from branch → `main` / `/ (root)`. L'app sera accessible à `https://<ton-user>.github.io/<nom-du-repo>/`.
- https://tiffado.github.io/across/

## Structure

```
ato-planner/
├── index.html       structure de la page
├── css/style.css     tout le style
├── js/app.js          logique de filtrage et de compatibilité
├── data/items.json     base de données des objets (à enrichir)
└── README.md
```

## Mettre à jour la base de données

Le seul fichier à modifier au fil du jeu est `data/items.json`. Chaque objet suit ce format :

```json
{
  "id": "identifiant_unique",
  "name": "Nom affiché",
  "map": "red | green | blue | yellow | turquoise | void | necropolis | null",
  "act": "1 | 2/3 | 4 | null",
  "effect": "Texte d'effet",
  "affixes": ["mark", "bleed", "..."],
  "location": "Description du node/chemin pour l'obtenir",
  "confidence": "high | medium | low"
}
```

Les tags d'affixe disponibles sont listés dans `affixTags` en haut du fichier — ajoute-en un nouveau si besoin, il apparaîtra automatiquement comme filtre dans la sidebar.

Les règles de compatibilité (objets qui s'excluent mutuellement) sont dans `compatibilityRules`. Le type `mutually_exclusive_items` liste une paire/groupe d'IDs incompatibles avec une raison affichée à l'utilisateur.

Les conflits de portails (Acte 2/3 : Rouge/Vert/Bleu/Jaune/Turquoise) et Acte 4 (Void vs Nécropole) sont détectés automatiquement par `js/app.js` en comparant le champ `map` — pas besoin de les lister un par un dans `compatibilityRules`.

## Statut de la base

Catalogue partiel : seuls les objets à localisation fixe confirmée sont inclus pour l'instant, plus une sélection d'objets génériques de boutique. Le niveau `confidence` indique la fiabilité de chaque entrée.
