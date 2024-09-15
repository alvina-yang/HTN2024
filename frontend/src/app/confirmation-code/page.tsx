"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {TextGenerateEffect} from "../../components/ui/text-generate-effect";
import {PlaceholdersAndVanishInput } from "../../components/ui/placeholders-and-vanish-input";
export default function ConfirmationPage() {
  const router = useRouter();
  const placeholders = [
    "I want questions related to dynamic programming",
    "I want medium level questions",
    "I want questions involving linked-lists",
    "I do not want questions about stacks and queues",
  ];
  const handleConfirmation = () => {
    // Store confirmation in localStorage
    localStorage.setItem("codeInterviewConfirmed", "true");
    // Navigate to the code interview page
    window.location.href = "http://localhost:5173/?mode=technical";
  };

  const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  const prompt = 'Hello, please enter how you would like to customize this bot.';
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col text-white items-center gap-5">
        <TextGenerateEffect words={prompt}/>
        <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
        <button
          className="px-4 py-2 bg-zinc-900 rounded hover:bg-zinc-700 transition"
          onClick={handleConfirmation}
        >
          Done
        </button>
      </div>
    </div>
  );
}
