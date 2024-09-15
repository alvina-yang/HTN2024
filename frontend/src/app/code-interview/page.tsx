"use client";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button } from "../../components/ui/moving-border";
import { SidebarDemo } from "../../components/sidebar";

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
            backgroundColor: "#3f3f46", // Zinc-600 for selected option
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#3f3f46", // Darker Zinc-600 on hover
          },
          "&:hover": {
            backgroundColor: "#3f3f46", // Zinc-600 on hover
          },
        },
      },
    },
  },
});

export default function CodeEditorPage() {
  const [code, setCode] = useState(""); // Store the user's code
  const [language, setLanguage] = useState("javascript"); // Default language

  // Example LeetCode-style question
  const question = {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to the target.",
    example:
      "Example: Input: nums = [2,7,11,15], target = 9 \nOutput: [0,1]",
  };
  const [isSaving, setIsSaving] = useState(false); // To simulate API call status

  const [changesEnabled, setChangesEnabled] = useState(true); 

  // Function to handle stopping changes on "Ask for Review" click
  const handleAskForReview = () => {
    setChangesEnabled(false); // Disable further changes
    console.log("Changes disabled, code review requested.");
  };

  // Simulate a backend function that sends code
  const sendCodeToBackend = (newCode: string) => {
    console.log("Sending code to the backend:", newCode);
    // Simulate API delay
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Here you would normally send `newCode` to your backend
    }, 500); // Simulating a delay
  };

 // Function to handle code changes and trigger backend interaction
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode); // Update code in state
    if (changesEnabled) {
      sendCodeToBackend(newCode); // Send changes to backend (or simulate it)
    }
  };
  // Function to handle language change
  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value); // Update the language for the editor
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="h-screen w-full flex">
        <SidebarDemo />
        <div className="w-1/2 h-full flex flex-col">
          <div className="flex justify-between p-3 bg-zinc-800 text-white">
            <div className="flex items-center">
              <FormControl variant="standard" sx={{ minWidth: 120 }}>
                <InputLabel id="language-select-label" sx={{ color: 'white' }}>
                  Language
                </InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  value={language}
                  onChange={handleLanguageChange}
                  label="Language"
                  sx={{
                    color: 'white', // Make text white
                    '.MuiSelect-icon': { color: 'white' }, // Make icon white
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3f3f46', // Zinc-600 hover color
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#292524", // Zinc-800 background
                        color: "white", // White text
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
          <h1 className="text-2xl text-gray-200 font-bold mb-4">
            {question.title}
          </h1>
          <p className="text-gray-400 mb-4">{question.description}</p>
          <pre className="bg-zinc-800 text-gray-300 p-4 rounded">
            {question.example}
          </pre>
        </div>
      </div>
    </ThemeProvider>
  );
}
