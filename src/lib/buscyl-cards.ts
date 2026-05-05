export interface BuscylCard {
  id: string;
  label: string;
  data: string;
  createdAt: number;
  color?: string;
}

const KEY = "buscyl_cards_v1";

export function loadCards(): BuscylCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCards(cards: BuscylCard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cards));
}

export function addCard(card: Omit<BuscylCard, "id" | "createdAt">): BuscylCard {
  const cards = loadCards();
  const newCard: BuscylCard = {
    ...card,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  saveCards([...cards, newCard]);
  return newCard;
}

export function removeCard(id: string) {
  saveCards(loadCards().filter((c) => c.id !== id));
}

export function updateCard(id: string, patch: Partial<Omit<BuscylCard, "id" | "createdAt">>) {
  saveCards(loadCards().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}