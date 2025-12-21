import { create } from 'zustand';

export interface Card {
    id: string;
    name: string;
    color: string;
}

interface CardState {
    cards: Card[];
    addCard: (card: Card) => void;
    removeCard: (id: string) => void;
}

export const useCardStore = create<CardState>((set) => ({
    cards: [
        { id: '1', name: 'Auchan', color: '#e10600' },
        { id: '2', name: 'Carrefour', color: '#0058a9' },
        { id: '3', name: 'Fnac', color: '#ffcc00' },
        { id: '4', name: 'IKEA', color: '#0051ba' },
        { id: '5', name: 'Decathlon', color: '#0082c3' },
        { id: '6', name: 'Leroy Merlin', color: '#68a51c' },
    ],
    addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
    removeCard: (id) => set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),
}));
