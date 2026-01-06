
export interface Trader {
  id: string;
  name: string;
  avatar: string;
  dataAiHint?: string;
  location: string;
  memberSince: string;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  specialties: string[];
  followers: string;
  copiers: string;
  aum: string; // Assets Under Management
  monthlyReturn: string;
  winRate: string;
  totalReturn: string;
  sharpeRatio: string;
  maxDrawdown: string;
  tradingStreak: string;
  totalTrades: number;
  avgHoldTime: string;
  copyFee: string;
  minCopy: string;
  createdAt?: string;
}

export const traders: Trader[] = [
  {
    id: 'alex-chen',
    name: 'Alex Chen',
    avatar: 'https://picsum.photos/seed/18/100/100',
    dataAiHint: 'man portrait',
    location: 'Singapore',
    memberSince: 'Jan 2023',
    riskLevel: 'Medium Risk',
    specialties: ['DeFi', 'Layer 1', 'Gaming'],
    followers: '2.3K',
    copiers: '156',
    aum: '$2.3M',
    monthlyReturn: '+24.5%',
    winRate: '87%',
    totalReturn: '+156%',
    sharpeRatio: '2.14',
    maxDrawdown: '-8.5%',
    tradingStreak: '12 wins',
    totalTrades: 1247,
    avgHoldTime: '3.2 days',
    copyFee: '15%',
    minCopy: '$100',
  },
  {
    id: 'sarah-miller',
    name: 'Sarah Miller',
    avatar: 'https://picsum.photos/seed/19/100/100',
    dataAiHint: 'woman portrait',
    location: 'New York',
    memberSince: 'Mar 2022',
    riskLevel: 'Low Risk',
    specialties: ['NFTs', 'Metaverse', 'AI Coins'],
    followers: '1.8K',
    copiers: '121',
    aum: '$1.9M',
    monthlyReturn: '+18.2%',
    winRate: '91%',
    totalReturn: '+123%',
    sharpeRatio: '1.98',
    maxDrawdown: '-6.2%',
    tradingStreak: '8 wins',
    totalTrades: 982,
    avgHoldTime: '5.1 days',
    copyFee: '10%',
    minCopy: '$100',
  },
   // Adding club members as traders with sample data
  {
    id: 'm1',
    name: 'Satoshi',
    avatar: 'https://picsum.photos/seed/2/100/100',
    location: 'Internet',
    memberSince: 'Oct 2008',
    riskLevel: 'Low Risk',
    specialties: ['Cryptography', 'Peer-to-Peer', 'HODLing'],
    followers: '10M',
    copiers: '0',
    aum: '₿1.1M',
    monthlyReturn: '∞',
    winRate: '100%',
    totalReturn: '∞',
    sharpeRatio: '∞',
    maxDrawdown: '-0%',
    tradingStreak: '15 years',
    totalTrades: 1,
    avgHoldTime: '15 years',
    copyFee: '0%',
    minCopy: '₿1',
  },
   {
    id: 'm2',
    name: 'Vitalik',
    avatar: 'https://picsum.photos/seed/3/100/100',
    location: 'Global',
    memberSince: 'Jul 2015',
    riskLevel: 'Medium Risk',
    specialties: ['Smart Contracts', 'DAOs', 'Scalability'],
    followers: '5M',
    copiers: '5,000',
    aum: '$5B',
    monthlyReturn: '+15%',
    winRate: '85%',
    totalReturn: '+500,000%',
    sharpeRatio: '3.5',
    maxDrawdown: '-94%',
    tradingStreak: '3 wins',
    totalTrades: 500,
    avgHoldTime: '1.5 years',
    copyFee: '5%',
    minCopy: '$500',
  },
  {
    id: 'john-doe',
    name: 'John Doe',
    avatar: 'https://picsum.photos/seed/1/100/100',
    location: 'USA',
    memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    riskLevel: 'Medium Risk',
    specialties: ['Day Trading', 'Technical Analysis'],
    followers: '150',
    copiers: '12',
    aum: '$50K',
    monthlyReturn: '+12%',
    winRate: '68%',
    totalReturn: '+45%',
    sharpeRatio: '1.8',
    maxDrawdown: '-15%',
    tradingStreak: '4 wins',
    totalTrades: 250,
    avgHoldTime: '1 day',
    copyFee: '20%',
    minCopy: '$50',
  },
];

const getProfileSettings = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    const stored = localStorage.getItem('tradeview_profile_visibility');
    return stored ? JSON.parse(stored) : null;
}

// Function to get a trader by ID. If not found, create a generic profile.
export const getTraderById = (id: string): Trader => {
  const trader = traders.find((trader) => trader.id === id);

  if (id === 'john-doe') {
      const profileSettings = getProfileSettings();
      const defaultJohnDoe = traders.find(t => t.id === 'john-doe')!;
      if (profileSettings) {
         return {
            ...defaultJohnDoe,
            name: profileSettings.username,
            location: profileSettings.location,
            specialties: profileSettings.specialties.split(',').map((s: string) => s.trim()),
        };
      }
      return defaultJohnDoe;
  }


  if (trader) {
    return trader;
  }
  // If no specific trader is found, return a generic profile.
  // This is useful for members who are not prominent traders.
  return {
    id: id,
    name: id,
    avatar: 'https://picsum.photos/seed/1/100/100',
    location: 'Unknown',
    memberSince: '2024',
    riskLevel: 'Medium Risk',
    specialties: ['New User'],
    followers: '0',
    copiers: '0',
    aum: '$0',
    monthlyReturn: '0%',
    winRate: 'N/A',
    totalReturn: '0%',
    sharpeRatio: 'N/A',
    maxDrawdown: '0%',
    tradingStreak: '0 wins',
    totalTrades: 0,
    avgHoldTime: 'N/A',
    copyFee: '20%',
    minCopy: '$50',
  };
};
