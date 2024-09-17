"use client";
import React, { useState } from "react";
import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
import { PlaceholdersAndVanishInput } from "../../components/ui/placeholders-and-vanish-input";

export default function ConfirmationPage() {
  const [query, setQuery] = useState<string>(""); // To store user input

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
    window.location.href = "http://localhost:3000/code-interview";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); // Update query with input value
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (query) {
      try {
        const response = await fetch(
          "https://f025-2620-101-f000-7c0-00-4a68.ngrok-free.app/api/find_lc_question",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query, 
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log("Response Data:", data);
        // Handle the response data if necessary
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.log("Please enter a valid query");
    }
  };

  const prompt =
    "Hello, please enter how you would like to customize this bot.";

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col text-white items-center gap-5">
        <TextGenerateEffect words={prompt} />
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
