# Comment l’utiliser

## 1. Github + Env

D’abord, il faut un générer un token Github [ici](https://github.com/settings/tokens)

Il faut créer un token **(classic)** :

- Nom : NPM_TOKEN
- Expiration: Au choix
- Permission: **package:read** uniquement celle-ci

Après l’avoir généré, enregistrez le quelque part puisque Github ne le remontrera jamais, même en cas d’oubli.

Ensuite dans votre profil de terminal, on ajoute:

- Pour Linux soit dans `.bashrc` ou `.zshrc` : `export NPM_TOKEN="<VOTRE TOKEN>"`

- Pour Windows dans le Gestionnaire des variables d'environnement, ajoutez une nouvelle variable (**=> pas dans le PATH
  **)
  Nom: NPM_TOKEN
  Valeur: le token

## 2. Projet

Dans le projet, ajoutez à la racine un fichier `.npmrc` avec comme contenu:

```
@feed-it:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Ne remplacez pas `${NPM_TOKEN}` par votre token. Laissez tel quel.

## 3. Fin

Vous n’avez plus qu’à utiliser la commande `pnpm add -D @feed-it/commons` ou `npm i -D @feed-it/commons`