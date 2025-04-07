import React, { useState } from "react";
import { DataLibrary } from "./components/DataLibrary";
import { EnhancedGraphCanvas } from "./components/EnhancedGraphCanvas";
import { Inspector } from "./components/Inspector";
import { AIAssistant } from "./components/AIAssistant";

function App() {
  const [activeRightPanel, setActiveRightPanel] = useState<
    "inspector" | "assistant"
  >("inspector");

  return (
    <div className="flex h-screen bg-cyber-dark text-white">
      {/* Left Panel - Data Library */}
      <div className="w-64 border-r border-cyber-muted">
        <DataLibrary />
      </div>

      {/* Middle Panel - Graph Canvas */}
      <div className="flex-1 relative">
        <EnhancedGraphCanvas />
      </div>

      {/* Right Panel with Tabs */}
      <div className="w-80 border-l border-cyber-muted">
        {/* Tabs */}
        <div className="flex border-b border-cyber-muted">
          <button
            onClick={() => setActiveRightPanel("inspector")}
            className={`flex-1 py-3 text-center font-medium
              ${
                activeRightPanel === "inspector"
                  ? "text-white border-b-2 border-cyber-blue"
                  : "text-cyber-muted hover:text-white"
              }`}
          >
            Inspector
          </button>
          <button
            onClick={() => setActiveRightPanel("assistant")}
            className={`flex-1 py-3 text-center font-medium
              ${
                activeRightPanel === "assistant"
                  ? "text-white border-b-2 border-cyber-blue"
                  : "text-cyber-muted hover:text-white"
              }`}
          >
            AI Assistant
          </button>
        </div>

        {/* Panel Content */}
        <div className="h-[calc(100vh-48px)]">
          {activeRightPanel === "inspector" ? <Inspector /> : <AIAssistant />}
        </div>
      </div>
    </div>
  );
}

export default App;
