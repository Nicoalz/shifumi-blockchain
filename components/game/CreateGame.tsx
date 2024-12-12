'use client';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useAccount, useWriteContract } from 'wagmi';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/use-toast';
import { Address } from 'cluster';
import { shifumiContract } from '@/contracts-data/ShifumiGameContract';
import { useEffect } from 'react';
import { ethers } from 'ethers';

interface CreateGameProps {
  onBack: () => void;
}

export default function CreateGame({ onBack }: CreateGameProps) {
  const [betAmount, setBetAmount] = useState('0.001');

  const [lotteryName, setLotteryName] = useState('');
  const userAccount = useAccount();
  const router = useRouter();
  const { toast } = useToast();

  const {
    writeContract,
    isPending,
    isSuccess,
    data: txHash,
  } = useWriteContract();
  const [contractAddress, setContractAddress] = useState<
    `0x${string}` | undefined
  >();
  const { chainId } = useAccount();

  useEffect(() => {
    if (!chainId) return;
    const addressOfChainId = shifumiContract.address[chainId];
    setContractAddress(addressOfChainId);
  }, [chainId]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Game Created',
        description: 'Your game has been created successfully',
        onClick: () => {
          window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank');
        },
      });
      setLotteryName('');
      onBack();
    }
  }, [isSuccess, toast]);

  const handleCreateGame = () => {
    if (!contractAddress) return;
    writeContract({
      abi: shifumiContract.abi,
      address: contractAddress,
      functionName: 'createGame',
      value: ethers.parseEther(betAmount),
    });
  };

  const { isConnected } = userAccount;

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a New Game</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="betAmount" className="text-sm font-medium">
              Bet Amount:
            </label>
            <Select value={betAmount} onValueChange={setBetAmount}>
              <SelectTrigger>
                <SelectValue placeholder="Select bet amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.001">0.001 ETH</SelectItem>
                <SelectItem value="0.01">0.01 ETH</SelectItem>
                <SelectItem value="0.1">0.1 ETH</SelectItem>
                <SelectItem value="1">1 ETH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleCreateGame}>Create Game</Button>
      </CardFooter>
    </Card>
  );
}
