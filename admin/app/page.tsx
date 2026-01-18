"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import * as BACKEND from "../config/latest-deploy.json";
import { Input } from "@/components/ui/input";
import { generateGameId } from "./game/utils";
import { Label } from "@radix-ui/react-label";

// NOTE: This can change
const WS_URL = `${BACKEND["banguins-app"]?.websocketapiendpoint}`;

const States = {
  DISCONNECTED: "Disconnected",
  CONNECTED: "Connected",
  ERRORED: "Errored",
};

function ConnectionStatusBadge({ state }: { state: string }) {
  if (state === States.CONNECTED) {
    return (
      <Badge className="bg-emerald-600 text-emerald-50">
        {States.CONNECTED}
      </Badge>
    );
  }

  if (state === States.ERRORED) {
    return <Badge variant="destructive">{States.ERRORED}</Badge>;
  }

  return <Badge variant="outline">{States.DISCONNECTED}</Badge>;
}

type GameMessage = {
  userId: string;
  gameId: string;
  message: string;
};

export default function Home() {
  const [wsState, setWsState] = useState(States.DISCONNECTED);
  const [gameIdVal, setGameIdVal] = useState<string>(generateGameId());
  const [gameId, setGameId] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | undefined>();
  const [status, setStatus] = useState<string[]>([]);
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (socketRef.current) return;
    if (!gameId) return;

    let GAME_URL = `${WS_URL}?gameId=${gameId}`;
    if (userId) {
      GAME_URL += `&userId=${userId}`;
    }

    const socket = new WebSocket(GAME_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setWsState(States.CONNECTED);
      setStatus((prev) => [...prev, "Connected to Websocket"]);
    };
    socket.onclose = (event) => {
      setWsState(States.DISCONNECTED);
      socketRef.current = null;

      setStatus((prev) => [
        ...prev,
        `Closing with code ${event.code}, for reason ${event.reason}, clean? ${event.wasClean}`,
      ]);
    };
    socket.onerror = () => {
      setWsState(States.ERRORED);
      setStatus((prev) => [...prev, "Websocket errored"]);
    };
    socket.onmessage = (event) => {
      try {
        const msg: GameMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (e) {
        setStatus((prev) => [...prev, `Error parsing msg: ${e}`]);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [gameId, userId]);

  const sendMessage = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ action: "sendmessage", data: input })
      );
      setInput("");
      return;
    }

    setStatus([...status, "Cannot send: socket not open"]);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-3">
      <section className="space-y-2 bg-slate-300 p-4 rounded-md shadow">
        <h1 className="text-2xl font-semibold">Banguins Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Game Websocket Test Client
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="bg-slate-600 text-white p-4 rounded-md m-0">
              Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <p>Websocket Status:</p>
            <ConnectionStatusBadge state={wsState} />
          </CardContent>
          <hr />
          <CardContent className="flex flex-col gap-2">
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="userId" className="text-sm">
                User ID
              </Label>
              <Input
                id="userId"
                placeholder="Enter a user ID for the game messages"
                onChange={(e) => setUserId(e.target.value)}
                maxLength={32}
                autoCapitalize="characters"
                disabled={socketRef.current !== null}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="gameId" className="text-sm">
                Game ID
              </Label>
              <div className="flex w-full max-w-md">
                <Input
                  id="gameId"
                  placeholder="Enter or paste game code"
                  value={gameIdVal}
                  onChange={(e) => setGameIdVal(e.target.value)}
                  maxLength={5}
                  autoCapitalize="characters"
                  className="rounded-r-none rounded-l-md"
                  disabled={socketRef.current !== null}
                />
                <Button
                  variant="default"
                  className="cursor-pointer rounded-none"
                  disabled={socketRef.current !== null}
                  onClick={() => setGameId(gameIdVal)}
                >
                  Apply
                </Button>
                <Button
                  variant="secondary"
                  className="cursor-pointer rounded-l-none rounded-r-md border-2"
                  disabled={socketRef.current !== null}
                  onClick={() => {
                    setGameIdVal(generateGameId());
                  }}
                >
                  Generate
                </Button>
              </div>
            </div>
            <div className="flex w-full"></div>
          </CardContent>
          <hr />
          <CardContent>
            <p>Status Messages</p>
          </CardContent>
          {status.map((sts, i) => (
            <CardContent key={i} className="space-y-2">
              {sts}
            </CardContent>
          ))}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="bg-slate-600 text-white p-4 rounded-md">
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Button
                className="cursor-pointer"
                variant="default"
                onClick={sendMessage}
                disabled={wsState !== States.CONNECTED}
              >
                Send Message
              </Button>
              <Input
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter message"
                disabled={wsState !== States.CONNECTED}
              ></Input>
            </div>
          </CardContent>
          <hr />
          {messages.map((msg, i) => (
            <CardContent key={i} className="space-y-2">
              [{msg.userId}] | {msg.message}
            </CardContent>
          ))}
        </Card>
      </section>
    </main>
  );
}
