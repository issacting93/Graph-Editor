import React, { useState } from "react";
import { Search, Upload, FileText, Database, FolderOpen } from "lucide-react";
import { useEditorStore, NodeType } from "@/lib/store/editor-store";

type DataSource = {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  preview?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type DataCategory = "recent" | "local" | "imported" | "generated";

const mockDataSources: Record<DataCategory, DataSource[]> = {
  recent: [
    {
      id: "1",
      name: "Character: John Doe",
      type: "character",
      description: "Main protagonist",
      preview: "A middle-aged detective with a troubled past.",
    },
    {
      id: "2",
      name: "Location: City Park",
      type: "location",
      description: "Central location",
      preview: "A large urban park with various landmarks.",
    },
  ],
  local: [
    {
      id: "3",
      name: "Event: Bank Robbery",
      type: "event",
      description: "Key plot point",
      preview: "A major incident that starts the main storyline.",
    },
  ],
  imported: [
    {
      id: "4",
      name: "Character Dataset",
      type: "character",
      description: "JSON file with 15 entries",
      preview:
        "Collection of character data with personalities, backgrounds, etc.",
    },
  ],
  generated: [
    {
      id: "5",
      name: "AI Generated Items",
      type: "item",
      description: "Generated from text prompt",
      preview: "Collection of fantasy items with properties and descriptions.",
    },
  ],
};

export const DataLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DataCategory>("recent");
  const [previewItem, setPreviewItem] = useState<DataSource | null>(null);

  const handleDragStart = (e: React.DragEvent, item: DataSource) => {
    const dragData = {
      type: item.type,
      attributes: {
        name: item.name.split(": ")[1] || item.name,
        description: item.description,
      },
      content: item.preview || "",
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = mockDataSources[activeCategory].filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const importFromText = () => {
    // Logic for importing from text using LLM will go here
    console.log("Importing from text");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-cyber-muted p-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">
          Data Library
        </h2>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search data..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-cyber-muted/20 text-white rounded px-3 py-2 pl-10
              border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyber-muted" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 p-4 border-b border-cyber-muted">
        <button
          onClick={() => setActiveCategory("recent")}
          className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
            ${
              activeCategory === "recent"
                ? "bg-cyber-blue text-white"
                : "bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20"
            }`}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveCategory("local")}
          className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
            ${
              activeCategory === "local"
                ? "bg-cyber-blue text-white"
                : "bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20"
            }`}
        >
          Local
        </button>
        <button
          onClick={() => setActiveCategory("imported")}
          className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
            ${
              activeCategory === "imported"
                ? "bg-cyber-blue text-white"
                : "bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20"
            }`}
        >
          Imported
        </button>
        <button
          onClick={() => setActiveCategory("generated")}
          className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
            ${
              activeCategory === "generated"
                ? "bg-cyber-blue text-white"
                : "bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20"
            }`}
        >
          AI Gen
        </button>
      </div>

      {/* Data Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredData.length === 0 ? (
          <div className="text-cyber-muted text-center mt-8">
            No data found. Try a different search or category.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredData.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onMouseEnter={() => setPreviewItem(item)}
                onMouseLeave={() => setPreviewItem(null)}
                className="bg-cyber-dark-800 border border-cyber-muted rounded-lg p-3
                  hover:border-cyber-blue cursor-move transition-all duration-200 relative"
              >
                <div className="flex items-center">
                  {/* Icon based on type */}
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full 
                    ${
                      item.type === "character"
                        ? "bg-blue-500/20"
                        : item.type === "location"
                          ? "bg-green-500/20"
                          : item.type === "event"
                            ? "bg-red-500/20"
                            : item.type === "item"
                              ? "bg-yellow-500/20"
                              : "bg-purple-500/20"
                    }`}
                  >
                    {item.type === "character" ? (
                      <div className="text-blue-400">👤</div>
                    ) : item.type === "location" ? (
                      <div className="text-green-400">📍</div>
                    ) : item.type === "event" ? (
                      <div className="text-red-400">📅</div>
                    ) : item.type === "item" ? (
                      <div className="text-yellow-400">📦</div>
                    ) : (
                      <div className="text-purple-400">📊</div>
                    )}
                  </div>

                  <div className="ml-3 flex-1">
                    <div className="text-white text-sm font-medium">
                      {item.name}
                    </div>
                    <div className="text-cyber-muted text-xs">
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Preview tooltip */}
                {previewItem?.id === item.id && item.preview && (
                  <div
                    className="absolute z-10 left-full top-0 ml-2 w-64 bg-cyber-dark-900 border border-cyber-blue
                    rounded-lg p-3 shadow-lg text-xs text-white"
                  >
                    <div className="font-medium mb-1 text-cyber-blue">
                      Preview
                    </div>
                    <div>{item.preview}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Controls */}
      <div className="border-t border-cyber-muted p-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            className="bg-cyber-dark-800 hover:bg-cyber-blue/20 border border-cyber-muted
            text-white py-2 px-3 rounded flex items-center justify-center"
          >
            <Upload size={14} className="mr-1" />
            <span className="text-xs">Import</span>
          </button>
          <button
            className="bg-cyber-dark-800 hover:bg-cyber-blue/20 border border-cyber-muted
            text-white py-2 px-3 rounded flex items-center justify-center"
          >
            <FileText size={14} className="mr-1" />
            <span className="text-xs">CSV</span>
          </button>
          <button
            onClick={importFromText}
            className="bg-cyber-dark-800 hover:bg-cyber-blue/20 border border-cyber-muted
            text-white py-2 px-3 rounded flex items-center justify-center"
          >
            <Database size={14} className="mr-1" />
            <span className="text-xs">AI Parse</span>
          </button>
        </div>
      </div>
    </div>
  );
};
