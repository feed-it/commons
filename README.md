# Feed'it Commons

> Reusable components, scripts, styles, hooks & more

## Comment l'utiliser

### 1. Github + Env
D'abord il faut un générer un token Github [ici](https://github.com/settings/tokens)

Il faut créer un token **(classic)** :

-   Nom : NPM_TOKEN
-   Expiration : Au choix
-   Permission : **package:read** uniquement celle-ci

Après l'avoir générer, enregistrez le quelque part puisque Github ne le remontrera jamais, même en cas d'oubli.

Ensuite dans votre profile de terminal, on ajoute :

-   Pour Linux soit dans `.bashrc` ou `.zshrc` : `export NPM_TOKEN="<VOTRE TOKEN>"`

-   Pour Windows dans le Gestionnaire des variables d'environnement, ajoutez une nouvelle variable (**=> pas dans le PATH**)
    Nom : NPM_TOKEN 
    Valeur : le token


### 2. Projet

Dans le projet, ajoutez à la racine un fichier `.npmrc` avec comme contenu :
```
@feed-it:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Mais ne remplacez pas `${NPM_TOKEN}` par votre token. Laissez tel quel.

### 3. Fin

Vous n'avez plus qu'a utiliser la commande `pnpm add -D @feed-it/commons` ou `npm i -D @feed-it/commons`

## Comment travailler dans le package

Dans un premier temps, exécutez les commandes suivantes :

- `pnpm run rollup` - Build une première fois le package en local
- `pnpm link` - Créer un lien symbolique vers le package local
- `pnpm run dev` - Permet d'auto build le projet quand il y a des changements

Dans le projet de votre choix, incluez le package local comme suit : `pnpm link @feed-it/commons`

Mais attention à ne rien commit / push sur ce projet. Il ne sert qu'à tester le package en local.

Une fois ces étapes faites, vous pouvez travailler.

**Typescript obligatoire sinon impossible de build**

Les commits **doivent** respecter la convention de nommage de Angular pour que les releases puisse se faire : [documentation](https://www.conventionalcommits.org/fr/v1.0.0/)

Lorsque vous voulez faire une release, vous avez juste à faire `pnpm run release` et aller [ici](https://github.com/feed-it/commons/actions) pour s'assurer que la release se déploie correctement.

---

Si c'est votre première fois, regardez l'architecture du projets et surtout comment :

- Chaque composant est importé dans l'index.ts pour pouvoir être compilés et accessibles depuis les projets externes
- Les types sont déclarés. 

Attention à la différence entre les interface et types, et à ni exporter `export` n'importe quoi et ni utiliser export **default**