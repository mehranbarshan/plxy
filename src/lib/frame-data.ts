
export interface Frame {
    id: string;
    name: string;
    color: string;
    price: number;
}

export const frames: Frame[] = [
    { id: 'carbon-fiber', name: 'Carbon Fiber', color: '#333333', price: 20000 },
    { id: 'ruby-red', name: 'Ruby Red', color: '#E0115F', price: 15000 },
    { id: 'sapphire-blue', name: 'Sapphire Blue', color: '#0F52BA', price: 15000 },
    { id: 'emerald-green', name: 'Emerald Green', color: '#50C878', price: 15000 },
    { id: 'amethyst-purple', name: 'Amethyst Purple', color: '#9966CC', price: 10000 },
    { id: 'topaz-orange', name: 'Topaz Orange', color: '#FFC87C', price: 10000 },
    { id: 'sunburst-yellow', name: 'Sunburst Yellow', color: '#FFD700', price: 10000 },
    { id: 'electric-lime', name: 'Electric Lime', color: '#CCFF00', price: 8000 },
    { id: 'arctic-blue', name: 'Arctic Blue', color: '#87CEEB', price: 8000 },
    { id: 'hot-pink', name: 'Hot Pink', color: '#FF69B4', price: 8000 },
    { id: 'galaxy-violet', name: 'Galaxy Violet', color: '#734F96', price: 8000 },
    { id: 'crimson-tide', name: 'Crimson Tide', color: '#DC143C', price: 6000 },
    { id: 'forest-green', name: 'Forest Green', color: '#228B22', price: 6000 },
    { id: 'ocean-teal', name: 'Ocean Teal', color: '#008080', price: 6000 },
    { id: 'royal-purple', name: 'Royal Purple', color: '#6A0DAD', price: 6000 },
    { id: 'sunset-orange', name: 'Sunset Orange', color: '#FD5E53', price: 6000 },
    { id: 'midnight-blue', name: 'Midnight Blue', color: '#191970', price: 6000 },
];
