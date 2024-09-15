"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { BackgroundBeams } from "../../components/ui/background-beams";
import { HoverEffect } from "../../components/ui/card-hover-effect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCode, faTable } from "@fortawesome/free-solid-svg-icons";
import {SidebarDemo} from "../../components/sidebar";

export default function HomePage() {
  const router = useRouter();

  const handleBehaviouralClick = () => {
    router.push("/behavioural-interview");
  };

  const handleCodeClick = () => {
    router.push("/code-interview");
  };

  const handleAccountingClick = () => {
    router.push("/accounting-interview");
  };

  const projects = [
    {
      title: "Behavioural Interview",
      description: "A live chat behavioural interview bot.",
      onClick: handleBehaviouralClick,
      icon: <FontAwesomeIcon icon={faUser} className="h-10 w-10 text-zinc-100" />, // Add icon
    },
    {
      title: "Coding Interview",
      description: "A pair programming coding interview simulator.",
      onClick: handleCodeClick,
      icon: <FontAwesomeIcon icon={faCode} className="h-10 w-10 text-zinc-100" />, // Add icon
    },
    {
      title: "Accounting",
      description: "An accounting interview bot.",
      onClick: handleAccountingClick,
      icon: <FontAwesomeIcon icon={faTable} className="h-10 w-10 text-zinc-100" />, // Add icon
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <SidebarDemo />
      </div>

      {/* Main Content */}
      <div className="relative w-full min-h-screen bg-black flex-1">
        <div className="absolute inset-0 z-0">
          <BackgroundBeams />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full min-h-screen gap-4 mx-auto px-8">
          <HoverEffect items={projects} />
        </div>
      </div>
    </div>
  );
}
