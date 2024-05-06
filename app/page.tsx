"use client";

import Spinner from "@/components/spinner";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useActions, useUIState } from "ai/rsc";
import { Computer, Send, User } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ClientMessage } from "./actions/ai";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="grid min-h-screen w-full bg-background p-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="hidden md:flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Choose specific model generation settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <Input type="radio" />
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="grid md:col-span-2">
          <ScrollArea className="grid content-end h-[80vh] sm:h-[87vh] rounded-md border bg-muted/40">
            <div className="flex flex-col-reverse gap-4 p-4">
              {conversation.map((message: ClientMessage) => (
                <div
                  key={message.id}
                  className="flex gap-4 items-center rounded-lg border p-4 bg-background whitespace-pre-wrap"
                >
                  {message.role === "user" ? (
                    <div className="p-1.5 bg-rose-400/90 rounded-lg shadow">
                      <User className="size-7" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-slate-400/90 shadow-sm rounded-lg">
                      <Computer className="size-7" />
                    </div>
                  )}
                  {message.display}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);

            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              { id: nanoid(), role: "user", display: input },
            ]);

            const message = await continueConversation(input);
            setInput("");

            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              message,
            ]);
            setIsLoading(false);
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-background rounded-t-xl border-t">
            <div className="flex gap-4 w-full">
              <ModeToggle />
              <Input
                type="text"
                value={input}
                placeholder="Enter a new prompt"
                required
                disabled={isLoading}
                className="bg-muted/60"
                onChange={(event) => {
                  setInput(event.target.value);
                }}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex gap-1.5">
                  Loading <Spinner />
                </div>
              ) : (
                <div className="flex gap-1.5">
                  Send Message <Send size={20} strokeWidth={1.75} />
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
