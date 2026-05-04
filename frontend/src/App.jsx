import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';

import LoadingScreen from './components/LoadingScreen';
import LeaderShowcase from './components/LeaderShowcase';
import ConstituencyTable from './components/ConstituencyTable';
import BattleSpotlight from './components/BattleSpotlight';
import HeadlineBoard from './components/HeadlineBoard';
import { enrichConstituency, enrichParty } from './data/leaderData';

const SOCKET_URL = 'http://localhost:3001';

// Specific parties to show at the top
const TOP_DISPLAY_PARTIES = ['TVK', 'DMK', 'ADMK', 'NTK'];

// Helper: Pick random items
function pickRandom(arr, n) {
  if (!arr || arr.length === 0) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

export default function App() {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [random10, setRandom10] = useState([]);
  const [random2, setRandom2] = useState([]);
  const [bottomConstituency, setBottomConstituency] = useState(null);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [scale, setScale] = useState(1);

  // Calculate scale for responsive fitting
  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY, 1)); // Cap at 1 to not scale up beyond 1920x1080
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Fetch initial data
  useEffect(() => {
    let cancelled = false;

    async function fetchInitialData() {
      try {
        const response = await fetch('/api/results');
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled) setData(payload);
      } catch (error) {
        console.warn('[frontend] Initial fetch failed:', error);
      }
    }

    fetchInitialData();
    return () => { cancelled = true; };
  }, []);

  // Socket.io real-time updates
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('results', (payload) => setData(payload));

    return () => socket.disconnect();
  }, []);

  // Rotate content: Bottom constituency every 10s, Headlines every 5s
  useEffect(() => {
    if (!data || !data.constituencies) return;

    const enrichedSeats = data.constituencies.map(enrichConstituency);

    // Initial randomization
    setRandom10(pickRandom(enrichedSeats, 10));
    setRandom2(pickRandom(enrichedSeats, 2));
    setBottomConstituency(pickRandom(enrichedSeats, 1)[0]);

    // Rotate bottom constituency every 10s
    const bottom10sInterval = setInterval(() => {
      setRandom10(pickRandom(enrichedSeats, 10));
      setRandom2(pickRandom(enrichedSeats, 2));
      setBottomConstituency(pickRandom(enrichedSeats, 1)[0]);
    }, 10000);

    // Rotate headlines every 5s
    const headline5sInterval = setInterval(() => {
      setHeadlineIndex((prev) => prev + 1);
    }, 5000);

    return () => {
      clearInterval(bottom10sInterval);
      clearInterval(headline5sInterval);
    };
  }, [data]);

  // Process parties with vote share
  const topParties = useMemo(() => {
    if (!data) return [];
    const voteLookup = new Map((data?.voteShare ?? []).map((item) => [item.code, item]));

    return (data?.parties ?? [])
      .filter(party => party.code !== 'OTH') // Exclude OTH party
      .map((party) => {
        const voteData = voteLookup.get(party.code);
        return enrichParty({
          ...party,
          totalVotes: voteData?.totalVotes ?? 0,
          votePct: voteData?.votePct ?? party.pct
        });
      });
  }, [data]);

  // Get specific parties for top display (TVK, DMK, ADMK, NTK)
  const topDisplayParties = useMemo(() => {
    const parties = TOP_DISPLAY_PARTIES.map(code => {
      const party = topParties.find(p => p.code === code);
      if (party) return party;
      
      // Return placeholder if party doesn't exist in data
      return {
        code: code,
        tamil: code === 'TVK' ? 'தவக' : code === 'DMK' ? 'திமுக' : code === 'ADMK' ? 'அதிமுக' : 'நாதக',
        leaderTamil: code === 'TVK' ? 'விஜய்' : code === 'DMK' ? 'மு.க. ஸ்டாலின்' : code === 'ADMK' ? 'எடப்பாடி' : 'சீமான்',
        leaderImage: `/leaders/${code.toLowerCase()}-${code === 'TVK' ? 'vijay' : code === 'DMK' ? 'stalin' : code === 'ADMK' ? 'eps' : 'seeman'}.png`,
        symbolImage: `/symbols/${code.toLowerCase()}.png`,
        color: code === 'TVK' ? '#FF6600' : code === 'DMK' ? '#E32636' : code === 'ADMK' ? '#006400' : '#2E8B57',
        total: 0,
        won: 0,
        leading: 0,
        votePct: 0
      };
    });
    return parties;
  }, [topParties]);

  // Leading party info
  const leadingParty = useMemo(() => {
    if (!topParties || topParties.length === 0) return null;
    return topParties[0];
  }, [topParties]);

  // Generate headline slides
  const headlines = useMemo(() => {
    if (!data || !topParties || topParties.length === 0) return [];
    
    const allSeats = (data?.constituencies ?? []).map(enrichConstituency);
    const topLeader = topParties[0];
    const runnerUp = topParties[1];
    const closestSeat = [...allSeats].sort((a, b) => a.margin - b.margin)[0];

    return [
      {
        kicker: 'ECI அதிகாரப்பூர்வ நிலவரம்',
        title: data?.headline?.title || 'தமிழ்நாடு தேர்தல் 2026',
        body: data?.headline?.subtitle || 'நேரடி எண்ணிக்கை தொடர்கிறது',
        meta: `எண்ணப்பட்டவை ${data?.seatsCounted || 0}/${data?.totalSeats || 234}`
      },
      topLeader && {
        kicker: 'முதன்மை முன்னிலை',
        title: `${topLeader.tamil} ${topLeader.total} இடங்களில் முன்னிலை`,
        body: `${topLeader.leaderTamil} அணிக்கு ${topLeader.votePct?.toFixed(1)}% வாக்கு`,
        meta: `வெற்றி ${topLeader.won} · முன்னிலை ${topLeader.leading}`
      },
      runnerUp && {
        kicker: 'இரண்டாம் நிலை',
        title: `${runnerUp.tamil} தொடர்ந்து துரத்துகிறது`,
        body: `${runnerUp.leaderTamil} அணிக்கு ${runnerUp.total} இடங்கள்`,
        meta: `வாக்கு ${runnerUp.votePct?.toFixed(1)}% · வெற்றி ${runnerUp.won}`
      },
      closestSeat && {
        kicker: 'கடும் போட்டி',
        title: `${closestSeat.name} - நெருக்கடி`,
        body: `${closestSeat.leadingCandidate} ${closestSeat.margin} வாக்கு முன்னிலை`,
        meta: `${closestSeat.leadingPartyCode} vs ${closestSeat.trailingPartyCode}`
      }
    ].filter(Boolean);
  }, [data, topParties]);

  const currentHeadline = headlines[headlineIndex % headlines.length];

  if (!data) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white font-sans flex items-center justify-center">
      <div className="w-[1920px] h-[1080px] origin-center" style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }}>
      {/* TOP BAR: TVK, DMK, ADMK, NTK with Leader Images */}
      <section className="h-[160px] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-4 border-orange-500">
        <div className="h-full flex items-stretch">
          {topDisplayParties.map((party, idx) => (
            <div 
              key={party.code}
              className="flex-1 flex items-center gap-4 px-6 border-r-2 border-gray-700 last:border-r-0 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${party.color}15 0%, ${party.color}05 100%)` }}
            >
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 shadow-2xl flex-shrink-0 bg-white"
                   style={{ borderColor: party.color }}>
                {party.leaderImage ? (
                  <img src={party.leaderImage} alt={party.leaderTamil} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black"
                       style={{ backgroundColor: party.color }}>
                    {party.leaderTamil?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {party.symbolImage && (
                    <img src={party.symbolImage} alt={party.code} className="w-8 h-8 object-contain" />
                  )}
                  <span className="text-lg font-black px-3 py-1 rounded-lg text-white" 
                        style={{ backgroundColor: party.color }}>
                    {party.code}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white truncate mb-1">{party.tamil}</h3>
                <p className="text-sm font-bold text-gray-300 truncate">
                  தலைவர்: {party.leaderTamil}
                </p>
                <div className="flex items-baseline gap-3 mt-2">
                  <div className="text-5xl font-black text-white" style={{ color: party.color, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    {party.total}
                  </div>
                  <div className="text-sm font-bold text-gray-300">
                    <span className="text-green-400">வெற்றி {party.won}</span> · 
                    <span className="text-blue-400">முன்னிலை {party.leading}</span>
                  </div>
                </div>
              </div>
              {idx === 0 && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-black">
                  முன்னணி
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT: 3-column layout */}
      <section className="flex h-[860px]">
        {/* LEFT SIDEBAR: Party statistics */}
        <div className="w-[400px] bg-gradient-to-b from-red-50 to-white border-r-4 border-red-300 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-4 shadow-lg">
            <h2 className="text-xl font-black">கட்சிவாரி முழு நிலவரம்</h2>
            <p className="text-xs opacity-90 mt-1">வாக்கு பங்கு மற்றும் இருக்கைகள்</p>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto max-h-[800px] custom-scrollbar">
            {topParties.map((party, idx) => (
              <div 
                key={party.code}
                className="flex items-center gap-3 p-3 rounded-xl border-2 shadow-md hover:shadow-xl transition-all"
                style={{ borderColor: party.color, background: `linear-gradient(90deg, ${party.color}12, white)` }}
              >
                {/* Rank badge */}
                <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg flex items-center justify-center font-black text-lg shadow-lg">
                  {idx + 1}
                </div>
                
                {party.symbolImage && (
                  <img src={party.symbolImage} alt={party.code} className="w-12 h-12 object-contain flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-white px-2 py-1 rounded" 
                          style={{ backgroundColor: party.color }}>
                      {party.code}
                    </span>
                    <span className="text-base font-black text-gray-800 truncate">{party.tamil}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate font-semibold">{party.leaderTamil}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-xs">
                      <span className="font-bold text-gray-600">வாக்கு: </span>
                      <span className="font-black" style={{ color: party.color }}>{party.votePct?.toFixed(1)}%</span>
                    </div>
                    <div className="flex gap-2 text-xs font-semibold">
                      <span className="text-green-600">வெற்றி {party.won}</span>
                      <span className="text-blue-600">முன்னிலை {party.leading}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-4xl font-black" style={{ color: party.color }}>
                    {party.total}
                  </div>
                  <div className="text-xs text-gray-500 font-bold">இருக்கைகள்</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Constituency header */}
          {bottomConstituency && (
            <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white px-6 py-4 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-6">
                <div className="bg-white text-red-700 w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black shadow-xl">
                  <div className="text-xs">தொகுதி</div>
                  <div className="text-3xl">{bottomConstituency.number}</div>
                </div>
                <div>
                  <h2 className="text-4xl font-black mb-1">{bottomConstituency.name}</h2>
                  <p className="text-base opacity-90 font-semibold">நேரடி எண்ணிக்கை முடிவுகள் · தமிழ்நாடு தேர்தல் 2026</p>
                </div>
              </div>
              <div className="text-right bg-white/10 rounded-xl px-6 py-3 backdrop-blur-sm">
                <div className="text-sm font-bold opacity-80">மொத்த வாக்குகள்</div>
                <div className="text-3xl font-black">
                  {(bottomConstituency.candidates || bottomConstituency.topCandidates || [])
                    .reduce((sum, c) => sum + (c.votes || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Battle area with candidate comparison */}
          <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <HeadlineBoard slide={currentHeadline} />
            </div>
            
            {/* Candidate battle */}
            {bottomConstituency && (bottomConstituency.candidates || bottomConstituency.topCandidates) && (
              <div className="mt-4 bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-center text-lg font-black text-gray-700 mb-4 uppercase tracking-wide">முதல் 3 வேட்பாளர்கள்</h3>
                <div className="flex items-center justify-center gap-6">
                  {(bottomConstituency.candidates || bottomConstituency.topCandidates)?.slice(0, 3).map((candidate, idx) => (
                    <div key={idx} className="relative">
                      <div className="text-center">
                        <div 
                          className="w-32 h-40 rounded-2xl overflow-hidden border-4 shadow-2xl mb-3 flex items-center justify-center text-white text-5xl font-black relative"
                          style={{ borderColor: candidate.partyColor || candidate.color, backgroundColor: (candidate.partyColor || candidate.color) + '15' }}
                        >
                          {(candidate.image || candidate.imageUrl) ? (
                            <img src={candidate.image || candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl font-black"
                                 style={{ backgroundColor: candidate.partyColor || candidate.color, color: 'white' }}>
                              {candidate.name?.[0]}
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <div className="text-xs font-bold truncate">{candidate.name}</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-3 rounded-xl shadow-xl">
                          <div className="text-3xl font-black mb-1">{candidate.votes?.toLocaleString()}</div>
                          <div className="text-xs opacity-90 truncate max-w-[130px] font-bold">{candidate.partyTamil}</div>
                          <div 
                            className="text-xs font-black mt-1 px-2 py-0.5 rounded inline-block"
                            style={{ backgroundColor: candidate.partyColor || candidate.color }}
                          >
                            {candidate.partyCode}
                          </div>
                        </div>
                      </div>
                      {idx < 2 && (
                        <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-gradient-to-br from-red-600 to-red-700 text-white w-14 h-14 rounded-full flex items-center justify-center text-sm font-black shadow-2xl border-4 border-white z-10">
                          VS
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: 2 Random constituencies with Top 4 */}
        <div className="w-[440px] bg-gradient-to-b from-blue-50 to-white border-l-4 border-blue-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-4 shadow-lg">
            <h2 className="text-xl font-black">தொகுதி வேட்பாளர்கள்</h2>
            <p className="text-xs opacity-90 mt-1">2 தொகுதிகள் · Top 4 வேட்பாளர்கள்</p>
          </div>
          <div className="p-3 overflow-y-auto max-h-[800px] custom-scrollbar">
            <BattleSpotlight seats={random2} />
          </div>
        </div>
      </section>

      {/* BOTTOM TICKER: Scrolling updates and status */}
      <section className="h-[60px] bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 border-t-4 border-gray-900 overflow-hidden">
        <div className="h-full flex items-center relative">
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-red-700 flex items-center justify-center z-10 shadow-2xl">
            <div className="text-center">
              <div className="text-white text-xs font-bold">நேரடி எண்ணிக்கை புதுப்பிப்பு</div>
              <div className="text-white text-2xl font-black">{data.seatsCounted}/{data.totalSeats}</div>
            </div>
          </div>
          <div className="flex-1 ml-64 overflow-hidden">
            <motion.div
              animate={{ x: [0, -2000] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="whitespace-nowrap text-gray-900 font-bold text-lg px-8"
            >
              {topParties.map((party, idx) => (
                <span key={party.code} className="inline-flex items-center gap-2 mr-12">
                  <span className="text-2xl font-black" style={{ color: party.color }}>●</span>
                  <span className="font-black">{party.tamil}:</span>
                  <span className="font-black text-2xl" style={{ color: party.color }}>{party.total}</span>
                  <span className="text-sm">இடங்கள் •</span>
                  <span className="text-green-700 font-black">வெற்றி {party.won}</span>
                  <span className="text-blue-700 font-black">• முன்னிலை {party.leading}</span>
                  <span className="text-gray-700">• வாக்கு {party.votePct?.toFixed(1)}%</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
