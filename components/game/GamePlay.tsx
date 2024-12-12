import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { LoaderCircle } from 'lucide-react';
import Loader from '../Loader';
import { ethers } from 'ethers';
import { ChoiceEnum, Game, GameStatusEnum } from '@/contracts-data';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { shifumiContract } from '@/contracts-data/ShifumiGameContract';
import { toast } from '@/hooks/use-toast';

export default function GamePlay() {
  const router = useRouter();
  const { id: gameId } = router.query;
  const [choice, setChoice] = useState('');
  const [salt, setSalt] = useState('');
  const [currentGame, setCurrentGame] = useState<Game | undefined>();
  const [contractAddress, setContractAddress] = useState<
    `0x${string}` | undefined
  >();
  const [isGameLoading, setIsGameLoading] = useState(true);
  const { chainId, address: userAddress } = useAccount();

  const {
    writeContract,
    isPending,
    error,
    isSuccess,
    data: txHash,
  } = useWriteContract();

  useEffect(() => {
    if (!chainId) return;
    const addressOfChainId = shifumiContract.address[chainId];
    setContractAddress(addressOfChainId);
  }, [chainId]);

  const commitChoice = async () => {
    if (!contractAddress) return;
    const commitment = createCommitment(parseInt(choice), salt);
    writeContract({
      abi: shifumiContract.abi,
      address: contractAddress,
      functionName: 'commitChoice',
      args: [currentGame?.gameId, commitment],
    });
  };

  useEffect(() => {
    console.log({ isPending, error, isSuccess, txHash });
  }, [isPending, error, isSuccess, txHash]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Transaction sent',
        description: 'Your transaction has been sent to the blockchain',
        onClick: () => {
          window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank');
        },
      });
    }
  }, [isSuccess, toast]);

  const revealChoice = async () => {};

  function createCommitment(choice: ChoiceEnum, salt: string) {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint8', 'bytes32'],
        [choice, ethers.encodeBytes32String(salt)],
      ),
    );
  }

  const { refetch: getCurrentGame } = useReadContract({
    abi: shifumiContract.abi,
    address: contractAddress,
    functionName: 'games',
    args: [gameId],
  });

  useEffect(() => {
    setIsGameLoading(true);
    if (!contractAddress) {
      setIsGameLoading(false);
      return;
    }
    const fetchContract = async () => {
      const { data } = (await getCurrentGame()) as any;
      console.log({ data });

      const formattedGame: Game = {
        gameId: data[0],
        player1: data[1],
        player2: data[2],
        betAmount: data[3],
        player1Commitment: data[4],
        player2Commitment: data[5],
        player1Choice: data[6],
        player2Choice: data[7],
        status: data[8],
        createdAt: data[9],
        launchedAt: data[10],
      };

      setCurrentGame(formattedGame);

      setIsGameLoading(false);
    };
    fetchContract();
  }, [contractAddress, getCurrentGame]);

  if (isGameLoading) {
    return <Loader />;
  }

  // if (
  //   currentGame?.player1 === userAddress &&
  //   currentGame?.player1 &&
  //   !currentGame.player2Choice
  // ) {
  //   return (
  //     <h3>
  //       Waiting for player 2 to commit their choice. You can only commit your
  //       choice once.
  //     </h3>
  //   );
  // }

  // if (
  //   currentGame?.player2 === userAddress &&
  //   currentGame?.player2 &&
  //   !currentGame.player1Choice
  // ) {
  //   return (
  //     <h3>
  //       Waiting for player 2 to commit their choice. You can only commit your
  //       choice once.
  //     </h3>
  //   );
  // }

  // if (currentGame?.status === GameStatusEnum.Committed) {
  //   return (
  //     <h3>
  //       Both players have committed their choice. Waiting for the reveal phase.
  //     </h3>
  //   );
  // }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Game Play</h2>
      <p>Game Status: {currentGame?.status}</p>
      <div className="space-y-2">
        <Label htmlFor="choice">Your Choice:</Label>
        <Select value={choice} onValueChange={setChoice}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select your choice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Rock</SelectItem>
            <SelectItem value="2">Paper</SelectItem>
            <SelectItem value="3">Scissors</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="salt">Salt:</Label>
        <Input
          type="text"
          id="salt"
          value={salt}
          onChange={e => setSalt(e.target.value)}
          placeholder="Enter a password to hash your choice"
        />
      </div>
      {currentGame?.status && (
        <>
          <Button
            onClick={commitChoice}
            disabled={GameStatusEnum[currentGame?.status] !== 'Launched'}
          >
            Commit Choice
          </Button>
          <Button
            onClick={revealChoice}
            disabled={GameStatusEnum[currentGame?.status] !== 'Committed'}
          >
            Reveal Choice
          </Button>
        </>
      )}
    </div>
  );
}
