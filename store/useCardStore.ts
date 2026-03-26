import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Card {
  id: string;
  name: string;
  color: string;
  value: string;
  format: "qrcode" | "barcode";
}

interface CardState {
  cards: Card[];
  addCard: (card: Card) => void;
  removeCard: (id: string) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  setCards: (cards: Card[]) => void;
}

const defaultCards: Card[] = [
  {
    id: "1",
    name: "Auchan",
    color: "#e10600",
    value: "123456789",
    format: "barcode",
  },
  {
    id: "2",
    name: "Carrefour",
    color: "#0058a9",
    value: "987654321",
    format: "barcode",
  },
  {
    id: "3",
    name: "Fnac",
    color: "#ffcc00",
    value: "456789123",
    format: "barcode",
  },
  {
    id: "4",
    name: "IKEA",
    color: "#0051ba",
    value: "321654987",
    format: "barcode",
  },
  {
    id: "5",
    name: "Decathlon",
    color: "#0082c3",
    value: "654321987",
    format: "barcode",
  },
  {
    id: "6",
    name: "Leroy Merlin",
    color: "#68a51c",
    value: "789123456",
    format: "barcode",
  },
];

export const useCardStore = create<CardState>()(
  persist(
    (set) => ({
      cards: defaultCards,
      addCard: (card) =>
        set((state) => ({ cards: [...state.cards, card] })),
      removeCard: (id) =>
        set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),
      updateCard: (id, updates) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),
      setCards: (cards) => set({ cards }),
    }),
    {
      name: "card-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
