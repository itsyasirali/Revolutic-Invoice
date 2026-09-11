/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use client";

import * as React from "react";
import Container from "@/components/layout/container";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { X, Minus, Expand } from "lucide-react";
import chatData from "@/data/landing/chatData";

const Hero = () => {
  const [activeChatId, setActiveChatId] = React.useState(chatData[0].id);
  const activeChat = chatData.find((c) => c.id === activeChatId) || chatData[0];

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      <Container className="text-center">
        <div className="mx-auto max-w-5xl space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
            The AI-supported communication software for{" "}
            <span className="text-primary">your business.</span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg text-slate-600 md:text-xl font-semibold leading-relaxed">
            Automate customer support, scale your sales, and engage with users
            directly on WhatsApp. Build your intelligent agent in minutes, no
            coding required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base font-semibold h-14 px-8 rounded-full"
              asChild
            >
              <Link href="/auth">Get Started Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base font-semibold h-14 px-8 rounded-full"
              asChild
            >
              <Link href="/demo">Book a Demo</Link>
            </Button>
          </div>

          <p className="text-sm text-slate-700 pt-2">
            No credit card required. 14-day free trial.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-16 md:mt-24 relative mx-auto max-w-7xl text-left">
          <div className="rounded-xl border bg-white/50 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5">
            <div className="rounded-xl overflow-hidden border bg-slate-50">
              {/* Fake Browser Header */}
              <div className="flex h-10 items-center gap-2 border-b bg-white px-4">
                <div className="flex gap-1.5 group/window-controls">
                  <div className="h-3 w-3 rounded-full bg-red-400 flex items-center justify-center">
                    <X
                      className="h-2 w-2 text-red-900 opacity-60"
                      strokeWidth={3}
                    />
                  </div>
                  <div className="h-3 w-3 rounded-full bg-amber-400 flex items-center justify-center">
                    <Minus
                      className="h-2 w-2 text-amber-900 opacity-60"
                      strokeWidth={4}
                    />
                  </div>
                  <div className="h-3 w-3 rounded-full bg-green-400 flex items-center justify-center">
                    <Expand
                      className="h-2 w-2 text-green-900 opacity-60"
                      strokeWidth={3}
                    />
                  </div>
                </div>
                <div className="ml-4 flex h-6 flex-1 items-center rounded-md bg-slate-100 px-3 text-xs text-slate-400">
                  agentchat.app
                </div>
              </div>

              {/* Mockup Content */}
              <div className="h-[400px] md:h-[600px] w-full bg-slate-50 relative flex items-center justify-center">
                {/* Simplified Chat Interface Mockup */}
                <div className="flex h-full w-full">
                  {/* Sidebar */}
                  <div className="w-64 border-r bg-white hidden md:block p-4 overflow-hidden">
                    <div className="font-semibold text-lg text-slate-800 mb-4 px-2">
                      Messages
                    </div>
                    <div className="space-y-1">
                      {chatData.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                          className={`flex gap-3 items-center p-2 rounded-lg cursor-pointer transition-colors ${activeChatId === chat.id ? "bg-slate-100" : "hover:bg-slate-50"}`}
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                            {chat.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <div className="font-semibold text-sm text-slate-700 truncate">
                                {chat.name}
                              </div>
                              <div
                                className={`text-[10px] shrink-0 ${chat.unread > 0 ? "text-primary font-medium" : "text-slate-400"}`}
                              >
                                {chat.time}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                              <div className="text-xs text-slate-500 truncate mr-2">
                                {chat.messages[chat.messages.length - 1].text}
                              </div>
                              {chat.unread > 0 && (
                                <div className="h-4 min-w-4 px-1 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-medium shrink-0">
                                  {chat.unread}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Main Chat */}
                  <div className="flex-1 flex flex-col bg-slate-50/50">
                    <div className="h-16 border-b bg-white flex items-center px-6 gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {activeChat.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-700">
                          {activeChat.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          {activeChat.online ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>{" "}
                              Online
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>{" "}
                              Offline
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-6 space-y-6 overflow-hidden overflow-y-auto">
                      {activeChat.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-4 max-w-lg ${msg.sender === "agent" ? "ml-auto justify-end" : ""}`}
                        >
                          {msg.sender === "user" && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-xs mt-auto">
                              {activeChat.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div
                            className={`${msg.sender === "agent" ? "bg-primary text-primary-foreground shadow-sm p-4 rounded-xl rounded-br-none" : "bg-white border shadow-sm p-4 rounded-xl rounded-bl-none"}`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div
                              className={`text-[10px] mt-2 ${msg.sender === "agent" ? "text-primary-foreground/70 text-right" : "text-slate-400"}`}
                            >
                              {msg.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
