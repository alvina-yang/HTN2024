import { useEffect, useState } from "react";
import { useDaily } from "@daily-co/daily-react";
import { ArrowRight, Ear, Loader2 } from "lucide-react";

import { BackgroundBeams } from "../../../frontend/src/components/ui/background-beams";

import Session from "./components/Session";
import { Configure, RoomSetup } from "./components/Setup";
import { Alert } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { fetch_create_room, fetch_start_agent } from "./actions";

type State =
  | "idle"
  | "configuring"
  | "requesting_agent"
  | "connecting"
  | "connected"
  | "started"
  | "finished"
  | "error";

const status_text = {
  configuring: "Start",
  requesting_agent: "Requesting agent...",
  requesting_token: "Requesting token...",
  connecting: "Connecting to room...",
};

// Server URL (ensure trailing slash)
let serverUrl = import.meta.env.VITE_SERVER_URL;
if (serverUrl && !serverUrl.endsWith("/")) serverUrl += "/";

// Auto room creation (requires server URL)
const autoRoomCreation = parseInt(import.meta.env.VITE_MANUAL_ROOM_ENTRY)
  ? false
  : true;

// Query string for room URL
const roomQs = new URLSearchParams(window.location.search).get("room_url");
const checkRoomUrl = (url: string | null): boolean =>
  !!(url && /^(https?:\/\/[^.]+(\.staging)?\.daily\.co\/[^/]+)$/.test(url));

// Show config options
const showConfigOptions = import.meta.env.VITE_SHOW_CONFIG;

// Mic mode
const isOpenMic = import.meta.env.VITE_OPEN_MIC ? true : false;

export default function App() {
  const daily = useDaily();

  const [state, setState] = useState<State>(
    showConfigOptions ? "idle" : "configuring"
  );
  const [error, setError] = useState<string | null>(null);
  const [startAudioOff, setStartAudioOff] = useState<boolean>(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(roomQs || null);
  const [roomError, setRoomError] = useState<boolean>(
    (roomQs && checkRoomUrl(roomQs)) || false
  );
  const [mode, setMode] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMode(params.get("mode"));
    setTitle(params.get("title"));
    setAnalysisData(params.get("text"));
  }, []);

  function handleRoomUrl() {
    if ((autoRoomCreation && serverUrl) || checkRoomUrl(roomUrl)) {
      setRoomError(false);
      setState("configuring");
    } else {
      setRoomError(true);
    }
  }

  async function start() {
    if (!daily || (!roomUrl && !autoRoomCreation)) return;

    let data;

    // Request agent to start, or join room directly
    if (import.meta.env.VITE_SERVER_URL) {
      // Request a new agent to join the room
      setState("requesting_agent");

      try {
        // Fetch the default daily configuration
        const config = await fetch_create_room(serverUrl);

        if (config.error) {
          setError(config.detail);
          setState("error");
          return;
        }

        // Start the agent with the room URL and token
        data = await fetch_start_agent(
          config.room_url,
          config.token,
          serverUrl,
          mode,
          analysisData // Pass the analysis data to the agent
        );

        if (data.error) {
          setError(data.detail);
          setState("error");
          return;
        }
      } catch (e) {
        setError(`Unable to connect to the bot server at '${serverUrl}'`);
        setState("error");
        return;
      }
    }

    // Join the daily session, passing through the url and token
    setState("connecting");

    try {
      await daily.join({
        url: data?.room_url || roomUrl,
        token: data?.token || "",
        videoSource: false,
        startAudioOff: startAudioOff,
      });
    } catch (e) {
      setError(`Unable to join room: '${data?.room_url || roomUrl}'`);
      setState("error");
      return;
    }
    // Away we go...
    setState("connected");
  }

  async function leave() {
    await daily?.leave();
    await daily?.destroy();
    setState(showConfigOptions ? "idle" : "configuring");
  }

  if (state === "error") {
    return (
      <Alert intent="danger" title="An error occurred">
        {error}
      </Alert>
    );
  }

  if (state === "connected") {
    return (
      <Session
        onLeave={() => leave()}
        openMic={isOpenMic}
        startAudioOff={startAudioOff}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
      <BackgroundBeams />
      <Card
        shadow
        className="animate-appear max-w-lg bg-zinc-900 text-white dark:bg-zinc-900 dark:text-white"
      >
        <CardHeader>
          <CardTitle>Configure your audio devices.</CardTitle>
          <CardDescription>
            Check before meeting with our AI bot for the best experience.
          </CardDescription>
        </CardHeader>
        <CardContent stack>
          {mode === "behavior" && (
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow-md mb-6">
              <p className="font-semibold text-lg text-blue-800 dark:text-blue-200 mb-3">
                Mode: Behaviour Interview
              </p>
              {analysisData ? (
                <div className="flex items-center bg-green-100 dark:bg-green-900 p-3 rounded-md">
                  <p className="text-green-600 dark:text-green-400 font-medium text-justify" >
                    Your resume has been successfully processed.
                  </p>
                </div>
              ) : (
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-md">
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Your resume is not loaded. Please try again.
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === "technical" && (
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mb-4">
              <p className="font-semibold">Mode: Technical interview</p>
              {title && <p>Question: {title}</p>}
            </div>
          )}
          {state !== "idle" && (
            <>
              <div className="flex flex-row gap-2 bg-primary-50 dark:bg-zinc-700 px-4 py-2 md:p-2 text-sm items-center justify-center rounded-md font-medium text-pretty">
                <Ear className="size-7 md:size-5 text-primary-400" />
                Works best in a quiet environment with a good internet.
              </div>
              <Configure
                startAudioOff={startAudioOff}
                handleStartAudioOff={() => setStartAudioOff(!startAudioOff)}
              />
            </>
          )}
        </CardContent>
        <CardFooter>
          {state === "idle" ? (
            <Button
              id="nextBtn"
              fullWidthMobile
              key="next"
              disabled={
                !!((roomQs && !roomError) || (autoRoomCreation && !serverUrl))
              }
              onClick={() => handleRoomUrl()}
            >
              Next <ArrowRight />
            </Button>
          ) : (
            <Button
              key="Start"
              className="bg-zinc-800"
              fullWidthMobile
              onClick={() => start()}
              disabled={state !== "configuring"}
            >
              {state !== "configuring" && <Loader2 className="animate-spin" />}
              {status_text[state as keyof typeof status_text]}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
