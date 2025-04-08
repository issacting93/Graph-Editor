import React, { useState } from "react";

export function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input);
        setInput("");
      }
    }
  };

  return (
    <textarea
      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Type your message..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
} 