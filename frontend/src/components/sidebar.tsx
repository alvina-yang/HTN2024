"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SidebarDemo() {
  const links = [
    {
      label: "Code Interview",
      href: "/code-interview", // Navigation to code interview
      icon: (
        <IconBrandTabler className="text-slate-200 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Behavioural Interview",
      href: "/behavioural-interview", // Navigation to behavioural interview
      icon: (
        <IconUserBolt className="text-slate-200 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Accounting Interview",
      href: "/accounting-interview", // Navigation to accounting interview
      icon: (
        <IconSettings className="text-slate-200 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const [open, setOpen] = useState(false); // Open sidebar by default

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="flex flex-col items-center justify-center h-full gap-10 bg-zinc-900">
        <div className="flex flex-col items-center justify-center gap-10 flex-1">
          {links.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="flex items-center justify-center gap-2 text-slate-200 dark:text-neutral-200"
            >
              {link.icon}
              {open && <span>{link.label}</span>}
            </Link>
          ))}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
