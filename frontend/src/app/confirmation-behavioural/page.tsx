"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
import { FileUpload } from "../../components/ui/file_upload";
import { PlaceholdersAndVanishInput } from "../../components/ui/placeholders-and-vanish-input";

export default function ConfirmationPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleConfirmation = () => {
    if (analysisResult) {
      // Encode the analysis result to make it URL-safe
      const encodedResult = encodeURIComponent(analysisResult);
      
      // Construct the URL with the analysis result as a query parameter
      const url = `http://localhost:5173/?mode=behavior&text=${encodedResult}`;
      
      // Store confirmation in localStorage
      localStorage.setItem("codeInterviewConfirmed", "true");
      
      // Navigate to the constructed URL
      window.location.href = url;
    } else {
      // If there's no analysis result, show an error or prevent navigation
      console.error('No analysis result to send');
      // Optionally, you can show an error message to the user here
    }
  };

  const handleFileUpload = (files: File[]) => {
    console.log(files);
  };

  const handleAnalysisComplete = (result: string) => {
    setAnalysisResult(result);
  };

  const prompt = 'Upload your resume to get personalized experience.';

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col text-white items-center gap-5">
        <TextGenerateEffect words={prompt} />

        <FileUpload 
          onChange={handleFileUpload} 
          onAnalysisComplete={handleAnalysisComplete}
        />

        <button
          className="px-4 py-2 bg-zinc-900 rounded hover:bg-zinc-700 transition"
          onClick={handleConfirmation}
          disabled={!analysisResult}
        >
          Done
        </button>
      </div>
    </div>
  );
}