import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const AGENT_AVATAR =
  "https://images.pexels.com/photos/31868218/pexels-photo-31868218.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=100&w=100";

const SEED = [
  { from: "agent", text: "Hi! I'm Priya from Mess Dekho. How can I help you today?" },
  { from: "agent", text: "You can ask about a specific PG, pricing, or booking status." },
];

export default function Chat() {
  const [messages, setMessages] = useState(SEED);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { from: "me", text }]);
    setInput("");
    // Canned reply (mock)
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: "agent",
          text: "Got it — sharing top matches near you. A specialist will join this thread in a moment.",
        },
      ]);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="chat-page">
      <Navbar />
      <section className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 bg-emerald-50/40 px-5 py-4">
            <div className="relative">
              <img src={AGENT_AVATAR} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="font-heading text-base font-semibold text-gray-900">Priya · Mess Dekho</div>
              <div className="text-xs font-medium text-emerald-700">Online · typically replies in under a minute</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex h-[480px] flex-col gap-3 overflow-y-auto px-5 py-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                data-testid={`chat-msg-${i}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.from === "me"
                      ? "rounded-br-md bg-emerald-700 text-white"
                      : "rounded-bl-md bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
              data-testid="chat-input"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white transition hover:bg-emerald-800"
              data-testid="chat-send-btn"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
