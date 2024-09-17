"use client";
import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button } from "../../components/ui/moving-border";
import { SidebarDemo } from "../../components/sidebar";
import { useRouter } from "next/navigation";

// Custom theme for MUI components
const theme = createTheme({
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#292524",
          color: "white",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#3f3f46",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#3f3f46",
          },
          "&:hover": {
            backgroundColor: "#3f3f46",
          },
        },
      },
    },
  },
});

export default function CodeEditorPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const router = useRouter();

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(
          "https://f025-2620-101-f000-7c0-00-4a68.ngrok-free.app/api/find_lc_question",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: "dynamic programming" }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch the question");
        }

        const data = await response.json();
        setQuestion(data.content);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError("Failed to fetch the question.");
      }
    };

    fetchQuestion();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("codeInterviewConfirmed") !== "true") {
      router.push("/code-interview/confirmation");
    }
  }, [router]);

  const [isSaving, setIsSaving] = useState(false);
  const [changesEnabled, setChangesEnabled] = useState(true);

  const handleAskForReview = async () => {
    setChangesEnabled(false);
    console.log("Changes disabled, code review requested.");

    try {
      const reviewResponse = await fetch("https://f025-2620-101-f000-7c0-00-4a68.ngrok-free.app/api/review_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      if (reviewResponse.ok) {
        console.log("Code review request submitted successfully.");
      } else {
        console.error("Failed to submit code for review.");
      }
    } catch (error) {
      console.error("Error submitting the review:", error);
    }

    router.push("/statistics-code");
  };

  const sendCodeToBackend = (newCode: string) => {
    console.log("Sending code to the backend:", newCode);
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    if (changesEnabled) {
      sendCodeToBackend(newCode);
    }
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="h-screen w-full flex relative">
        <SidebarDemo />
        <div className="w-1/2 h-full flex flex-col">
          <div className="flex justify-between p-3 bg-zinc-800 text-white">
            <div className="flex items-center">
              <FormControl variant="standard" sx={{ minWidth: 120 }}>
                <InputLabel id="language-select-label" sx={{ color: "white" }}>
                  Language
                </InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  value={language}
                  onChange={handleLanguageChange}
                  label="Language"
                  sx={{
                    color: "white",
                    ".MuiSelect-icon": { color: "white" },
                    ".MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3f3f46",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#292524",
                        color: "white",
                      },
                    },
                  }}
                >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="typescript">TypeScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="java">Java</MenuItem>
                  <MenuItem value="csharp">C#</MenuItem>
                  <MenuItem value="cpp">C++</MenuItem>
                  <MenuItem value="html">HTML</MenuItem>
                  <MenuItem value="css">CSS</MenuItem>
                </Select>
              </FormControl>
            </div>
            <Button
              borderRadius="1.85rem"
              className="bg-zinc-700 dark:bg-slate-900 text-slate-200 dark:text-white dark:border-slate-800"
              onClick={handleAskForReview}
            >
              Ask for Review
            </Button>
          </div>
          <div className="p-1 bg-zinc-800"></div>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              selectOnLineNumbers: true,
              automaticLayout: true,
            }}
          />
          {isSaving && (
            <div className="text-white p-2 bg-zinc-900 text-center">
              Saving changes...
            </div>
          )}
        </div>

        <div className="w-1/2 h-full bg-zinc-900 p-8 overflow-y-auto">
          {loading && <div className="text-white">Loading question...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}
          {!loading && !error && question && (
            <>
              <h1 className="text-2xl text-gray-200 font-bold mb-4 break-words">
                {question.title}
              </h1>
              <pre className="bg-zinc-800 text-gray-300 p-4 rounded break-words whitespace-pre-wrap">
                {question.text}
              </pre>
            </>
          )}
        </div>

        {/* New iframe added to the bottom right corner */}
        <div className="absolute bottom-4 right-4 w-[400px] h-[300px] z-10">   <iframe
            src="http://localhost:5173/?mode=technical"
            width="100%"
            height="100%"
            frameBorder="0"
            title="Technical Mode"
            allow="microphone; camera" 
          ></iframe>
        </div>
      </div>
    </ThemeProvider>
  );
}