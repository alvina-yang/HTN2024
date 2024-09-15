 "use client";
import React from "react";
import { ThreeAudioVisualizer } from "../../components/three-audio-visualizer";
import { SidebarDemo } from "../../components/sidebar";

export default function BehaviouralInterviewPage() {
  return (
    <div className="flex bg-black h-screen">
      <div className="w-[250px] h-full">
        <SidebarDemo />
      </div>

      <div className="flex-1">
        <ThreeAudioVisualizer />
      </div>
    </div>
  );
}
