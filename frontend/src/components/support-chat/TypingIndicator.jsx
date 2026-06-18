/**
 * Typing Indicator
 * Animated 3-dot loader for AI response state
 */

import "./supportChat.css";

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="typing-dot" style={{ animationDelay: "0s" }} />
      <div className="typing-dot" style={{ animationDelay: "0.2s" }} />
      <div className="typing-dot" style={{ animationDelay: "0.4s" }} />
    </div>
  );
};

export default TypingIndicator;
