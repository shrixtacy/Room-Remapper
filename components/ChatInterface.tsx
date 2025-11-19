import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isDesignRequest: boolean) => void;
  isProcessing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent, isDesignRequest: boolean) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input.trim(), isDesignRequest);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-indigo-600">assistant</span>
            Design Consultant
        </h3>
        <p className="text-xs text-slate-500">Ask for advice or refine the design.</p>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-10 text-sm">
                <p>👋 Hi there! I can help you refine your room design.</p>
                <p className="mt-2">Try saying:</p>
                <ul className="mt-2 space-y-1 italic">
                    <li>"Make the rug blue"</li>
                    <li>"What color goes with these walls?"</li>
                    <li>"Find me a similar lamp"</li>
                </ul>
            </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
            <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    Thinking...
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form 
            onSubmit={(e) => handleSubmit(e, false)} // Default enter sends regular chat
            className="relative"
        >
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question or request a change..."
                className="w-full pl-4 pr-24 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-xl text-sm transition-all"
                disabled={isProcessing}
            />
            
            <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                {/* Magic/Edit Button */}
                <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={!input.trim() || isProcessing}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Generate new image based on this text"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                </button>

                {/* Send/Chat Button */}
                <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                    title="Send chat message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                    </svg>
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;