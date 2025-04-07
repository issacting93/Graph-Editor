import React, { useState } from "react";
import { X, FileUp, FileText, Database, Upload, Check } from "lucide-react";
import { useEditorStore, Node } from "@/lib/store/editor-store";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportTab = "file" | "text" | "ai";

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>("file");
  const [fileData, setFileData] = useState<string | null>(null);
  const [textData, setTextData] = useState("");
  const [fileName, setFileName] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const addNode = useEditorStore((state) => state.addNode);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        setFileData(fileContent);
        setImportError(null);
      } catch (error) {
        setImportError(
          "Error reading file. Please make sure it's a valid JSON or CSV file.",
        );
        setFileData(null);
      }
    };

    reader.onerror = () => {
      setImportError("Error reading file. Please try again.");
      setFileData(null);
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      if (activeTab === "file" && fileData) {
        // Process file data
        const data = JSON.parse(fileData);

        if (Array.isArray(data)) {
          // Import array of nodes
          data.forEach((nodeData) => {
            const newNode: Node = {
              id: crypto.randomUUID(),
              type: nodeData.type,
              position: { x: Math.random() * 500, y: Math.random() * 300 }, // Random position
              attributes: nodeData.attributes || {},
              content: nodeData.content || "",
              choices: nodeData.choices || [],
              errors: [],
              selected: false,
            };
            addNode(newNode);
          });
        } else {
          // Import single node
          const newNode: Node = {
            id: crypto.randomUUID(),
            type: data.type,
            position: { x: 100, y: 100 },
            attributes: data.attributes || {},
            content: data.content || "",
            choices: data.choices || [],
            errors: [],
            selected: false,
          };
          addNode(newNode);
        }
      } else if (activeTab === "text" && textData) {
        // Process text data
        try {
          const data = JSON.parse(textData);

          if (Array.isArray(data)) {
            // Import array of nodes
            data.forEach((nodeData) => {
              const newNode: Node = {
                id: crypto.randomUUID(),
                type: nodeData.type,
                position: { x: Math.random() * 500, y: Math.random() * 300 }, // Random position
                attributes: nodeData.attributes || {},
                content: nodeData.content || "",
                choices: nodeData.choices || [],
                errors: [],
                selected: false,
              };
              addNode(newNode);
            });
          } else {
            // Import single node
            const newNode: Node = {
              id: crypto.randomUUID(),
              type: data.type,
              position: { x: 100, y: 100 },
              attributes: data.attributes || {},
              content: data.content || "",
              choices: data.choices || [],
              errors: [],
              selected: false,
            };
            addNode(newNode);
          }
        } catch (error) {
          // Handle non-JSON text data as character node
          const newNode: Node = {
            id: crypto.randomUUID(),
            type: "dialogue",
            position: { x: 100, y: 100 },
            attributes: { name: "Text Import" },
            content: textData,
            errors: [],
            selected: false,
          };
          addNode(newNode);
        }
      } else if (activeTab === "ai") {
        // This would call the AI text parsing logic in a real implementation
        console.log("AI text parsing triggered");
      }

      setImportSuccess(true);

      // Close modal after successful import
      setTimeout(() => {
        onClose();
        setImportSuccess(false);
        setFileData(null);
        setTextData("");
        setFileName("");
      }, 1500);
    } catch (error) {
      setImportError(
        "Error importing data. Please check the format and try again.",
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-cyber-dark-900 border border-cyber-muted rounded-lg w-[600px] shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyber-muted p-4">
          <h2 className="text-xl font-bold text-white">Import Data</h2>
          <button
            onClick={onClose}
            className="text-cyber-muted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cyber-muted">
          <button
            onClick={() => setActiveTab("file")}
            className={`flex-1 py-3 text-center font-medium
              ${
                activeTab === "file"
                  ? "text-white border-b-2 border-cyber-blue"
                  : "text-cyber-muted hover:text-white"
              }`}
          >
            <div className="flex items-center justify-center">
              <FileUp size={16} className="mr-2" />
              File Import
            </div>
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 py-3 text-center font-medium
              ${
                activeTab === "text"
                  ? "text-white border-b-2 border-cyber-blue"
                  : "text-cyber-muted hover:text-white"
              }`}
          >
            <div className="flex items-center justify-center">
              <FileText size={16} className="mr-2" />
              Text Import
            </div>
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 py-3 text-center font-medium
              ${
                activeTab === "ai"
                  ? "text-white border-b-2 border-cyber-blue"
                  : "text-cyber-muted hover:text-white"
              }`}
          >
            <div className="flex items-center justify-center">
              <Database size={16} className="mr-2" />
              AI Parser
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "file" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                  Upload File (JSON or CSV)
                </label>
                <div className="border-2 border-dashed border-cyber-muted rounded-lg p-8 text-center">
                  {fileName ? (
                    <div className="flex items-center justify-center text-white">
                      <FileText size={24} className="mr-2 text-cyber-blue" />
                      {fileName}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Upload size={32} className="text-cyber-muted" />
                      </div>
                      <p className="text-cyber-muted">
                        Drag & drop file here or click to browse
                      </p>
                      <p className="text-xs text-cyber-muted">
                        Supports JSON and CSV files
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {fileData && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                    Preview
                  </label>
                  <pre
                    className="bg-cyber-dark-800 text-cyber-blue-bright p-4 rounded-lg font-mono text-sm
                    overflow-x-auto whitespace-pre-wrap border border-cyber-muted max-h-48 overflow-y-auto"
                  >
                    {fileData.substring(0, 500)}
                    {fileData.length > 500 ? "..." : ""}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === "text" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                  Paste Text (JSON or Raw Text)
                </label>
                <textarea
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  placeholder="Paste JSON data or raw text to convert into nodes..."
                  className="w-full h-64 bg-cyber-dark-800 text-white rounded-lg px-3 py-2 font-mono
                    border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
                />
              </div>
              <div className="text-xs text-cyber-muted mb-4">
                <p>For JSON data, the structure should match:</p>
                <pre className="bg-cyber-dark-800 p-2 rounded-lg mt-1">
                  {`{
  "type": "character",
  "attributes": { "name": "John Doe" },
  "content": "Description here"
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-cyber-muted mb-1 uppercase tracking-wider">
                  AI-Assisted Text Parsing
                </label>
                <textarea
                  placeholder="Paste any text and our AI will automatically extract entities, relationships and convert them into nodes..."
                  className="w-full h-64 bg-cyber-dark-800 text-white rounded-lg px-3 py-2 font-mono
                    border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
                />
              </div>
              <div className="bg-cyber-dark-800 border border-cyber-muted rounded-lg p-4 mb-4">
                <div className="text-sm text-cyber-blue-bright font-medium mb-2">
                  How It Works
                </div>
                <ul className="text-xs text-cyber-muted space-y-1 list-disc pl-5">
                  <li>Paste any narrative text, dialogue, or description</li>
                  <li>
                    AI analyzes text to extract characters, locations, events
                  </li>
                  <li>
                    Automatically creates node structure with relationships
                  </li>
                  <li>Review generated nodes before importing</li>
                </ul>
              </div>
            </div>
          )}

          {/* Error message */}
          {importError && (
            <div className="mb-4 p-3 bg-cyber-red/10 border border-cyber-red rounded-lg text-cyber-red text-sm">
              {importError}
            </div>
          )}

          {/* Success message */}
          {importSuccess && (
            <div className="mb-4 p-3 bg-cyber-green/10 border border-cyber-green rounded-lg text-cyber-green text-sm flex items-center">
              <Check size={16} className="mr-2" />
              Import successful! Adding nodes to canvas...
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyber-dark-800 hover:bg-cyber-muted/20 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={
                (activeTab === "file" && !fileData) ||
                (activeTab === "text" && !textData)
              }
              className={`px-4 py-2 bg-cyber-blue/80 text-white rounded-lg flex items-center
                ${
                  (activeTab === "file" && !fileData) ||
                  (activeTab === "text" && !textData)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-cyber-blue"
                }`}
            >
              <Upload size={16} className="mr-2" />
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
