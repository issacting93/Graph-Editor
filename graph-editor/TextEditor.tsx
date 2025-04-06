import React, { useState, useEffect, useRef } from 'react';
import { Hash, Bold, Italic, Underline, Code, List, Link, MoreHorizontal, Plus, Trash2, Menu } from 'lucide-react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { ListItem, ListItemText } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const TextEditor = () => {
  // Basic state
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [notes, setNotes] = useState([
    { id: 1, title: 'Welcome Note', content: 'Welcome to your minimalist editor! You can use #tags to organize your thoughts.' },
    { id: 2, title: 'Quick Tips', content: 'Use **bold**, *italic*, and #tags to format your notes.' }
  ]);
  const [activeNoteId, setActiveNoteId] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);
  const [noteTitle, setNoteTitle] = useState('');
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  // Load active note when changed
  useEffect(() => {
    const activeNote = notes.find(note => note.id === activeNoteId);
    if (activeNote) {
      setContent(activeNote.content);
      setNoteTitle(activeNote.title);
    }
  }, [activeNoteId, notes]);
  
  // Process content to find tags
  useEffect(() => {
    const tagRegex = /#([a-zA-Z0-9_-]+)/g;
    const matches = [...content.matchAll(tagRegex)];
    const foundTags = matches.map(match => match[1]);
    
    // Remove duplicates
    const uniqueTags = [...new Set(foundTags)];
    setTags(uniqueTags);
    
    // Count words
    const words = content.trim().split(/\s+/);
    setWordCount(content.trim() ? words.length : 0);
  }, [content]);
  
  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    // Update the note in the notes array
    setNotes(notes.map(note => 
      note.id === activeNoteId ? { ...note, content: e.target.value } : note
    ));
  };
  
  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteTitle(e.target.value);
    // Update the note title in the notes array
    setNotes(notes.map(note => 
      note.id === activeNoteId ? { ...note, title: e.target.value } : note
    ));
  };
  
  // Insert tag at cursor position
  const insertTag = (tag: string) => {
    if (!editorRef.current) return;
    const cursorPosition = editorRef.current.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    
    // Insert tag at cursor position
    const newContent = `${textBeforeCursor}#${tag} ${textAfterCursor}`;
    setContent(newContent);
    
    // Update the note in the notes array
    setNotes(notes.map(note => 
      note.id === activeNoteId ? { ...note, content: newContent } : note
    ));
    
    // Focus back on editor after small delay to allow state update
    setTimeout(() => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      const newCursorPosition = cursorPosition + tag.length + 2; // +2 for # and space
      editorRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 10);
  };
  
  // Create a new tag
  const createNewTag = () => {
    const tagName = prompt('Enter new tag name (no spaces, use - or _ for separators):');
    if (tagName && /^[a-zA-Z0-9_-]+$/.test(tagName)) {
      insertTag(tagName);
    } else if (tagName) {
      alert('Tag name can only contain letters, numbers, underscores and hyphens.');
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    // Auto-hide toolbar in fullscreen for maximum focus
    if (!fullscreen) {
      setShowToolbar(false);
    } else {
      setShowToolbar(true);
    }
  };
  
  // Toggle toolbar visibility
  const toggleToolbar = () => {
    setShowToolbar(!showToolbar);
  };
  
  // Create new note
  const createNewNote = () => {
    const newId = notes.length > 0 ? Math.max(...notes.map(note => note.id)) + 1 : 1;
    const newNote = {
      id: newId,
      title: `New Note ${newId}`,
      content: ''
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newId);
  };
  
  // Delete current note
  const deleteCurrentNote = () => {
    if (notes.length <= 1) {
      alert('You cannot delete the last note.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      const newNotes = notes.filter(note => note.id !== activeNoteId);
      setNotes(newNotes);
      setActiveNoteId(newNotes[0].id);
    }
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Format text with markdown syntax
  const formatText = (format: string) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let cursorPosition = 0;
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = start + 1;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        cursorPosition = start + 1;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        cursorPosition = start + 1;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        cursorPosition = end + 3;
        break;
      case 'list':
        // Split text by newlines and add "- " to each line
        formattedText = selectedText
          .split('\n')
          .map(line => `- ${line}`)
          .join('\n');
        cursorPosition = start + 2;
        break;
      default:
        formattedText = selectedText;
        cursorPosition = start;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Update the note in the notes array
    setNotes(notes.map(note => 
      note.id === activeNoteId ? { ...note, content: newContent } : note
    ));
    
    // Set focus and cursor position
    setTimeout(() => {
      if (!editorRef.current) return;
      textarea.focus();
      if (selectedText) {
        // If text was selected, place cursor at end of formatted text
        const newPosition = start + formattedText.length;
        textarea.setSelectionRange(newPosition, newPosition);
      } else {
        // If no text was selected, place cursor in the middle of formatting marks
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 10);
  };
  
  // Render highlighted content for preview
  const renderHighlightedContent = () => {
    if (!content) return null;
    
    // Replace markdown formatting with HTML
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<u>$1</u>')
      .replace(/\`(.*?)\`/g, '<code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline">$1</a>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
      .replace(/#([a-zA-Z0-9_-]+)/g, '<span class="tag">#$1</span>')
      .replace(/\n/g, '<br />');
    
    return <div 
      className="whitespace-pre-wrap break-words leading-relaxed tracking-wide" 
      dangerouslySetInnerHTML={{ __html: formattedContent }} 
    />;
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'} ${fullscreen ? 'fixed inset-0 z-50' : ''}`} style={{ fontFamily: 'Barlow, sans-serif' }}>
      
      {/* Sidebar */}
      <Drawer variant="persistent" open={showSidebar && !fullscreen}>
        <div className={`w-64 p-4 flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ fontFamily: 'Barlow, sans-serif' }}>
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6">Notes</Typography>
            <IconButton onClick={createNewNote} title="New Note">
              <Plus size={16} />
            </IconButton>
          </div>
          <div className="flex-grow overflow-y-auto">
            {notes.map(note => (
              <div 
                key={note.id} 
                onClick={() => setActiveNoteId(note.id)}
                className={`p-2 mb-1 rounded cursor-pointer ${
                  note.id === activeNoteId 
                    ? (darkMode ? 'bg-gray-700' : 'bg-blue-100') 
                    : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                }`}
              >
                <Typography variant="body1" className="font-medium truncate">{note.title}</Typography>
                <Typography variant="body2" className="text-xs opacity-60 truncate">
                  {note.content.slice(0, 60)}{note.content.length > 60 ? '...' : ''}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
      
      {/* Main Editor Area */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Editor Header */}
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={toggleSidebar} title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}>
              <Menu size={16} />
            </IconButton>
            <TextField
              value={noteTitle}
              onChange={handleTitleChange}
              variant="outlined"
              placeholder="Note title"
              fullWidth
              InputProps={{
                className: darkMode ? 'bg-gray-900' : 'bg-white',
                style: { fontFamily: 'Barlow, sans-serif' }
              }}
            />
            <IconButton edge="end" color="inherit" onClick={deleteCurrentNote} title="Delete Note">
              <Trash2 size={16} />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        {/* Main Editor Content */}
        <div className="flex-grow flex flex-col">
          <TextField
            ref={editorRef}
            value={content}
            onChange={handleChange}
            variant="outlined"
            multiline
            fullWidth
            rows={20}
            placeholder="Start typing... Use #tag to create tags"
            InputProps={{
              className: `p-6 text-lg leading-loose tracking-wide ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-800'}`,
              style: { minHeight: '400px', lineHeight: '1.8', fontFamily: 'Barlow, sans-serif' },
            }}
          />
          
          {/* Tags Area - Only visible when not in fullscreen */}
          {!fullscreen && tags.length > 0 && (
            <div className={`p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ fontFamily: 'Barlow, sans-serif' }}>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Button
                    key={tag}
                    onClick={() => insertTag(tag)}
                    variant="contained"
                    color="primary"
                    startIcon={<Hash size={12} />}
                    className={`flex items-center px-2 py-1 rounded text-sm ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-blue-300' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                    }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Preview Area - Only visible when not in fullscreen */}
          {!fullscreen && content && (
            <div className={`${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-100 border-t border-gray-200'} p-6`} style={{ fontFamily: 'Barlow, sans-serif' }}>
              <h3 className={`text-sm font-medium mb-4 uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Preview</h3>
              <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''} prose-p:leading-relaxed prose-p:tracking-wide`}>
                {renderHighlightedContent()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Barlow', sans-serif;
        }
        
        .tag {
          color: ${darkMode ? '#90cdf4' : '#3182ce'};
          background-color: ${darkMode ? 'rgba(49, 130, 206, 0.1)' : 'rgba(235, 244, 255, 0.8)'};
          padding: 0 4px;
          border-radius: 4px;
          font-family: 'Barlow', sans-serif;
        }
        
        textarea, input {
          font-family: 'Barlow', sans-serif;
        }
        
        textarea::placeholder {
          opacity: 0.4;
        }
        
        @media (min-width: 768px) {
          textarea {
            max-width: 50em;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default TextEditor;
