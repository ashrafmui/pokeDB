import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import Link from "next/link";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
import GenerationButtons from "@/components/GenerationButtons";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
        <main>
            <h1 className="font-pocket-monk text-6xl">Gen</h1>
        </main>
    </div>
  );
}
