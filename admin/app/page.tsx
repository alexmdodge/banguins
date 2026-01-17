"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import * as BACKEND from "../config/latest-deploy.json";
import { Input } from "@/components/ui/input";

// NOTE: This can change
const WS_URL = BACKEND["banguins-app"]?.websocketapiendpoint;

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

export default function Home() {
  const [wsState, setWsState] = useState(States.DISCONNECTED);
  const [status, setStatus] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
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
      setMessages((prev) => [...prev, event.data]);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

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
      <section className="space-y-2 bg-slate-200 p-4 rounded-md">
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
          <CardContent>
            <div className="flex items-center gap-2">
              <Button variant="default" onClick={sendMessage}>
                Send Message
              </Button>
              <Input
                onChange={(e) => setInput(e.target.value)}
                placeholder="Websocket message . . ."
              ></Input>
            </div>
          </CardContent>
          <hr />
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
          {messages.map((msg, i) => (
            <CardContent key={i} className="space-y-2">
              {msg}
            </CardContent>
          ))}
        </Card>
      </section>
    </main>
  );
}
