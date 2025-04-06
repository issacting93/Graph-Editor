import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  LinkIcon, 
  Lightbulb, 
  BrainCircuit
} from 'lucide-react';
import { useEditorStore } from '@/lib/store/editor-store';

type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

type SuggestionType = 'node' | 'connection' | 'insight';

interface Suggestion {
  id: string;
  type: SuggestionType;
  content: string;
  description: string;
  action?: () => void;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'How can I help with your graph?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [activeTool, setActiveTool] = useState<'chat' | 'suggestions'>('chat');
  
  const nodes = useEditorStore(state => state.nodes);
  const connections = useEditorStore(state => state.connections);
  const addNode = useEditorStore(state => state.addNode);
  const addConnection = useEditorStore(state => state.addConnection);
  
  // Mock suggestions based on the current graph
  const suggestions: Suggestion[] = [
    {
      id: '1',
      type: 'node',
      content: 'Add Missing Node',
      description: 'Add a condition node to link these decision paths.',
      action: () => {
        // Implementation for adding a suggested node
        console.log('Adding suggested node');
      }
    },
    {
      id: '2',
      type: 'connection',
      content: 'Connect Similar Nodes',
      description: 'Link "City Park" and "Downtown" locations as related areas.',
      action: () => {
        // Implementation for adding a connection
        console.log('Connecting suggested nodes');
      }
    },
    {
      id: '3',
      type: 'insight',
      content: 'Graph Analysis',
      description: 'There appears to be an orphaned node with no connections.',
      action: () => {
        // Implementation for showing analysis
        console.log('Showing graph analysis');
      }
    }
  ];

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Mock AI response
    setTimeout(() => {
      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your graph structure. You might want to consider adding a connection between your character node and the event node to establish causality.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mock explanation generation
  const explainConnection = () => {
    // Implementation for explaining a selected connection
    console.log('Explaining connection');
  };

  // Mock node suggestion
  const suggestNode = () => {
    // Implementation for suggesting a new node
    console.log('Suggesting node');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-cyber-muted p-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">
          <div className="flex items-center">
            <BrainCircuit className="mr-2 text-cyber-blue" />
            AI Assistant
          </div>
        </h2>
        
        {/* Tools Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTool('chat')}
            className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
              ${activeTool === 'chat' 
                ? 'bg-cyber-blue text-white' 
                : 'bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTool('suggestions')}
            className={`px-3 py-1 text-sm font-mono uppercase tracking-wider
              ${activeTool === 'suggestions' 
                ? 'bg-cyber-blue text-white' 
                : 'bg-cyber-dark-800 text-cyber-muted hover:bg-cyber-muted/20'}`}
          >
            Insights
          </button>
        </div>
      </div>

      {activeTool === 'chat' ? (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`${
                  message.role === 'assistant' 
                    ? 'bg-cyber-dark-800 border-l-2 border-cyber-blue' 
                    : 'bg-cyber-blue/10 border-l-2 border-cyber-pink'
                } p-3 rounded-lg max-w-[85%] ${
                  message.role === 'assistant' ? 'mr-auto' : 'ml-auto'
                }`}
              >
                <div className="text-sm text-white">{message.content}</div>
                <div className="text-xs text-cyber-muted mt-1 text-right">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-cyber-muted p-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your graph..."
                  className="w-full bg-cyber-dark-800 text-white rounded-lg px-4 py-2 pr-10
                    border border-cyber-muted focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-2 text-cyber-muted hover:text-cyber-blue"
                >
                  <Send size={18} />
                </button>
              </div>
              <button className="bg-cyber-blue hover:bg-cyber-blue/80 text-white p-2 rounded-lg">
                <Sparkles size={18} />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex mt-3 space-x-2">
              <button 
                onClick={explainConnection}
                className="bg-cyber-dark-800 hover:bg-cyber-muted/20 border border-cyber-muted
                  text-white py-1 px-2 rounded text-xs flex items-center"
              >
                <LinkIcon size={12} className="mr-1" />
                Explain Connection
              </button>
              <button 
                onClick={suggestNode}
                className="bg-cyber-dark-800 hover:bg-cyber-muted/20 border border-cyber-muted
                  text-white py-1 px-2 rounded text-xs flex items-center"
              >
                <Lightbulb size={12} className="mr-1" />
                Suggest Node
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* AI Suggestions */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {suggestions.map(suggestion => (
                <div 
                  key={suggestion.id}
                  className="bg-cyber-dark-800 border border-cyber-muted rounded-lg p-3 hover:border-cyber-blue"
                >
                  <div className="flex items-center">
                    {suggestion.type === 'node' && (
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                        <Lightbulb size={16} />
                      </div>
                    )}
                    {suggestion.type === 'connection' && (
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                        <LinkIcon size={16} />
                      </div>
                    )}
                    {suggestion.type === 'insight' && (
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
                        <Sparkles size={16} />
                      </div>
                    )}
                    
                    <div className="ml-3 flex-1">
                      <div className="text-white text-sm font-medium">{suggestion.content}</div>
                      <div className="text-cyber-muted text-xs">{suggestion.description}</div>
                    </div>
                    
                    <button 
                      onClick={suggestion.action}
                      className="bg-cyber-blue/20 hover:bg-cyber-blue text-white p-1 rounded"
                    >
                      <span className="text-xs px-1">Apply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="border-t border-cyber-muted p-4">
            <button className="w-full bg-cyber-blue/20 hover:bg-cyber-blue/30 text-white py-2 rounded-lg
              flex items-center justify-center">
              <BrainCircuit size={16} className="mr-2" />
              <span className="text-sm">Generate More Insights</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};