"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Hide navbar on homepage
  if (pathname === '/') {
    return null;
  }

  return <Navbar />;
}