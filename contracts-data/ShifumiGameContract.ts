// Copy and export address & abi
import { type Address } from 'viem';
import { chainIds } from '../config/wagmiProvider';
import { TContract } from './types';

const shifumiContractAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_feeCollector', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum ShifumiGame.Choice',
        name: 'choice',
        type: 'uint8',
      },
    ],
    name: 'ChoiceRevealed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
    ],
    name: 'CommitmentMade',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'FeesCollected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'refundAmount',
        type: 'uint256',
      },
    ],
    name: 'GameAbandoned',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'player1',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'betAmount',
        type: 'uint256',
      },
    ],
    name: 'GameCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'player2',
        type: 'address',
      },
    ],
    name: 'GameJoined',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'player2',
        type: 'address',
      },
    ],
    name: 'GameLaunched',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'winnings',
        type: 'uint256',
      },
    ],
    name: 'GameResolved',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_gameId', type: 'uint256' }],
    name: 'abandonGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'activeGameIds',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_gameId', type: 'uint256' },
      { internalType: 'bytes32', name: '_commitment', type: 'bytes32' },
    ],
    name: 'commitChoice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'createGame',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeCollector',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gameCounter',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'games',
    outputs: [
      { internalType: 'address', name: 'player1', type: 'address' },
      { internalType: 'address', name: 'player2', type: 'address' },
      { internalType: 'uint256', name: 'betAmount', type: 'uint256' },
      { internalType: 'bytes32', name: 'player1Commitment', type: 'bytes32' },
      { internalType: 'bytes32', name: 'player2Commitment', type: 'bytes32' },
      {
        internalType: 'enum ShifumiGame.Choice',
        name: 'player1Choice',
        type: 'uint8',
      },
      {
        internalType: 'enum ShifumiGame.Choice',
        name: 'player2Choice',
        type: 'uint8',
      },
      {
        internalType: 'enum ShifumiGame.GameStatus',
        name: 'status',
        type: 'uint8',
      },
      { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
      { internalType: 'uint256', name: 'launchedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAvailableGames',
    outputs: [
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      {
        components: [
          { internalType: 'address', name: 'player1', type: 'address' },
          { internalType: 'address', name: 'player2', type: 'address' },
          { internalType: 'uint256', name: 'betAmount', type: 'uint256' },
          {
            internalType: 'bytes32',
            name: 'player1Commitment',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'player2Commitment',
            type: 'bytes32',
          },
          {
            internalType: 'enum ShifumiGame.Choice',
            name: 'player1Choice',
            type: 'uint8',
          },
          {
            internalType: 'enum ShifumiGame.Choice',
            name: 'player2Choice',
            type: 'uint8',
          },
          {
            internalType: 'enum ShifumiGame.GameStatus',
            name: 'status',
            type: 'uint8',
          },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
          { internalType: 'uint256', name: 'launchedAt', type: 'uint256' },
        ],
        internalType: 'struct ShifumiGame.Game[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum ShifumiGame.GameStatus',
        name: '_status',
        type: 'uint8',
      },
    ],
    name: 'getGamesByStatus',
    outputs: [
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      {
        components: [
          { internalType: 'address', name: 'player1', type: 'address' },
          { internalType: 'address', name: 'player2', type: 'address' },
          { internalType: 'uint256', name: 'betAmount', type: 'uint256' },
          {
            internalType: 'bytes32',
            name: 'player1Commitment',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'player2Commitment',
            type: 'bytes32',
          },
          {
            internalType: 'enum ShifumiGame.Choice',
            name: 'player1Choice',
            type: 'uint8',
          },
          {
            internalType: 'enum ShifumiGame.Choice',
            name: 'player2Choice',
            type: 'uint8',
          },
          {
            internalType: 'enum ShifumiGame.GameStatus',
            name: 'status',
            type: 'uint8',
          },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
          { internalType: 'uint256', name: 'launchedAt', type: 'uint256' },
        ],
        internalType: 'struct ShifumiGame.Game[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_gameId', type: 'uint256' }],
    name: 'joinGame',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'playerBalances',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_gameId', type: 'uint256' }],
    name: 'resolveTimeoutGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_gameId', type: 'uint256' },
      {
        internalType: 'enum ShifumiGame.Choice',
        name: '_choice',
        type: 'uint8',
      },
      { internalType: 'bytes32', name: '_salt', type: 'bytes32' },
    ],
    name: 'revealChoice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];

const ShifumiContractAddressBaseSepolia =
  '0xB5d3E134dA45B0eC05e7aC5fd054e700a76dfE80' as Address;

export const shifumiContract: TContract = {
  abi: shifumiContractAbi,
  address: {
    [chainIds.baseSepolia]: ShifumiContractAddressBaseSepolia, // chainId => address
  },
};
