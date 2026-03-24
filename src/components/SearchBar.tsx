"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: { id: number; name: string }[];
}

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/pokemon/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (pokemonId: number) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      router.push(`/pokemon/${pokemonId}`);
    },
    [router]
  );

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full max-w-md justify-start rounded-full text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search by name, number, or type...
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search by name, number, or type..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && query.length > 0 && results.length === 0 && (
            <CommandEmpty>No Pokemon found.</CommandEmpty>
          )}

          {results.length > 0 && (
            <CommandGroup heading="Pokemon">
              {results.map((pokemon) => (
                <CommandItem
                  key={pokemon.id}
                  value={`${pokemon.name} ${pokemon.id}`}
                  onSelect={() => handleSelect(pokemon.id)}
                  className="cursor-pointer"
                >
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <div>
                    <p className="font-semibold capitalize">{pokemon.name}</p>
                    <p className="text-sm text-muted-foreground">
                      #{pokemon.id.toString().padStart(3, "0")} •{" "}
                      {pokemon.types.map((t) => t.name).join(", ")}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
