'use client';

import CreateGame from '@/components/game/CreateGame';
import JoinGame from '@/components/game/JoinGame';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
// import { Game } from '@/types/game';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Address } from 'viem';
import { useChainId, useReadContract } from 'wagmi';

const HomeScreen: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<
    'create' | 'join' | null
  >(null);

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-center">
        Web3 Rock-Paper-Scissors
      </h1>

      {activeComponent === null && (
        <div className="flex justify-center space-x-4">
          <Button onClick={() => setActiveComponent('create')}>
            Create Game
          </Button>
          <Button onClick={() => setActiveComponent('join')}>Join Game</Button>
        </div>
      )}

      {activeComponent === 'create' && (
        <CreateGame onBack={() => setActiveComponent(null)} />
      )}
      {activeComponent === 'join' && (
        <JoinGame onBack={() => setActiveComponent(null)} />
      )}
    </div>
  );
};

export default HomeScreen;
