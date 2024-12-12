import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useEffect } from 'react';
import { useState } from 'react';
import { Address } from 'viem';
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { Game } from '@/contracts-data';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useRouter } from 'next/router';
import { shifumiContract } from '@/contracts-data/ShifumiGameContract';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

interface JoinGameProps {
  onBack: () => void;
}

export default function JoinGame({ onBack }: JoinGameProps) {
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [contractAddress, setContractAddress] = useState<
    `0x${string}` | undefined
  >();
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [joiningGame, setJoiningGame] = useState<Game | null>(null);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const router = useRouter();

  const { address: userAddress } = useAccount();

  const handleClick = async ({ game }: { game: Game }) => {
    setIsJoiningGame(true);
    setJoiningGame(game);
    console.log({ game });

    handleJoinGame({
      id: game.gameId,
      betAmount: game.betAmount,
    });
  };

  const {
    writeContract,
    error,
    isPending,
    isSuccess,
    data: txHash,
  } = useWriteContract();

  const { data: confirmationData } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (confirmationData && joiningGame) {
      router.push(`/game/${joiningGame.gameId}`);
    }
  }, [isPending, isSuccess, confirmationData]);

  const handleJoinGame = ({
    id,
    betAmount,
  }: {
    id: number;
    betAmount: number;
  }) => {
    if (!contractAddress) return;

    writeContract({
      abi: shifumiContract.abi,
      address: contractAddress,
      functionName: 'joinGame',
      args: [id],
      value: ethers.toBigInt(betAmount.toString()),
    });
  };

  const chainId = useChainId();

  const { refetch: getAvailableGames } = useReadContract({
    abi: shifumiContract.abi,
    address: contractAddress,
    functionName: 'getAvailableGames',
  });

  useEffect(() => {
    setIsGameLoading(true);
    if (!contractAddress) {
      setIsGameLoading(false);
      return;
    }
    const fetchContract = async () => {
      const [gameIds, games] = (await getAvailableGames()).data as unknown[];

      if (!gameIds || !games) {
        setIsGameLoading(false);
        return;
      }

      setAvailableGames(games as Game[]);

      setIsGameLoading(false);
    };
    fetchContract();
  }, [contractAddress, getAvailableGames]);

  // Set contract address based on chainId
  useEffect(() => {
    if (!chainId) return;
    const addressOfChainId = shifumiContract.address[chainId];
    setContractAddress(addressOfChainId);
  }, [chainId]);

  useEffect(() => {
    console.log({ error });
  }, [error]);
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Join a Game</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game ID</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Bet Amount</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableGames.map(game => (
              <TableRow key={game.gameId}>
                <TableCell>{game.gameId.toString()}</TableCell>
                <TableCell>{game.player1}</TableCell>
                <TableCell>{ethers.formatEther(game.betAmount)} ETH</TableCell>
                <TableCell>
                  <Button onClick={() => handleClick({ game })}>
                    Join Game
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </CardFooter>
    </Card>
  );
}
