const PARTY_PROFILES = {
  TVK: {
    leaderTamil: 'விஜய்',
    leaderEnglish: 'Vijay',
    previousSeats: 0,
    image: '/leaders/tvk-vijay.png',
    symbolImage: '/symbols/tvk.png'
  },
  ADMK: {
    leaderTamil: 'எடப்பாடி பழனிசாமி',
    leaderEnglish: 'Edappadi K. Palaniswami',
    previousSeats: 66,
    image: '/leaders/admk-eps.png',
    symbolImage: '/symbols/admk.png'
  },
  DMK: {
    leaderTamil: 'மு.க. ஸ்டாலின்',
    leaderEnglish: 'M. K. Stalin',
    previousSeats: 133,
    image: '/leaders/dmk-stalin.png',
    symbolImage: '/symbols/dmk.png'
  },
  PMK: {
    leaderTamil: 'அன்புமணி ராமதாஸ்',
    leaderEnglish: 'Anbumani Ramadoss',
    previousSeats: 5,
    image: '/leaders/pmk-anbumani.png',
    symbolImage: '/symbols/pmk.png'
  },
  BJP: {
    leaderTamil: 'நயினார் நாகேந்திரன்',
    leaderEnglish: 'Nainar Nagenthran',
    previousSeats: 4,
    image: '/leaders/bjp-nainar.png',
    symbolImage: '/symbols/bjp.png'
  },
  INC: {
    leaderTamil: 'கே. செல்வப்பெருந்தகை',
    leaderEnglish: 'K. Selvaperunthagai',
    previousSeats: 18,
    image: '/leaders/inc-selvaperunthagai.png',
    symbolImage: '/symbols/inc.png'
  },
  VCK: {
    leaderTamil: 'தொல். திருமாவளவன்',
    leaderEnglish: 'Thol. Thirumavalavan',
    previousSeats: 4,
    image: '/leaders/vck-thirumavalavan.png',
    symbolImage: '/symbols/vck.png'
  },
  CPI: {
    leaderTamil: 'ம. வீரபாண்டியன்',
    leaderEnglish: 'M. Veerapandian',
    previousSeats: 2,
    image: '/leaders/cpi-veerapandian.png',
    symbolImage: '/symbols/cpi.png'
  },
  'CPI(M)': {
    leaderTamil: 'பி. சண்முகம்',
    leaderEnglish: 'P. Shanmugam',
    previousSeats: 2,
    image: '/leaders/cpim-shanmugam.png',
    symbolImage: '/symbols/cpim.png'
  },
  DMDK: {
    leaderTamil: 'பிரேமலதா விஜயகாந்த்',
    leaderEnglish: 'Premalatha Vijayakanth',
    previousSeats: 0,
    image: '/leaders/dmdk-premalatha.png',
    symbolImage: '/symbols/dmdk.png'
  },
  PT: {
    leaderTamil: 'கே. கிருஷ்ணசாமி',
    leaderEnglish: 'K. Krishnasamy',
    previousSeats: 0,
    image: '/leaders/pt-krishnasamy.png',
    symbolImage: '/symbols/pt.png'
  },
  NTK: {
    leaderTamil: 'சீமான்',
    leaderEnglish: 'Seeman',
    previousSeats: 0,
    image: '/leaders/ntk-seeman.png',
    symbolImage: '/symbols/ntk.png'
  },
  OTH: {
    leaderTamil: 'மற்ற கட்சிகள்',
    leaderEnglish: 'Others',
    previousSeats: 0,
    image: '/leaders/others.png',
    symbolImage: '/symbols/others.png'
  }
};

export function getPartyProfile(code) {
  return PARTY_PROFILES[code] || PARTY_PROFILES.OTH;
}

export function enrichParty(party) {
  const profile = getPartyProfile(party.code);

  return {
    ...party,
    leaderTamil: profile.leaderTamil,
    leaderEnglish: profile.leaderEnglish,
    leaderImage: profile.image,
    symbolImage: profile.symbolImage,
    previousSeats: profile.previousSeats,
    seatDelta: (party.total ?? 0) - profile.previousSeats
  };
}

export function enrichConstituency(constituency) {
  if (!constituency) {
    return null;
  }

  const leading = getPartyProfile(constituency.leadingPartyCode);
  const trailing = getPartyProfile(constituency.trailingPartyCode);

  return {
    ...constituency,
    leadingLeaderTamil: leading.leaderTamil,
    leadingLeaderImage: leading.image,
    leadingSymbolImage: leading.symbolImage,
    trailingLeaderTamil: trailing.leaderTamil,
    trailingLeaderImage: trailing.image,
    trailingSymbolImage: trailing.symbolImage,
    topCandidates: (constituency.topCandidates || []).map((candidate) => {
      const profile = getPartyProfile(candidate.partyCode);

      return {
        ...candidate,
        symbolImage: profile.symbolImage
      };
    })
  };
}
