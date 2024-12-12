import GamePlay from '@/components/game/GamePlay';
import LotteryDetailsScreen from '@/screens/LotteryDetailsScreen';
import type { NextPage } from 'next';
import Head from 'next/head';

const LotteryDetails: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lottery Details</title>
        <meta name="description" content="Game Details" />
      </Head>
      <div>
        <GamePlay />
      </div>
    </>
  );
};

export default LotteryDetails;
