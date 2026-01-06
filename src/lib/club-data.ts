
import type { Member } from './member-data';

export interface ChatMessage {
    user: string;
    avatar: string;
    message: string;
    timestamp: string;
}

export interface Club {
    id: string;
    name: string;
    type: 'open' | 'invite' | 'closed';
    members: number;
    maxMembers: number;
    trophies: number;
    requiredTrophies: number;
    description: string;
    badge: {
        icon: string;
        iconContent: string;
        bgColor: string;
        borderColor: string;
    };
    chatMessages: ChatMessage[];
    location?: string;
}

// This is now static data, member counts and trophies will be calculated dynamically.
export const clubs: Club[] = [
    {
        id: 'crypto-pioneers',
        name: 'Crypto Pioneers',
        type: 'open',
        members: 6,
        maxMembers: 50,
        trophies: 12750,
        requiredTrophies: 1000,
        description: "A club for pioneers of the crypto space. We trade, we HODL, we conquer. Join us to become a crypto legend.",
        badge: { icon: 'btc', iconContent: '₿', bgColor: '#f97316', borderColor: 'default' },
        location: 'International',
        chatMessages: [
            { user: "Satoshi", avatar: "https://placehold.co/100x100.png", message: "Welcome to the club everyone!", timestamp: "10:30 AM" },
            { user: "Vitalik", avatar: "https://placehold.co/100x100.png", message: "Glad to be here! Let's make some gains.", timestamp: "10:31 AM" },
        ]
    },
    {
        id: 'whale-watchers',
        name: 'Whale Watchers',
        type: 'invite',
        members: 2,
        maxMembers: 50,
        trophies: 8600,
        requiredTrophies: 5000,
        description: "Exclusive club for top traders. We track market makers and trade with the whales. Invite only.",
        badge: { icon: 'eth', iconContent: 'Ξ', bgColor: '#6366f1', borderColor: 'default' },
        location: 'United States of America',
        chatMessages: [
            { user: "Moby Dick", avatar: "https://placehold.co/100x100.png", message: "Keep an eye on the order books.", timestamp: "11:00 AM" },
        ]
    },
    {
        id: 'diamond-hands',
        name: 'Diamond Hands',
        type: 'invite',
        members: 2,
        maxMembers: 50,
        trophies: 10600,
        requiredTrophies: 8000,
        description: "HODLers united. We have diamond hands and we're not afraid to use them. For long-term visionaries.",
        badge: { icon: 'sol', iconContent: 'S', bgColor: '#16a34a', borderColor: 'gold' },
        chatMessages: [
            { user: "Diamond Dave", avatar: "https://placehold.co/100x100.png", message: "Never selling.", timestamp: "01:20 PM" },
        ]
    },
    {
        id: 'rocket-riders',
        name: 'Rocket Riders',
        type: 'closed',
        members: 1,
        maxMembers: 50,
        trophies: 4800,
        requiredTrophies: 4000,
        description: "To the moon! We ride the pumps and get out before the dump. High risk, high reward.",
        badge: { icon: 'doge', iconContent: 'Ð', bgColor: '#facc15', borderColor: 'default' },
        chatMessages: [
             { user: "Elon", avatar: "https://placehold.co/100x100.png", message: "Lambo soon.", timestamp: "04:20 PM" },
        ]
    },
    {
        id: 'defi-degenerates',
        name: 'DeFi Degenerates',
        type: 'open',
        members: 2,
        maxMembers: 50,
        trophies: 8100,
        requiredTrophies: 2000,
        description: "Yield farming, staking, and all things DeFi. If it's degen, we're in. Ape responsibly.",
        badge: { icon: 'none', iconContent: 'DD', bgColor: '#9333ea', borderColor: 'silver' },
        chatMessages: []
    },
    {
        id: 'hodl-heroes',
        name: 'HODL Heroes',
        type: 'invite',
        members: 1,
        maxMembers: 50,
        trophies: 3500,
        requiredTrophies: 3000,
        description: "In it for the long run. We believe in the technology and we're here to stay. True crypto believers only.",
        badge: { icon: 'none', iconContent: 'HH', bgColor: '#dc2626', borderColor: 'default' },
        chatMessages: []
    },
    {
        id: 'altcoin-avengers',
        name: 'Altcoin Avengers',
        type: 'open',
        members: 1,
        maxMembers: 50,
        trophies: 4000,
        requiredTrophies: 0,
        description: "Exploring the world of altcoins. We find the hidden gems before they explode. Come discover with us.",
        badge: { icon: 'none', iconContent: 'AA', bgColor: '#6b7280', borderColor: 'bronze' },
        chatMessages: []
    },
    {
        id: 'the-block-chain',
        name: 'The Block Chain',
        type: 'open',
        members: 1,
        maxMembers: 50,
        trophies: 4300,
        requiredTrophies: 6000,
        description: "We are the chain that binds the blocks. A community of builders, traders, and innovators.",
        badge: { icon: 'none', iconContent: 'BC', bgColor: '#1d4ed8', borderColor: 'default' },
        chatMessages: []
    }
];


export const getClubById = (id: string, allMembers: Member[]): Club | undefined => {
    const clubData = clubs.find(club => club.id === id);
    if (!clubData) return undefined;

    const clubMembers = allMembers.filter(member => member.clubId === id);
    const totalTrophies = clubMembers.reduce((sum, member) => sum + member.trophies, 0);

    return {
        ...clubData,
        trophies: totalTrophies,
        members: clubMembers.length,
    };
}
