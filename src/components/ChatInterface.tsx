import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Preview } from './Preview';
import { Input } from "./ui/input"; // Added import for Input component


interface Message {
  content: string;
  isUser: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([{
    content: "Hello! I'm Waves.\nHow can I help you with\nyour code today?",
    isUser: false
  }]);
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(Date.now().toString());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [apiKey, setApiKey] = useState(""); // Added API key state

  useEffect(() => {
    const savedKey = localStorage.getItem("llama_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem("llama_api_key", newKey);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { content: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey // Added API key to headers
        },
        body: JSON.stringify({ 
          prompt: userMessage,
          lastCode: preview || '',
          conversationId
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      // Check if the response contains code
      const hasCode = data.content && (
        data.content.includes('<') || 
        data.content.includes('{') || 
        data.content.includes('function') ||
        data.content.includes('class')
      );

      if (hasCode) {
        setPreview(data.content);
        setCode(data.content);
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Always show the chat response
      if (data.chatText) {
        setMessages(prev => [...prev, { content: data.chatText, isUser: false }]);
      } else if (!hasCode) {
        // If there's no code and no chatText, use content as chat message
        setMessages(prev => [...prev, { content: data.content, isUser: false }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { content: 'Sorry, there was an error processing your request.', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Exported HTML</title>
</head>
<body>
${preview}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
          const bodyContent = bodyMatch[1];
          setPreview(bodyContent);
          setCode(bodyContent);
        }
      };
      reader.readAsText(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    setPreview(newCode); // Update preview with the edited code
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white">
      {/* API Key Input */}
      <div className="p-4 border-b">
        <Input
          type="text"
          placeholder="Enter your Llama API key"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="w-full"
        />
      </div>

      {/* Beta Notice */}
      <div className="bg-[#7C3AED] text-white text-center py-2 px-4">
        This is in beta, glitches will occur. Made by{' '}
        <a 
          href="https://github.com/evorklausen" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-gray-200"
        >
          evorklausen
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 overflow-hidden">
        {/* Chat Section */}
        <div className="flex flex-col h-full border-r border-gray-800 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.isUser 
                    ? 'bg-[#7C3AED] ml-auto' 
                    : 'bg-[#1E1E1E]'
                } max-w-[80%] whitespace-pre-wrap`}
              >
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-800">
            <div className="flex space-x-2 mb-2">
              <input
                type="file"
                accept=".html"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="bg-[#1E1E1E] text-white px-4 py-2 rounded-lg border border-gray-700 cursor-pointer hover:bg-[#2E2E2E]"
              >
                Import HTML
              </label>
              <button
                onClick={handleExport}
                className="bg-[#1E1E1E] text-white px-4 py-2 rounded-lg border border-gray-700 hover:bg-[#2E2E2E]"
              >
                Export HTML
              </button>
              <a
                href="https://github.com/evorklausen/wavesai2"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1E1E1E] text-white px-4 py-2 rounded-lg border border-gray-700 hover:bg-[#2E2E2E] flex items-center"
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#1E1E1E] text-white px-4 py-2 rounded-lg border border-gray-700"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-[#6D28D9] disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div className="h-full overflow-hidden border-r border-gray-800">
          <div className="h-full overflow-auto">
            <Preview code={preview} />
          </div>
        </div>

        {/* Code Section */}
        <div className="h-full overflow-hidden">
          <div className="h-full overflow-auto">
            <textarea
              className="w-full h-full p-4 font-mono text-sm bg-[#121212] text-white resize-none focus:outline-none"
              value={code}
              onChange={handleCodeChange}
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
}