"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { navigation } from "@/lib/ui-config";

export default function Header({ brandLabel }: { brandLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="header">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        <SiteLogo label={brandLabel} priority />
      </Link>
      <button className="menu" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
        Menu
      </button>
      <nav className={open ? "nav open" : "nav"}>
        {navigation.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
