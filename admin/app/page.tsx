"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

// NOTE: This can change
const WS_URL = "wss://39mbb0jtq3.execute-api.us-east-1.amazonaws.com/dev";

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
      socketRef.current.send(input);
      setInput("");
      return;
    }

    setStatus([...status, "Cannot send: socket not open"]);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Banguins Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Game Websocket Test Client
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ConnectionStatusBadge state={wsState} />

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="default">Connect</Button>
              <Button variant="outline">Disconnect</Button>
              <Button variant="ghost">Reconnect</Button>
            </div>
          </CardContent>
          {status.map((sts, i) => (
            <CardContent key={i} className="space-y-2">
              {sts}
            </CardContent>
          ))}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
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
