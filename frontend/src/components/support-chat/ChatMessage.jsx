/**
 * Chat Message Component
 * Renders individual chat messages with styling
 */

import { motion } from "framer-motion";
import "./supportChat.css";

const ChatMessage = ({ message, isUser }) => {
  const renderMessageContent = (text) => {
    const blocks = text.split(/(```[\s\S]*?```)/g);

    return blocks.map((block, blockIndex) => {
      if (block.startsWith("```") && block.endsWith("```")) {
        const codeText = block.slice(3, -3).trim();
        return (
          <pre
            key={`code-${blockIndex}`}
            className={`chat-code-block ${isUser ? "chat-code-block-user" : "chat-code-block-agent"}`}
          >
            <code>{codeText}</code>
          </pre>
        );
      }

      const inlineSegments = block.split(/(`[^`]+`)/g);
      return (
        <div key={`text-${blockIndex}`}>
          {inlineSegments.map((segment, segmentIndex) => {
            if (segment.startsWith("`") && segment.endsWith("`")) {
              return (
                <code key={`inline-${segmentIndex}`} className="inline-code">
                  {segment.slice(1, -1)}
                </code>
              );
            }

            return segment.split("\n").map((line, lineIndex) => (
              <div key={`line-${segmentIndex}-${lineIndex}`}>{line || "\u00A0"}</div>
            ));
          })}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-emerald-600 text-white shadow-md"
            : "rounded-bl-md bg-gray-100 text-gray-800 shadow-sm"
        }`}
      >
        <div className="break-words">{renderMessageContent(message)}</div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
