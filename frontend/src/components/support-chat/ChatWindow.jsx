/**
 * Chat Window Component
 * Main chat interface with header, messages, and input
 */

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import "./supportChat.css";

const AGENT_AVATAR =
  "https://images.pexels.com/photos/31868218/pexels-photo-31868218.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=100&w=100";

const ChatWindow = ({ onClose, onSendMessage, isLoading, messages }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput("");
    // Re-focus input after sending
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="chat-window" role="dialog" aria-modal="true" aria-label="MessDekho AI Support">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="relative">
            {/* Use MessDekho logo instead of generic avatar */}
            <div className="support-logo" aria-label="MessDekho AI Support Logo" />
            <span className="chat-online-indicator" />
          </div>
          <div className="chat-header-info">
            <h3 className="chat-header-title">MessDekho AI Support</h3>
            <p className="chat-header-subtitle">Typically replies instantly</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="chat-close-btn"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            message={msg.text}
            isUser={msg.from === "me"}
          />
        ))}

        {isLoading && (
          <div className="flex items-start ai-thinking-container">
            {/* Glowing AI indicator placed left of the typing bubble */}
            <div className="ai-thinking-icon" aria-label="AI is thinking" />
            <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="chat-input-section">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="chat-send-btn"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
