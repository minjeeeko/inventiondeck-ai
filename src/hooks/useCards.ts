"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import { createClient } from "@/lib/supabase/client";
import { Card, CardCategory } from "@/types";
import { SEED_CARDS } from "@/lib/seeds/cards-seed";

const fuseOptions: IFuseOptions<Card> = {
  keys: [
    { name: "title", weight: 0.6 },
    { name: "description", weight: 0.3 },
    { name: "tags", weight: 0.1 },
  ],
  threshold: 0.35,
  includeScore: true,
};

interface UseCardsReturn {
  cards: Card[];
  isLoading: boolean;
  search: (query: string) => Card[];
  getByCategory: (cat: CardCategory | "all") => Card[];
}

let cachedCards: Card[] | null = null;
let fuseInstance: Fuse<Card> | null = null;

export function useCards(): UseCardsReturn {
  const [cards, setCards] = useState<Card[]>(cachedCards ?? []);
  const [isLoading, setIsLoading] = useState(!cachedCards);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cachedCards) return;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("popularity", { ascending: false });

      if (!mounted.current) return;

      if (error || !data || data.length === 0) {
        // Supabase에 데이터 없으면 시드 데이터 사용
        cachedCards = SEED_CARDS;
      } else {
        cachedCards = data as Card[];
      }

      fuseInstance = new Fuse(cachedCards, fuseOptions);
      setCards(cachedCards);
      setIsLoading(false);
    }

    load();
    return () => { mounted.current = false; };
  }, []);

  const search = useCallback((query: string): Card[] => {
    if (!query.trim() || !fuseInstance) return cachedCards ?? [];
    return fuseInstance.search(query).map((r) => r.item);
  }, []);

  const getByCategory = useCallback((cat: CardCategory | "all"): Card[] => {
    const all = cachedCards ?? [];
    return cat === "all" ? all : all.filter((c) => c.category === cat);
  }, []);

  return { cards, isLoading, search, getByCategory };
}
