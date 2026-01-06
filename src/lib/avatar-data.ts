
export interface AvatarData {
    id: string;
    name: string;
    image: string;
    price: number;
}

export const avatars: AvatarData[] = [
    { id: 'avatar-1', name: 'Cyber Punk', image: 'https://picsum.photos/seed/avatar1/200', price: 15000 },
    { id: 'avatar-2', name: 'Space Explorer', image: 'https://picsum.photos/seed/avatar2/200', price: 25000 },
    { id: 'avatar-3', name: 'Ninja', image: 'https://picsum.photos/seed/avatar3/200', price: 20000 },
    { id: 'avatar-4', name: 'Robot', image: 'https://picsum.photos/seed/avatar4/200', price: 18000 },
    { id: 'avatar-5', name: 'Wizard', image: 'https://picsum.photos/seed/avatar5/200', price: 12000 },
    { id: 'avatar-6', name: 'Viking', image: 'https://picsum.photos/seed/avatar6/200', price: 22000 },
    { id: 'avatar-7', name: 'Pirate', image: 'https://picsum.photos/seed/avatar7/200', price: 19000 },
    { id: 'avatar-8', name: 'Superhero', image: 'https://picsum.photos/seed/avatar8/200', price: 21000 },
    { id: 'avatar-9', name: 'Zombie', image: 'https://picsum.photos/seed/avatar9/200', price: 10000 },
    { id: 'avatar-10', name: 'Astronaut', image: 'https://picsum.photos/seed/avatar10/200', price: 17000 },
    { id: 'avatar-11', name: 'Premium Character', image: '/Premium-char.png', price: 30000 },
];
