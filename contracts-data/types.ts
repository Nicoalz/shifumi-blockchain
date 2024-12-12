import { type Address } from 'viem';
export interface TContract {
  abi: unknown[];
  address: Record<number, Address>;
}

export interface Ticket {
  id: number;
  lotteryId: number;
  owner: Address;
  isWinning: boolean;
}

export interface Lottery {
  id: number;
  name: string;
  creator: Address;
  isActive: boolean;
  winningTicketId: number;
  tickets: Ticket[];
}

// export type Choice = 'None' | 'Rock' | 'Paper' | 'Scissors';

export enum ChoiceEnum {
  None = 0,
  Rock = 1,
  Paper = 2,
  Scissors = 3,
}

export type GameStatus =
  | 'Created'
  | 'Launched'
  | 'Committed'
  | 'Revealed'
  | 'Completed';

export enum GameStatusEnum {
  Created = 0,
  Launched = 1,
  Committed = 2,
  Revealed = 3,
  Completed = 4,
}

export interface Game {
  gameId: number;
  player1: Address;
  player2?: Address;
  betAmount: number;
  player1Commitment?: string;
  player2Commitment?: string;
  player1Choice?: ChoiceEnum;
  player2Choice?: ChoiceEnum;
  status: GameStatusEnum;
  createdAt: string;
  launchedAt: string;
}
