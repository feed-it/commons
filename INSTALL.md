# Comment travailler dans le package

Dans un premier temps, exécutez les commandes suivantes:

- `pnpm run rollup` - Build une première fois le package en local
- `pnpm link` - Créer un lien symbolique vers le package local
- `pnpm run dev` - Permet d’auto build le projet quand il y a des changements

Dans le projet de votre choix, incluez le package local comme suit : `pnpm link @feed-it/commons`

Attention à ne rien commit / push sur ce projet. Il ne sert qu’à tester le package en local.

Une fois ces étapes faites, vous pouvez travailler.

**Typescript obligatoire sinon impossible de build**

Les commits **doivent** respecter la convention de nommage de Angular pour que les releases puissent se
faire: [documentation](https://www.conventionalcommits.org/fr/v1.0.0/)

Lorsque vous voulez faire une release, vous avez juste à faire `pnpm run release` et
aller [ici](https://github.com/feed-it/commons/actions) pour s'assurer que la release se déploie correctement.

---

Si c’est votre première fois, regardez l’architecture du projet et surtout comment:

- Chaque composant est importé dans l’index.ts pour pouvoir être compilés et accessibles depuis les projets externes
- Les types sont déclarés.

Attention à la différence entre l’interface et types, et à ni exporter `export` n’importe quoi et ni utiliser export *
*default**