"use client";

import useDebounce from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

type Props = {
  onSearch: (q: string) => void;
  placeholder?: string;
};

export default function LawSearch({ onSearch, placeholder = "법령/키워드 검색" }: Props) {
  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 300);

  useEffect(() => {
    onSearch(debounced.trim());
  }, [debounced, onSearch]);

  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
      placeholder={placeholder}
      aria-label="법령 검색어"
    />
  );
}
