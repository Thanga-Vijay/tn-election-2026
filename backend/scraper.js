const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://results.eci.gov.in/ResultAcGenMay2026/';
const PARTY_RESULT_URL = `${BASE_URL}partywiseresult-S22.htm`;
const STATEWISE_URL = `${BASE_URL}statewiseS221.htm`;
const VOTESHARE_URL = `${BASE_URL}voteshareresult-S22.htm`;
const TOTAL_SEATS = 234;
const MAJORITY = 118;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
};

const FEATURED_CONSTITUENCY_PRIORITY = [
  'PERAMBUR',
  'KOLATHUR',
  'EDAPPADI',
  'TIRUNELVELI',
  'COIMBATORE (SOUTH)',
  'THIRUPARANKUNDRAM',
  'THIRUVALLUR',
  'PERAMBALUR'
];

const FALLBACK_PARTY = {
  code: 'OTH',
  tamil: 'மற்றவை',
  color: '#555577',
  fullName: 'Others'
};

const PARTY_MAP = {
  'Tamilaga Vettri Kazhagam - TVK': {
    code: 'TVK',
    tamil: 'தவக',
    color: '#FF6600',
    fullName: 'Tamilaga Vettri Kazhagam'
  },
  'Tamilaga Vettri Kazhagam': {
    code: 'TVK',
    tamil: 'தவக',
    color: '#FF6600',
    fullName: 'Tamilaga Vettri Kazhagam'
  },
  'All India Anna Dravida Munnetra Kazhagam': {
    code: 'ADMK',
    tamil: 'அதிமுக',
    color: '#006400',
    fullName: 'All India Anna Dravida Munnetra Kazhagam'
  },
  'Dravida Munnetra Kazhagam - DMK': {
    code: 'DMK',
    tamil: 'திமுக',
    color: '#E32636',
    fullName: 'Dravida Munnetra Kazhagam'
  },
  'Dravida Munnetra Kazhagam': {
    code: 'DMK',
    tamil: 'திமுக',
    color: '#E32636',
    fullName: 'Dravida Munnetra Kazhagam'
  },
  'Pattali Makkal Katchi - PMK': {
    code: 'PMK',
    tamil: 'பாமக',
    color: '#800080',
    fullName: 'Pattali Makkal Katchi'
  },
  'Pattali Makkal Katchi': {
    code: 'PMK',
    tamil: 'பாமக',
    color: '#800080',
    fullName: 'Pattali Makkal Katchi'
  },
  'Bharatiya Janata Party - BJP': {
    code: 'BJP',
    tamil: 'பாஜக',
    color: '#FF9933',
    fullName: 'Bharatiya Janata Party'
  },
  'Bharatiya Janata Party': {
    code: 'BJP',
    tamil: 'பாஜக',
    color: '#FF9933',
    fullName: 'Bharatiya Janata Party'
  },
  'Indian National Congress - INC': {
    code: 'INC',
    tamil: 'காங்கிரஸ்',
    color: '#00BFFF',
    fullName: 'Indian National Congress'
  },
  'Indian National Congress': {
    code: 'INC',
    tamil: 'காங்கிரஸ்',
    color: '#00BFFF',
    fullName: 'Indian National Congress'
  },
  'Viduthalai Chiruthaigal Katchi - VCK': {
    code: 'VCK',
    tamil: 'விசிக',
    color: '#4169E1',
    fullName: 'Viduthalai Chiruthaigal Katchi'
  },
  'Viduthalai Chiruthaigal Katchi': {
    code: 'VCK',
    tamil: 'விசிக',
    color: '#4169E1',
    fullName: 'Viduthalai Chiruthaigal Katchi'
  },
  'Communist Party of India - CPI': {
    code: 'CPI',
    tamil: 'இக',
    color: '#CC0000',
    fullName: 'Communist Party of India'
  },
  'Communist Party of India': {
    code: 'CPI',
    tamil: 'இக',
    color: '#CC0000',
    fullName: 'Communist Party of India'
  },
  'Communist Party of India (Marxist)': {
    code: 'CPI(M)',
    tamil: 'மாஇக',
    color: '#AA0000',
    fullName: 'Communist Party of India (Marxist)'
  },
  'Desiya Murpokku Dravida Kazhagam - DMDK': {
    code: 'DMDK',
    tamil: 'தேமதிக',
    color: '#FFD700',
    fullName: 'Desiya Murpokku Dravida Kazhagam'
  },
  'Desiya Murpokku Dravida Kazhagam': {
    code: 'DMDK',
    tamil: 'தேமதிக',
    color: '#FFD700',
    fullName: 'Desiya Murpokku Dravida Kazhagam'
  },
  'Puthiya Tamilagam - PT': {
    code: 'PT',
    tamil: 'புதிய த',
    color: '#20B2AA',
    fullName: 'Puthiya Tamilagam'
  },
  'Puthiya Tamilagam': {
    code: 'PT',
    tamil: 'புதிய த',
    color: '#20B2AA',
    fullName: 'Puthiya Tamilagam'
  },
  'Naam Tamilar Katchi - NTK': {
    code: 'NTK',
    tamil: 'நாதக',
    color: '#2E8B57',
    fullName: 'Naam Tamilar Katchi'
  },
  'Naam Tamilar Katchi': {
    code: 'NTK',
    tamil: 'நாதக',
    color: '#2E8B57',
    fullName: 'Naam Tamilar Katchi'
  },
  'Amma Makkal Munnettra Kazagam': {
    code: 'OTH',
    tamil: 'மற்றவை',
    color: '#555577',
    fullName: 'Amma Makkal Munnettra Kazagam'
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value = '') {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function toNumber(value = '') {
  const parsed = Number.parseInt(normalizeText(value).replace(/,/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toFloat(value = '') {
  const parsed = Number.parseFloat(normalizeText(value).replace(/,/g, '').replace('%', ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  const values = parts.reduce((accumulator, part) => {
    if (part.type !== 'literal') {
      accumulator[part.type] = part.value;
    }

    return accumulator;
  }, {});

  return `${values.day}-${values.month}-${values.year} ${values.hour}:${values.minute}:${values.second}`;
}

function convertTo24Hour(timeValue) {
  const match = normalizeText(timeValue).match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);

  if (!match) {
    return normalizeText(timeValue);
  }

  let hours = Number.parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hours !== 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
}

function extractLastUpdated(html) {
  const text = normalizeText(cheerio.load(html)('body').text());
  const match = text.match(/Last Updated at\s+([0-9: ]+[AP]M)\s+On\s+(\d{2})\/(\d{2})\/(\d{4})/i);

  if (!match) {
    return formatTimestamp();
  }

  const timeValue = convertTo24Hour(match[1]);
  return `${match[2]}-${match[3]}-${match[4]} ${timeValue}`;
}

function getPartyMeta(name) {
  return PARTY_MAP[normalizeText(name)] || {
    ...FALLBACK_PARTY,
    fullName: normalizeText(name) || FALLBACK_PARTY.fullName
  };
}

function buildAbsoluteUrl(path) {
  if (!path) {
    return null;
  }

  return new URL(path, BASE_URL).href;
}

async function fetchHtmlWithRetry(url, attempt = 1) {
  try {
    const response = await axios.get(url, {
      headers: REQUEST_HEADERS,
      timeout: 15000
    });

    return response.data;
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    console.warn(`[scraper] Attempt ${attempt} failed for ${url}: ${error.message}. Retrying in 5s...`);
    await delay(RETRY_DELAY_MS);
    return fetchHtmlWithRetry(url, attempt + 1);
  }
}

function parsePartyResults(html) {
  const $ = cheerio.load(html);
  const table = $('.table').first();

  if (!table.length) {
    throw new Error('Unable to locate the ECI party results table.');
  }

  const groupedParties = new Map();

  table.find('tr').each((index, row) => {
    if (index === 0) {
      return;
    }

    const cells = $(row).find('td');

    if (cells.length < 4) {
      return;
    }

    const rawName = normalizeText($(cells[0]).text());

    if (!rawName || /^total$/i.test(rawName)) {
      return;
    }

    const won = toNumber($(cells[1]).text());
    const leading = toNumber($(cells[2]).text());
    const total = toNumber($(cells[3]).text()) || won + leading;
    const leadDetailsUrl = buildAbsoluteUrl($(cells[2]).find('a').attr('href'));
    const meta = getPartyMeta(rawName);
    const current = groupedParties.get(meta.code) || {
      code: meta.code,
      fullName: meta.code === FALLBACK_PARTY.code ? FALLBACK_PARTY.fullName : meta.fullName,
      tamil: meta.tamil,
      color: meta.color,
      won: 0,
      leading: 0,
      total: 0,
      leadDetailsUrl: leadDetailsUrl || null
    };

    current.won += won;
    current.leading += leading;
    current.total += total;
    current.leadDetailsUrl = current.leadDetailsUrl || leadDetailsUrl || null;

    groupedParties.set(meta.code, current);
  });

  return Array.from(groupedParties.values())
    .map((party) => ({
      ...party,
      pct: Number(((party.total / TOTAL_SEATS) * 100).toFixed(1)),
      hasMajority: party.total >= MAJORITY
    }))
    .sort((first, second) => second.total - first.total);
}

function parseVoteShare(html) {
  const $ = cheerio.load(html);
  const table = $('.table').first();
  const voteShareRows = [];

  if (!table.length) {
    return voteShareRows;
  }

  table.find('tr').each((index, row) => {
    if (index === 0) {
      return;
    }

    const cells = $(row).find('td');

    if (cells.length < 3) {
      return;
    }

    const rawName = normalizeText($(cells[0]).text());

    if (!rawName || /^total$/i.test(rawName)) {
      return;
    }

    const meta = getPartyMeta(rawName);

    voteShareRows.push({
      code: meta.code,
      fullName: meta.code === FALLBACK_PARTY.code ? rawName : meta.fullName,
      tamil: meta.tamil,
      color: meta.color,
      votePct: Number(toFloat($(cells[1]).text()).toFixed(2)),
      totalVotes: toNumber($(cells[2]).text())
    });
  });

  return voteShareRows.sort((first, second) => second.totalVotes - first.totalVotes);
}

function parseStatewiseResults(html) {
  const $ = cheerio.load(html);
  const table = $('.table').first();
  const constituencies = [];

  if (!table.length) {
    return constituencies;
  }

  table.find('tr').each((index, row) => {
    if (index === 0) {
      return;
    }

    const cells = $(row).find('td');

    if (cells.length < 8) {
      return;
    }

    const constituencyName = normalizeText($(cells[0]).text());

    if (!constituencyName) {
      return;
    }

    const leadingPartyName = normalizeText($(cells[3]).text());
    const trailingPartyName = normalizeText($(cells[5]).text());
    const leadingMeta = getPartyMeta(leadingPartyName);
    const trailingMeta = getPartyMeta(trailingPartyName);

    constituencies.push({
      name: constituencyName,
      number: toNumber($(cells[1]).text()),
      leadingCandidate: normalizeText($(cells[2]).text()),
      leadingPartyName,
      leadingPartyCode: leadingMeta.code,
      leadingPartyTamil: leadingMeta.tamil,
      trailingCandidate: normalizeText($(cells[4]).text()),
      trailingPartyName,
      trailingPartyCode: trailingMeta.code,
      trailingPartyTamil: trailingMeta.tamil,
      margin: toNumber($(cells[6]).text()),
      roundStatus: normalizeText($(cells[7]).text()),
      candidateUrl: `${BASE_URL}candidateswise-S22${toNumber($(cells[1]).text())}.htm`
    });
  });

  return constituencies;
}

function parsePartyLeadDetails(html) {
  const $ = cheerio.load(html);
  const table = $('.table').first();
  const leadMap = new Map();

  if (!table.length) {
    return leadMap;
  }

  table.find('tr').each((index, row) => {
    if (index === 0) {
      return;
    }

    const cells = $(row).find('td');

    if (cells.length < 6) {
      return;
    }

    const constituencyText = normalizeText($(cells[1]).text());
    const match = constituencyText.match(/^(.*)\((\d+)\)$/);

    if (!match) {
      return;
    }

    const constituencyName = normalizeText(match[1]);
    const constituencyNumber = toNumber(match[2]);

    leadMap.set(constituencyNumber, {
      number: constituencyNumber,
      name: constituencyName,
      leadingCandidateVotes: toNumber($(cells[3]).text()),
      margin: toNumber($(cells[4]).text()),
      roundStatus: normalizeText($(cells[5]).text())
    });
  });

  return leadMap;
}

function mergeConstituencyData(constituencies, leadVoteLookup) {
  return constituencies.map((constituency) => {
    const leaderVotes = leadVoteLookup.get(constituency.number)?.leadingCandidateVotes || 0;
    const runnerVotes = leaderVotes > 0 ? Math.max(leaderVotes - constituency.margin, 0) : 0;

    return {
      ...constituency,
      leaderVotes,
      runnerVotes
    };
  });
}

function parseCandidatePage(html, fallbackConstituency = {}) {
  const $ = cheerio.load(html);
  const roundStatus = normalizeText($('.round-status').text());
  const candidates = [];

  $('.cand-box').each((index, card) => {
    const voteText = normalizeText($(card).find('.status div').eq(1).text());
    const voteMatch = voteText.match(/^([\d,]+)/);
    const diffMatch = voteText.match(/\(([+-]?\s*[\d,]+)\)/);
    const partyName = normalizeText($(card).find('.nme-prty h6').text());
    const meta = getPartyMeta(partyName);

    candidates.push({
      rank: index + 1,
      name: normalizeText($(card).find('.nme-prty h5').text()),
      partyName,
      partyCode: partyName === 'None of the Above' ? 'NOTA' : meta.code,
      partyTamil: partyName === 'None of the Above' ? 'நோட்டா' : meta.tamil,
      color: partyName === 'None of the Above' ? '#8A8F98' : meta.color,
      imageUrl: buildAbsoluteUrl($(card).find('figure img').attr('src')),
      status: normalizeText($(card).find('.status div').eq(0).text()).toLowerCase(),
      votes: voteMatch ? toNumber(voteMatch[1]) : 0,
      diff: diffMatch ? Number.parseInt(diffMatch[1].replace(/[,\s]/g, ''), 10) || 0 : 0
    });
  });

  const sortedCandidates = [...candidates].sort((first, second) => second.votes - first.votes);
  const topCandidates = sortedCandidates.slice(0, 4);
  const leadCandidate = sortedCandidates[0] || null;
  const trailingCandidate = sortedCandidates[1] || null;

  return {
    name: fallbackConstituency.name,
    number: fallbackConstituency.number,
    roundStatus: roundStatus || fallbackConstituency.roundStatus,
    leadCandidateImage: leadCandidate?.imageUrl || '',
    trailingCandidateImage: trailingCandidate?.imageUrl || '',
    leadCandidateVotes: leadCandidate?.votes || fallbackConstituency.leaderVotes || 0,
    runnerVotes: trailingCandidate?.votes || fallbackConstituency.runnerVotes || 0,
    topCandidates,
    candidatesCount: candidates.length
  };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = [];

  for (let index = 0; index < items.length; index += limit) {
    const chunk = items.slice(index, index + limit);
    const chunkResults = await Promise.all(chunk.map(worker));
    results.push(...chunkResults);
  }

  return results;
}

async function fetchCandidateDetailMap(constituencies) {
  const entries = await mapWithConcurrency(constituencies, 8, async (constituency) => {
    try {
      const html = await fetchHtmlWithRetry(constituency.candidateUrl);
      return [constituency.number, parseCandidatePage(html, constituency)];
    } catch (error) {
      console.warn(
        `[scraper] Unable to fetch candidate details for ${constituency.name} (${constituency.number}): ${error.message}`
      );

      return [constituency.number, null];
    }
  });

  return entries.reduce((lookup, [number, details]) => {
    if (details) {
      lookup.set(number, details);
    }

    return lookup;
  }, new Map());
}

function mergeCandidateDetails(constituencies, candidateDetailsMap) {
  return constituencies.map((constituency) => {
    const details = candidateDetailsMap.get(constituency.number);

    if (!details) {
      return {
        ...constituency,
        topCandidates: [
          {
            rank: 1,
            name: constituency.leadingCandidate,
            partyName: constituency.leadingPartyName,
            partyCode: constituency.leadingPartyCode,
            partyTamil: constituency.leadingPartyTamil,
            color: getPartyMeta(constituency.leadingPartyName).color,
            imageUrl: '',
            status: 'leading',
            votes: constituency.leaderVotes,
            diff: constituency.margin
          },
          {
            rank: 2,
            name: constituency.trailingCandidate,
            partyName: constituency.trailingPartyName,
            partyCode: constituency.trailingPartyCode,
            partyTamil: constituency.trailingPartyTamil,
            color: getPartyMeta(constituency.trailingPartyName).color,
            imageUrl: '',
            status: 'trailing',
            votes: constituency.runnerVotes,
            diff: -constituency.margin
          }
        ],
        leadCandidateImage: '',
        trailingCandidateImage: '',
        candidateRoundStatus: constituency.roundStatus
      };
    }

    return {
      ...constituency,
      leaderVotes: details.leadCandidateVotes || constituency.leaderVotes,
      runnerVotes: details.runnerVotes || constituency.runnerVotes,
      topCandidates: details.topCandidates,
      leadCandidateImage: details.leadCandidateImage,
      trailingCandidateImage: details.trailingCandidateImage,
      candidateRoundStatus: details.roundStatus || constituency.roundStatus,
      candidatesCount: details.candidatesCount
    };
  });
}

function pickFeaturedBattle(constituencies) {
  for (const name of FEATURED_CONSTITUENCY_PRIORITY) {
    const match = constituencies.find((constituency) => constituency.name === name);

    if (match) {
      return match;
    }
  }

  return [...constituencies]
    .filter((constituency) => constituency.margin > 0)
    .sort((first, second) => first.margin - second.margin)[0] || null;
}

function buildHeadline(parties, featuredBattle, seatsCounted, seatsRemaining) {
  const leader = parties[0];

  if (!leader) {
    return {
      title: 'தரவுகள் சேகரிக்கப்பட்டு வருகின்றன',
      subtitle: 'அதிகாரப்பூர்வ ECI நிலவரம் புதுப்பிக்கப்படுகிறது'
    };
  }

  if (leader.total >= MAJORITY) {
    return {
      title: `${leader.tamil} பெரும்பான்மை கோட்டை கடந்துள்ளது`,
      subtitle: `${leader.total} இடங்களுடன் ஆட்சியை உறுதி செய்யும் நிலை`
    };
  }

  if (featuredBattle) {
    return {
      title: `${leader.tamil} ${leader.total} இடங்களில் முன்னிலை`,
      subtitle: `${featuredBattle.name} உள்ளிட்ட முக்கிய மோதல்களில் கடும் போட்டி`
    };
  }

  return {
    title: `${leader.tamil} ${leader.total} இடங்களில் முன்னிலை`,
    subtitle: `${seatsCounted} தொகுதிகள் கணக்கில் · ${seatsRemaining} தொகுதிகள் நிலுவை`
  };
}

async function fetchPartyLeadVoteMaps(parties) {
  const leadUrls = parties
    .filter((party) => party.leadDetailsUrl)
    .map((party) => ({
      code: party.code,
      url: party.leadDetailsUrl
    }));

  const voteMaps = await Promise.all(
    leadUrls.map(async ({ code, url }) => {
      try {
        const html = await fetchHtmlWithRetry(url);
        return [code, parsePartyLeadDetails(html)];
      } catch (error) {
        console.warn(`[scraper] Unable to fetch lead details for ${code}: ${error.message}`);
        return [code, new Map()];
      }
    })
  );

  return voteMaps.reduce((lookup, [, map]) => {
    map.forEach((value, key) => {
      lookup.set(key, value);
    });

    return lookup;
  }, new Map());
}

async function scrapeResults() {
  const partyHtml = await fetchHtmlWithRetry(PARTY_RESULT_URL);
  const [statewiseResponse, voteShareResponse] = await Promise.allSettled([
    fetchHtmlWithRetry(STATEWISE_URL),
    fetchHtmlWithRetry(VOTESHARE_URL)
  ]);
  const statewiseHtml = statewiseResponse.status === 'fulfilled' ? statewiseResponse.value : '';
  const voteShareHtml = voteShareResponse.status === 'fulfilled' ? voteShareResponse.value : '';

  const partiesWithLinks = parsePartyResults(partyHtml);
  const voteShare = voteShareHtml ? parseVoteShare(voteShareHtml) : [];
  const statewiseConstituencies = statewiseHtml ? parseStatewiseResults(statewiseHtml) : [];
  const leadVoteLookup = statewiseConstituencies.length
    ? await fetchPartyLeadVoteMaps(partiesWithLinks)
    : new Map();
  const candidateDetailMap = statewiseConstituencies.length
    ? await fetchCandidateDetailMap(statewiseConstituencies)
    : new Map();
  const constituencyBase = mergeConstituencyData(statewiseConstituencies, leadVoteLookup);
  const constituencies = mergeCandidateDetails(constituencyBase, candidateDetailMap);
  const seatsCounted = partiesWithLinks.reduce((sum, party) => sum + party.total, 0);
  const seatsRemaining = Math.max(TOTAL_SEATS - seatsCounted, 0);
  const featuredBattle = pickFeaturedBattle(constituencies);
  const closeContests = [...constituencies]
    .filter((constituency) => constituency.margin > 0)
    .sort((first, second) => first.margin - second.margin)
    .slice(0, 8);
  const biggestLeads = [...constituencies]
    .filter((constituency) => constituency.margin > 0)
    .sort((first, second) => second.margin - first.margin)
    .slice(0, 8);
  const cleanedParties = partiesWithLinks.map(({ leadDetailsUrl, ...party }) => party);
  const headline = buildHeadline(cleanedParties, featuredBattle, seatsCounted, seatsRemaining);
  const updatedAt = extractLastUpdated(partyHtml);
  const topThree = cleanedParties
    .slice(0, 3)
    .map((party) => `${party.code}:${party.total}`)
    .join(' | ') || 'No data';

  console.log(`[${updatedAt}] ${topThree} | Counted: ${seatsCounted}/${TOTAL_SEATS}`);

  return {
    updatedAt,
    totalSeats: TOTAL_SEATS,
    majority: MAJORITY,
    seatsCounted,
    seatsRemaining,
    knownConstituencies: constituencies.length,
    leadingParty: cleanedParties[0]?.code || null,
    headline,
    featuredBattle,
    closeContests,
    biggestLeads,
    voteShare,
    constituencies,
    parties: cleanedParties
  };
}

module.exports = {
  scrapeResults
};
