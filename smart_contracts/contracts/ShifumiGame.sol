// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract ShifumiGame {
    // Énumérations pour les choix et états du jeu
    enum Choice { None, Rock, Paper, Scissors }
    enum GameStatus { 
        Created,   // Jeu créé par le premier joueur
        Launched,  // Les deux joueurs ont rejoint
        Committed, 
        Revealed, 
        Completed 
    }

    // Structure pour stocker les détails d'une partie
    struct Game {
        uint256 gameId;
        address player1;
        address player2;
        uint256 betAmount;
        bytes32 player1Commitment;
        bytes32 player2Commitment;
        Choice player1Choice;
        Choice player2Choice;
        GameStatus status;
        uint256 createdAt;
        uint256 launchedAt;  // Moment où la partie est lancée
    }

    // Constantes
    uint256 constant COMMIT_REVEAL_TIMEOUT = 24 hours; // Délai max pour commit/révéler
    uint256 constant FEE_PERCENTAGE = 5; // 5% de frais sur chaque partie
    address public immutable feeCollector;

    // Variables d'état
    uint256 public gameCounter;
    mapping(uint256 => Game) public games;
    mapping(address => uint256) public playerBalances;
    uint256[] public activeGameIds;

    // Événements
    event GameCreated(uint256 indexed gameId, address player1, uint256 betAmount);
    event GameJoined(uint256 indexed gameId, address player2);
    event GameAbandoned(uint256 indexed gameId, address creator, uint256 refundAmount);
    event GameLaunched(uint256 indexed gameId, address player2);
    event CommitmentMade(uint256 indexed gameId, address player);
    event ChoiceRevealed(uint256 indexed gameId, address player, Choice choice);
    event GameResolved(uint256 indexed gameId, address winner, uint256 winnings);
    event FeesCollected(uint256 amount);

    constructor(address _feeCollector) {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
    }

    // Création d'une nouvelle partie
    function createGame() external payable {
        require(msg.value == 0.001 ether || 
                msg.value == 0.01 ether || 
                msg.value == 0.1 ether || 
                msg.value == 1 ether, "Invalid bet amount");

        gameCounter++;
        games[gameCounter] = Game({
            gameId: gameCounter,
            player1: msg.sender,
            player2: address(0),
            betAmount: msg.value,
            player1Commitment: 0x0,
            player2Commitment: 0x0,
            player1Choice: Choice.None,
            player2Choice: Choice.None,
            status: GameStatus.Created,
            createdAt: block.timestamp,
            launchedAt: 0
        });

        activeGameIds.push(gameCounter);

        emit GameCreated(gameCounter, msg.sender, msg.value);
    }

    // Fonction pour récupérer les parties disponibles
    function getAvailableGames() external view returns (uint256[] memory, Game[] memory) {
        uint256 availableCount = 0;
        
        // Compter les parties disponibles
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            Game memory game = games[activeGameIds[i]];
            if (game.status == GameStatus.Created) {
                availableCount++;
            }
        }

        // Préparer les tableaux de résultat
        uint256[] memory availableGameIds = new uint256[](availableCount);
        Game[] memory availableGames = new Game[](availableCount);
        
        // Remplir les tableaux
        uint256 index = 0;
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            Game memory game = games[activeGameIds[i]];
            if (game.status == GameStatus.Created) {
                availableGameIds[index] = activeGameIds[i];
                availableGames[index] = game;
                index++;
            }
        }

        return (availableGameIds, availableGames);
    }

    // Fonction pour récupérer les parties par statut
    function getGamesByStatus(GameStatus _status) external view returns (uint256[] memory, Game[] memory) {
        uint256 count = 0;
        
        // Compter les parties avec le statut donné
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            if (games[activeGameIds[i]].status == _status) {
                count++;
            }
        }

        // Préparer les tableaux de résultat
        uint256[] memory gameIds = new uint256[](count);
        Game[] memory matchingGames = new Game[](count);
        
        // Remplir les tableaux
        uint256 index = 0;
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            if (games[activeGameIds[i]].status == _status) {
                gameIds[index] = activeGameIds[i];
                matchingGames[index] = games[activeGameIds[i]];
                index++;
            }
        }

        return (gameIds, matchingGames);
    }

    // Fonction permettant au créateur de récupérer sa mise si la partie n'a pas été rejointe
    function abandonGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        require(msg.sender == game.player1, "Only game creator can abandon");
        require(game.player2 == address(0), "Game already has a second player");
        
        uint256 betAmount = game.betAmount;
        game.status = GameStatus.Completed;
        
        playerBalances[msg.sender] += betAmount;
        
        emit GameAbandoned(_gameId, msg.sender, betAmount);
    }

    // Rejoindre une partie existante
    function joinGame(uint256 _gameId) external payable {
        Game storage game = games[_gameId];
        require(game.player2 == address(0), "Game already has a second player");
        require(msg.value == game.betAmount, "Incorrect bet amount");
        require(game.status == GameStatus.Created, "Game not available");

        game.player2 = msg.sender;
        game.status = GameStatus.Launched;
        game.launchedAt = block.timestamp;

        emit GameJoined(_gameId, msg.sender);
        emit GameLaunched(_gameId, msg.sender);
    }

    // Commit du choix (hachage avec un secret)
    function commitChoice(uint256 _gameId, bytes32 _commitment) external {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Launched, "Game not ready for commitments");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player in this game");
        
        if (msg.sender == game.player1) {
            require(game.player1Commitment == 0x0, "Player1 already committed");
            game.player1Commitment = _commitment;
        } else {
            require(game.player2Commitment == 0x0, "Player2 already committed");
            game.player2Commitment = _commitment;
        }

        // Passer au statut Committed si les deux joueurs ont commit
        if (game.player1Commitment != 0x0 && game.player2Commitment != 0x0) {
            game.status = GameStatus.Committed;
        }

        emit CommitmentMade(_gameId, msg.sender);
    }

    // Révéler le choix
    function revealChoice(uint256 _gameId, Choice _choice, bytes32 _salt) external {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Committed, "Cannot reveal at this stage");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player");
        
        // Vérifier la validité du choix révélé
        bytes32 commitment = keccak256(abi.encode(_choice, _salt));
        
        if (msg.sender == game.player1) {
            require(commitment == game.player1Commitment, "Invalid reveal for player1");
            game.player1Choice = _choice;
        } else {
            require(commitment == game.player2Commitment, "Invalid reveal for player2");
            game.player2Choice = _choice;
        }

        emit ChoiceRevealed(_gameId, msg.sender, _choice);

        // Vérifier si les deux joueurs ont révélé
        if (game.player1Choice != Choice.None && game.player2Choice != Choice.None) {
            resolveGame(_gameId);
        }
    }

    // Résolution du jeu
    function resolveGame(uint256 _gameId) private {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Committed, "Game already resolved");

        address winner;
        uint256 totalBet = game.betAmount * 2;
        uint256 fees = (totalBet * FEE_PERCENTAGE) / 100;
        uint256 winnings = totalBet - fees;

        // Logique de détermination du gagnant
        if (game.player1Choice == game.player2Choice) {
            // Match nul : remboursement intégral
            playerBalances[game.player1] += game.betAmount;
            playerBalances[game.player2] += game.betAmount;
        } else if (
            (game.player1Choice == Choice.Rock && game.player2Choice == Choice.Scissors) ||
            (game.player1Choice == Choice.Paper && game.player2Choice == Choice.Rock) ||
            (game.player1Choice == Choice.Scissors && game.player2Choice == Choice.Paper)
        ) {
            winner = game.player1;
            playerBalances[winner] += winnings;
            playerBalances[feeCollector] += fees;
        } else {
            winner = game.player2;
            playerBalances[winner] += winnings;
            playerBalances[feeCollector] += fees;
        }

        game.status = GameStatus.Completed;

        if (winner != address(0)) {
            emit GameResolved(_gameId, winner, winnings);
        }
        emit FeesCollected(fees);
    }

    // Résolution de timeout
    function resolveTimeoutGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        // Scénario : La partie est lancée mais pas de commit
        if (game.status == GameStatus.Launched && 
            block.timestamp > game.launchedAt + COMMIT_REVEAL_TIMEOUT) {
            playerBalances[game.player1] += game.betAmount * 2;
            game.status = GameStatus.Completed;
            return;
        }

        // Scénario : Un joueur n'a pas révélé son choix
        if (game.status == GameStatus.Committed) {
            if (game.player1Choice == Choice.None && game.player2Choice != Choice.None) {
                playerBalances[game.player2] += game.betAmount * 2;
                game.status = GameStatus.Completed;
            } else if (game.player2Choice == Choice.None && game.player1Choice != Choice.None) {
                playerBalances[game.player1] += game.betAmount * 2;
                game.status = GameStatus.Completed;
            }
        }
    }

    // Permettre aux joueurs de retirer leurs gains
    function withdrawBalance() external {
        uint256 balance = playerBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        playerBalances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }

    // Fonction pour recevoir de l'ETH
    receive() external payable {}
}