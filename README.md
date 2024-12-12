## Shifumi blockchain

Projet de Shifumi on chain

### Stratégie:

Jeu de betting en 1 contre 1, les joueurs misent une somme d'ETH identique, le gagnant remporte la somme des mises.
Si les joueurs font match nul, ils récupèrent leur mise.

### Modèle économique:

- 5% de commission sur chaque partie s'il y a un gagnant, transféré au FeeCollector (initié au moment du déploiement du contrat)
- (Possibilité de token, détaillé dans les pistes futures)

### Tech:

- Contrat Solidity déployé sur blockchain EVM (Base Sepolia) : https://sepolia.basescan.org/address/0xB5d3E134dA45B0eC05e7aC5fd054e700a76dfE80
- Vérifié via etherscan, code disponible : https://sepolia.basescan.org/address/0xB5d3E134dA45B0eC05e7aC5fd054e700a76dfE80#code
- Frontend en NextJS, TailwindCSS, Shadcn
- Interaction wallet via RainbowKit

### A savoir:

- Gérer la "problématique" de la transparence du choix de l'adversaire :
  En effet, le choix de l'adversaire est stocké dans le contrat, et donc visible par tous.
  En consultant la blockchain, ou meme en simulant son choix (si le choix de l'adversaire est déjà fait), un joueur pourrait voir le choix de l'adversaire et choisir le sien en conséquence.
  C'est pour cele que nous avons décidé dans un premier temps d'envoyer un hash du choix de l'adversaire, et de le révéler après que lorsque les deux joueurs ont fait leur choix.

- Reentrancy Attack :
  Pour éviter les attaques de type reentrancy, nous avons d'abord mis à jour la balance avant de transférer les fonds.
  Avec un peu plus de temps, nous aurions utilisé le modifier `nonReentrant` pour éviter les attaques de type reentrancy.

### Pistes futures :

- Ajouter des fonctions pour simplifier le front, comme getMyGames, etc
- Ajout de la possibilité de jouer contre l'ordinateur, avec de l'aléatoire via un oracle (Chainlink VRF)
- Création d'un token, qui pourrait avoir des avantages dans notre jeu.
  Par exemple si vous possédez et stakez notre tokens, vous pouvez avoir une réduction de fees, ou meme des bonus de gains.
  Vous pourriez également voter pour des propositions de la communauté, etc.
- Miser des ERC20 comme des stablecoins pour avoir une base de mise stable.
