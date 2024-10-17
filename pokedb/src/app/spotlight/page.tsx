//import EmblaCarousel from "@/components/EmblaCarousel";
import { EmblaOptionsType } from 'embla-carousel';
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Input, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar} from "@nextui-org/react";
// import {SearchIcon} from "@/components/SearchIcon.tsx";

import Image from "next/image";

export default function Home() {
  return (
    
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex items-center justify-center">
          <h1 className="font-pocket-monk text-3xl">Bulbasaur</h1>
        </div>
        <div className="flex items-center justify-center">
        </div>
      </main>
    </div>

  );
}