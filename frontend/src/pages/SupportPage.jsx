import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ChatWindow from "@/components/support-chat/ChatWindow";
import SupportSidebar from "@/components/support-chat/SupportSidebar";
import { getAIResponse } from "@/components/support-chat/geminiService";
import "@/components/support-chat/supportChat.css";

const WELCOME_MESSAGE = {
  from: "agent",
  text: "Hi 👋 Welcome to MessDekho Support. How can I help you today?",
};

export default function SupportPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const previousChats = useMemo(() => {
    return messages
      .filter((msg) => msg.from === "me")
      .map((msg) => msg.text)
      .slice(-5)
      .reverse();
  }, [messages]);

  const handleSendMessage = useCallback(
    async (userMessage) => {
      const nextMessages = [...messages, { from: "me", text: userMessage }];
      setMessages(nextMessages);
      setIsLoading(true);

      try {
        const aiResponse = await getAIResponse(userMessage, nextMessages);
        setMessages((prev) => [...prev, { from: "agent", text: aiResponse }]);
      } catch (error) {
        console.error("Support chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            from: "agent",
            text: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const handleSidebarPrompt = useCallback(
    (prompt) => {
      if (!prompt || isLoading) return;
      handleSendMessage(prompt);
    },
    [handleSendMessage, isLoading]
  );

  return (
    <div className="support-page">
      <SupportSidebar previousChats={previousChats} onSelectCategory={handleSidebarPrompt} />

      <main className="support-main">
        <motion.div
          className="support-chat-panel"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <ChatWindow
            onClose={() => window.history.back()}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            messages={messages}
          />
        </motion.div>
      </main>
    </div>
  );
}
