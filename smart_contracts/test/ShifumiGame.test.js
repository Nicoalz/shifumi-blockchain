/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-require-imports */

const { expect } = require('chai');
const { ethers } = require('hardhat');

const FEES = 0.05; // 5%

describe('ShifumiGame', function () {
  let shifumiGame;
  let owner;
  let player1;
  let player2;
  let feeCollector;
  // Bet amounts for testing
  const betAmounts = [
    ethers.parseEther('0.001'),
    ethers.parseEther('0.01'),
    ethers.parseEther('0.1'),
    ethers.parseEther('1'),
  ];

  // Enum mapping for choices
  const Choice = {
    None: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3,
  };

  // Enum mapping for game status
  const GameStatus = {
    Created: 0,
    Launched: 1,
    Committed: 2,
    Revealed: 3,
    Completed: 4,
  };

  // Helper function to create commitment
  function createCommitment(choice, salt) {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint8', 'bytes32'],
        [choice, ethers.encodeBytes32String(salt)],
      ),
    );
  }

  beforeEach(async function () {
    const [_owner, _player1, _player2, _feeCollector] =
      await ethers.getSigners();
    owner = _owner;
    player1 = _player1;
    player2 = _player2;
    feeCollector = _feeCollector;

    const ShifumiGameFactory = await ethers.getContractFactory('ShifumiGame');
    shifumiGame = await ShifumiGameFactory.deploy(feeCollector.address);
    await shifumiGame.waitForDeployment();
  });

  describe('Game Creation', function () {
    it('Should allow creating a game with valid bet amounts', async function () {
      for (const betAmount of betAmounts) {
        await expect(
          shifumiGame.connect(player1).createGame({ value: betAmount }),
        ).to.emit(shifumiGame, 'GameCreated');
      }
    });

    it('Should reject game creation with invalid bet amount', async function () {
      await expect(
        shifumiGame
          .connect(player1)
          .createGame({ value: ethers.parseEther('0.005') }),
      ).to.be.revertedWith('Invalid bet amount');
    });
  });

  describe('Game Joining', function () {
    let gameId;

    beforeEach(async function () {
      await shifumiGame.connect(player1).createGame({ value: betAmounts[0] });
      gameId = 1;
    });

    it('Should allow joining an available game', async function () {
      await expect(
        shifumiGame.connect(player2).joinGame(gameId, { value: betAmounts[0] }),
      ).to.emit(shifumiGame, 'GameJoined');
    });

    it('Should reject joining with incorrect bet amount', async function () {
      await expect(
        shifumiGame.connect(player2).joinGame(gameId, { value: betAmounts[1] }),
      ).to.be.revertedWith('Incorrect bet amount');
    });
  });

  describe('Commitment and Reveal', function () {
    let gameId;

    beforeEach(async function () {
      await shifumiGame.connect(player1).createGame({ value: betAmounts[0] });
      gameId = 1;

      await shifumiGame
        .connect(player2)
        .joinGame(gameId, { value: betAmounts[0] });
    });

    it('Should allow commitment and reveal', async function () {
      const salt1 = 'salt1';
      const salt2 = 'salt2';
      const commitment1 = createCommitment(Choice.Rock, salt1);
      const commitment2 = createCommitment(Choice.Paper, salt2);

      // Commit choices
      await shifumiGame.connect(player1).commitChoice(gameId, commitment1);
      await shifumiGame.connect(player2).commitChoice(gameId, commitment2);

      // Reveal choices
      await shifumiGame
        .connect(player1)
        .revealChoice(gameId, Choice.Rock, ethers.encodeBytes32String(salt1));
      await shifumiGame
        .connect(player2)
        .revealChoice(gameId, Choice.Paper, ethers.encodeBytes32String(salt2));
    });
  });

  describe('Game Resolution', function () {
    let gameId;
    const salt1 = 'salt1';
    const salt2 = 'salt2';

    beforeEach(async function () {
      await shifumiGame.connect(player1).createGame({ value: betAmounts[0] });
      gameId = 1;

      await shifumiGame
        .connect(player2)
        .joinGame(gameId, { value: betAmounts[0] });
    });

    it('Should resolve game with player1 winning', async function () {
      const commitment1 = createCommitment(Choice.Rock, salt1);
      const commitment2 = createCommitment(Choice.Scissors, salt2);

      // Commit choices
      await shifumiGame.connect(player1).commitChoice(gameId, commitment1);
      await shifumiGame.connect(player2).commitChoice(gameId, commitment2);

      // Reveal choices
      await shifumiGame
        .connect(player1)
        .revealChoice(gameId, Choice.Rock, ethers.encodeBytes32String(salt1));
      const revealTx = await shifumiGame
        .connect(player2)
        .revealChoice(
          gameId,
          Choice.Scissors,
          ethers.encodeBytes32String(salt2),
        );

      await expect(revealTx).to.emit(shifumiGame, 'GameResolved');

      // Check balances
      const player1Balance = await shifumiGame.playerBalances(player1.address);
      const player2Balance = await shifumiGame.playerBalances(player2.address);
      const total = Number(betAmounts[0].toString()) * 2;
      const fees = total * FEES;
      const expectedBalance1 = total - fees;

      expect(player1Balance).to.equal(ethers.toBigInt(expectedBalance1));
    });

    it('Should handle draw scenario', async function () {
      const commitment1 = createCommitment(Choice.Rock, salt1);
      const commitment2 = createCommitment(Choice.Rock, salt2);

      // Commit choices
      await shifumiGame.connect(player1).commitChoice(gameId, commitment1);
      await shifumiGame.connect(player2).commitChoice(gameId, commitment2);

      // Reveal choices
      const revealTx = await shifumiGame
        .connect(player1)
        .revealChoice(gameId, Choice.Rock, ethers.encodeBytes32String(salt1));
      await shifumiGame
        .connect(player2)
        .revealChoice(gameId, Choice.Rock, ethers.encodeBytes32String(salt2));

      // Check balances (both players should get their bet back)
      const player1Balance = await shifumiGame.playerBalances(player1.address);
      const player2Balance = await shifumiGame.playerBalances(player2.address);
      expect(player1Balance).to.equal(betAmounts[0]);
      expect(player2Balance).to.equal(betAmounts[0]);
    });
  });

  describe('Timeout Scenarios', function () {
    let gameId;

    beforeEach(async function () {
      await shifumiGame.connect(player1).createGame({ value: betAmounts[0] });

      gameId = 1;

      await shifumiGame
        .connect(player2)
        .joinGame(gameId, { value: betAmounts[0] });
    });

    it('Should allow resolving game if no commitment made', async function () {
      // Increase time to trigger timeout
      await ethers.provider.send('evm_increaseTime', [25 * 60 * 60]); // 25 hours
      await ethers.provider.send('evm_mine', []);
      await shifumiGame.connect(player1).resolveTimeoutGame(gameId);

      const gameStatus = await shifumiGame.games(gameId);
      expect(gameStatus.status).to.equal(GameStatus.Completed);
    });

    it('Should allow abandoning game if not joined', async function () {
      // Create another game and increase time
      const tx = await shifumiGame
        .connect(player1)
        .createGame({ value: betAmounts[0] });
      await tx.wait();
      const newGameId = 2;

      await shifumiGame.connect(player1).abandonGame(newGameId);

      const gameStatus = await shifumiGame.games(newGameId);
      expect(gameStatus.status).to.equal(GameStatus.Completed);
    });
  });

  describe('Game Listing', function () {
    beforeEach(async function () {
      // Create multiple games
      await shifumiGame.connect(player1).createGame({ value: betAmounts[0] });
      await shifumiGame.connect(player2).createGame({ value: betAmounts[1] });
    });

    it('Should return available games', async function () {
      const [gameIds, games] = await shifumiGame.getAvailableGames();

      expect(gameIds.length).to.be.greaterThan(0);
      expect(games.length).to.equal(gameIds.length);
    });

    it('Should return games by status', async function () {
      const [gameIds, games] = await shifumiGame.getGamesByStatus(
        GameStatus.Created,
      );

      expect(gameIds.length).to.equal(2);
      expect(games.length).to.equal(2);
    });
  });
});
