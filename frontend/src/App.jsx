import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';

import ConstituencyTable from './components/ConstituencyTable';
import BattleSpotlight from './components/BattleSpotlight';
import Header from './components/Header';
import HeadlineBoard from './components/HeadlineBoard';
import HotSeatsPanel from './components/HotSeatsPanel';
import LoadingScreen from './components/LoadingScreen';
import PartyCard from './components/PartyCard';
import SeatDistributionBar from './components/SeatDistributionBar';
import SummaryBar from './components/SummaryBar';
import Ticker from './components/Ticker';
import VerdictRail from './components/VerdictRail';
import VoteShareStrip from './components/VoteShareStrip';
import { enrichConstituency, enrichParty } from './data/leaderData';

const SOCKET_URL = 'http://localhost:3001';
const MAJOR_BLOCS = [
  {
    key: 'TVK',
    code: 'TVK',
    title: 'TVK',
    tamil: 'தவக',
    leaderTamil: 'விஜய்',
    color: '#FF6600',
    codes: ['TVK'],
    leaderImage: '/leaders/tvk-vijay.png',
    symbolImage: '/symbols/tvk.png'
  },
  {
    key: 'DMK_ALLIANCE',
    code: 'DMA',
    title: 'DMK கூட்டணி',
    tamil: 'திமுக கூட்டணி',
    leaderTamil: 'ஸ்டாலின்',
    color: '#E32636',
    codes: ['DMK', 'INC', 'VCK', 'CPI', 'CPI(M)'],
    leaderImage: '/leaders/dmk-stalin.png',
    symbolImage: '/symbols/dmk-alliance.png'
  },
  {
    key: 'ADMK_ALLIANCE',
    code: 'ADA',
    title: 'ADMK கூட்டணி',
    tamil: 'அதிமுக கூட்டணி',
    leaderTamil: 'எடப்பாடி',
    color: '#006400',
    codes: ['ADMK', 'BJP', 'PMK', 'DMDK', 'PT'],
    leaderImage: '/leaders/admk-eps.png',
    symbolImage: '/symbols/admk-alliance.png'
  },
  {
    key: 'NTK',
    code: 'NTK',
    title: 'NTK',
    tamil: 'நாதக',
    leaderTamil: 'சீமான்',
    color: '#2E8B57',
    codes: ['NTK'],
    leaderImage: '/leaders/ntk-seeman.png',
    symbolImage: '/symbols/ntk.png'
  }
];

const STAR_CONSTITUENCY_NAMES = [
  'KOLATHUR',
  'EDAPPADI',
  'CHEPAUK-TRIPLICANE',
  'COIMBATORE (SOUTH)',
  'TIRUPPARANKUNDRAM',
  'THIRUVALLUR',
  'AVANASHI (SC)',
  'VELACHERY',
  'HARBOUR',
  'THOUSAND LIGHTS'
];

function getPseudoRandomOrder(seats) {
  return [...seats].sort((first, second) => {
    const firstWeight = (first.number * 37 + 11) % 241;
    const secondWeight = (second.number * 37 + 11) % 241;
    return firstWeight - secondWeight;
  });
}

function getRotatingSlice(items, start, count) {
  if (!items.length) {
    return [];
  }

  return Array.from({ length: count }, (_, offset) => items[(start + offset) % items.length]).filter(Boolean);
}

export default function App() {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [flashToken, setFlashToken] = useState(0);
  const [seatRotationIndex, setSeatRotationIndex] = useState(0);
  const [storyRotationIndex, setStoryRotationIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialData() {
      try {
        const response = await fetch('/api/results');

        if (!response.ok) {
          return;
        }

        const payload = await response.json();

        if (!cancelled) {
          setData(payload);
        }
      } catch (error) {
        console.warn('[frontend] Initial results fetch failed:', error);
      }
    }

    fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0.5
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('results', (payload) => {
      setData((current) => {
        const isFreshUpdate =
          current &&
          (current.updatedAt !== payload.updatedAt || current.seatsCounted !== payload.seatsCounted);

        if (isFreshUpdate) {
          setShowToast(true);
          setFlashToken(Date.now());
        }

        return payload;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!showToast) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowToast(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    const seatTimer = window.setInterval(() => {
      setSeatRotationIndex((current) => current + 1);
    }, 10000);

    const storyTimer = window.setInterval(() => {
      setStoryRotationIndex((current) => current + 1);
    }, 5000);

    return () => {
      window.clearInterval(seatTimer);
      window.clearInterval(storyTimer);
    };
  }, []);

  const topParties = useMemo(() => {
    const voteLookup = new Map((data?.voteShare ?? []).map((item) => [item.code, item]));

    return (data?.parties ?? []).map((party) => {
      const voteData = voteLookup.get(party.code);

      return enrichParty({
        ...party,
        totalVotes: voteData?.totalVotes ?? 0,
        votePct: voteData?.votePct ?? party.pct
      });
    });
  }, [data]);

  const blocCards = useMemo(
    () =>
      MAJOR_BLOCS.map((bloc) => {
        const blocParties = topParties.filter((party) => bloc.codes.includes(party.code));

        const seats = blocParties.reduce((sum, party) => sum + party.total, 0);
        const won = blocParties.reduce((sum, party) => sum + party.won, 0);
        const leading = blocParties.reduce((sum, party) => sum + party.leading, 0);
        const votePct = blocParties.reduce((sum, party) => sum + (party.votePct ?? 0), 0);

        return {
          ...bloc,
          seats,
          won,
          leading,
          votePct
        };
      }),
    [topParties]
  );
  const allDetailedSeats = useMemo(() => {
    const allSeats = (data?.constituencies ?? []).map(enrichConstituency);
    const prioritized = STAR_CONSTITUENCY_NAMES.map((name) =>
      allSeats.find((seat) => seat.name === name)
    ).filter(Boolean);
    const extras = allSeats
      .filter((seat) => !STAR_CONSTITUENCY_NAMES.includes(seat.name))
      .sort((first, second) => first.margin - second.margin)
      .slice(0, 6);

    return [...prioritized, ...getPseudoRandomOrder(extras), ...getPseudoRandomOrder(allSeats)].filter(
      (seat, index, array) => array.findIndex((entry) => entry?.number === seat?.number) === index
    );
  }, [data]);
  const leadListSeats = useMemo(
    () =>
      getRotatingSlice(
        allDetailedSeats,
        (seatRotationIndex * 10) % Math.max(allDetailedSeats.length, 1),
        10
      ).sort((first, second) => second.leaderVotes - first.leaderVotes),
    [allDetailedSeats, seatRotationIndex]
  );
  const rightPanelSeats = useMemo(
    () => getRotatingSlice(allDetailedSeats, (seatRotationIndex * 2) % Math.max(allDetailedSeats.length, 1), 2),
    [allDetailedSeats, seatRotationIndex]
  );
  const focusSeat = useMemo(
    () => allDetailedSeats[seatRotationIndex % Math.max(allDetailedSeats.length, 1)] || null,
    [allDetailedSeats, seatRotationIndex]
  );
  const storySlides = useMemo(() => {
    const topLeader = topParties[0];
    const runnerUp = topParties[1];
    const closestSeat = [...allDetailedSeats].sort((first, second) => first.margin - second.margin)[0];
    const biggestLead = [...allDetailedSeats].sort((first, second) => second.margin - first.margin)[0];

    return [
      {
        key: 'headline',
        kicker: 'ECI அதிகாரப்பூர்வ நிலவரம்',
        title: data?.headline?.title || 'தமிழ்நாடு தேர்தல் 2026',
        body: data?.headline?.subtitle || 'நேரடி எண்ணிக்கை தொடர்கிறது.',
        metaLeft: `எண்ணப்பட்டவை ${data?.seatsCounted || 0}/${data?.totalSeats || 234}`,
        metaRight: `புதுப்பிப்பு ${data?.updatedAt || ''}`
      },
      topLeader
        ? {
            key: 'leader-party',
            kicker: 'முதன்மை முன்னிலை',
            title: `${topLeader.tamil} ${topLeader.total} இடங்களில் முன்னிலை`,
            body: `${topLeader.leaderTamil} தலைமையிலான அணிக்கு ${topLeader.votePct?.toFixed(1)}% வாக்கு பங்கு.`,
            metaLeft: `${topLeader.code} · வெற்றி ${topLeader.won}`,
            metaRight: `முன்னிலை ${topLeader.leading}`
          }
        : null,
      runnerUp
        ? {
            key: 'runner',
            kicker: 'இரண்டாம் நிலை',
            title: `${runnerUp.tamil} தொடர்ந்து துரத்துகிறது`,
            body: `${runnerUp.leaderTamil} அணிக்கு தற்போது ${runnerUp.total} இடங்கள் கிடைத்துள்ளன.`,
            metaLeft: `${runnerUp.code} · வாக்கு ${runnerUp.votePct?.toFixed(1)}%`,
            metaRight: `வெற்றி ${runnerUp.won}`
          }
        : null,
      closestSeat
        ? {
            key: 'closest-seat',
            kicker: 'கடும் போட்டி',
            title: `${closestSeat.name} தொகுதியில் நெருக்கடி போட்டி`,
            body: `${closestSeat.leadingCandidate} தற்போது ${closestSeat.leadingPartyTamil} சார்பில் முன்னிலை. வித்தியாசம் ${closestSeat.margin}.`,
            metaLeft: `${closestSeat.leadingPartyCode} vs ${closestSeat.trailingPartyCode}`,
            metaRight: `${closestSeat.candidateRoundStatus || closestSeat.roundStatus || 'நேரலை'}`
          }
        : null,
      biggestLead
        ? {
            key: 'biggest-lead',
            kicker: 'அதிக வித்தியாசம்',
            title: `${biggestLead.name} தொகுதியில் தெளிவான முன்னிலை`,
            body: `${biggestLead.leadingCandidate} ${biggestLead.margin} வாக்குகள் வித்தியாசத்தில் முன்னிலை வகிக்கிறார்.`,
            metaLeft: `${biggestLead.leadingPartyTamil}`,
            metaRight: `#${biggestLead.number}`
          }
        : null
    ].filter(Boolean);
  }, [allDetailedSeats, data, topParties]);
  const activeStory = useMemo(
    () => storySlides[storyRotationIndex % Math.max(storySlides.length, 1)] || null,
    [storySlides, storyRotationIndex]
  );

  if (!data) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-shell min-h-screen overflow-x-hidden pb-28 text-white">
      <section className="broadcast-stage">
        <Header data={data} connected={isConnected} />

        <main className="mx-auto flex w-full max-w-[1840px] flex-1 flex-col gap-4 px-4 pb-6 pt-3 sm:px-6 lg:px-8">
          <VoteShareStrip blocks={blocCards} />

          <div className="broadcast-middle-grid-1080">
            <HotSeatsPanel contests={leadListSeats} />
            <HeadlineBoard slide={activeStory} />
            <BattleSpotlight seats={rightPanelSeats} />
          </div>

          <VerdictRail
            seat={focusSeat}
            totalSeats={data.totalSeats}
            seatsCounted={data.seatsCounted}
            majority={data.majority}
          />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`status-pill ${isConnected ? 'status-pill-live' : 'status-pill-offline'}`}
            >
              {isConnected ? '🟢 நேரலை இணைப்பு' : '🔴 இணைப்பு துண்டிக்கப்பட்டது - மீண்டும் இணைக்கிறோம்...'}
            </motion.div>

            <motion.a
              href="#deep-dive"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="detail-jump"
            >
              முழு விவரங்கள் கீழே ↓
            </motion.a>
          </div>
        </main>
      </section>

      <section id="deep-dive" className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[var(--color-gold)]">
              விரிவான பகுப்பு
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">கட்சிவாரி முழு நிலவரம்</h2>
          </div>
          <p className="max-w-xl text-sm text-[var(--color-muted)]">
            முதல் திரை யூடியூப் நேரலைக்காக அமைக்கப்பட்டுள்ளது. இதற்கு கீழே உள்ள பகுதி விரிவான விவரங்களுக்கு.
          </p>
        </div>

        <SummaryBar data={data} />

        <SeatDistributionBar
          parties={topParties}
          total={data.totalSeats}
          majority={data.majority}
        />

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {topParties.map((party, index) => (
            <PartyCard
              key={party.code}
              party={party}
              majority={data.majority}
              index={index}
              isLeader={party.code === data.leadingParty}
              flashToken={flashToken}
            />
          ))}
        </section>

        <ConstituencyTable constituencies={data.constituencies ?? []} />
      </section>

      <Ticker parties={topParties} total={data.totalSeats} majority={data.majority} />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="toast-pop"
          >
            ⚡ புதுப்பிக்கப்பட்டது!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
