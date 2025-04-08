import React from "react";
import ReactMarkdown from "react-markdown";

export function ChatMessage({
  message,
  sender,
}: {
  message: string;
  sender: "user" | "assistant";
}) {
  return (
    <div
      className={`my-2 p-3 rounded-lg max-w-md ${
        sender === "assistant" ? "bg-gray-100" : "bg-blue-100"
      }`}
    >
      <ReactMarkdown>{message}</ReactMarkdown>
    </div>
  );
} 