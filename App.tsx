import React, { useState, useRef } from 'react';
import { AppMode, ImageState, ChatMessage, DesignStyle } from './types';
import { generateRoomDesign, sendChatMessage } from './services/geminiService';
import ComparisonSlider from './components/ComparisonSlider';
import ChatInterface from './components/ChatInterface';
import StyleSelector from './components/StyleSelector';

const App: React.FC = () => {
  // State
  const [mode, setMode] = useState<AppMode>(AppMode.UPLOAD);
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    generated: null,
    mimeType: 'image/jpeg',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix for API usage later, but keep full string for rendering
      // Specifically for the API we need raw base64 without the `data:image/xyz;base64,` prefix
      const base64Content = base64String.split(',')[1];
      
      setImageState({
        original: base64Content,
        generated: null, // Reset generated on new upload
        mimeType: file.type,
      });
      setMode(AppMode.DESIGN);
    };
    reader.readAsDataURL(file);
  };

  const handleStyleSelect = async (style: DesignStyle) => {
    if (!imageState.original || isProcessing) return;
    await runGeneration(style.promptFragment);
  };

  const handleChatSubmit = async (text: string, isDesignRequest: boolean) => {
    if (isProcessing) return;

    const newUserMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: text,
        timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newUserMsg]);

    if (isDesignRequest) {
        // User wants to edit the image via prompt
        await runGeneration(text);
        // Add a system message indicating completion
        const sysMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `I've updated the design based on your request: "${text}". Use the slider to compare.`,
            timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, sysMsg]);
    } else {
        // User just wants to chat
        setIsProcessing(true);
        try {
            // Use Generated image if available, otherwise original
            const contextImage = imageState.generated || imageState.original;
            const responseText = await sendChatMessage(
                text, 
                chatMessages, 
                contextImage,
                imageState.mimeType
            );
            
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: Date.now()
            };
            setChatMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "Sorry, I'm having trouble connecting right now.",
                timestamp: Date.now(),
                isError: true
            };
            setChatMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
        }
    }
  };

  const runGeneration = async (prompt: string) => {
    if (!imageState.original) return;
    
    setIsProcessing(true);
    try {
        // Always use original as base to prevent degradation
        const generatedBase64 = await generateRoomDesign(
            imageState.original,
            imageState.mimeType,
            prompt
        );

        setImageState(prev => ({
            ...prev,
            generated: generatedBase64
        }));
    } catch (error) {
        console.error("Generation failed", error);
        alert("Failed to generate design. Please check API key or try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  // Render Upload Screen
  if (mode === AppMode.UPLOAD) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">RoomReimagine AI</h1>
                <p className="text-lg text-slate-600">Your personal AI Interior Design Consultant.</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 transition-all hover:shadow-2xl">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-colors group cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                    <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-slate-800">Upload a photo of your room</p>
                        <p className="text-sm text-slate-500">Supports JPG, PNG</p>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-600 p-1 rounded">✓</span>
                    Visualize Styles
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-600 p-1 rounded">✓</span>
                    Compare Before/After
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-600 p-1 rounded">✓</span>
                    Chat & Refine
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Render Design Dashboard
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                </div>
                <h1 className="font-bold text-xl text-slate-800">RoomReimagine AI</h1>
            </div>
            <button 
                onClick={() => setMode(AppMode.UPLOAD)}
                className="text-sm text-slate-500 hover:text-slate-800 font-medium"
            >
                Start Over
            </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Visualizer */}
            <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
                
                {/* Comparison Slider Area */}
                <div className="w-full aspect-[4/3] md:aspect-video relative bg-slate-200 rounded-xl shadow-sm">
                     {imageState.original && (
                         <ComparisonSlider 
                            originalImage={imageState.original} 
                            generatedImage={imageState.generated} 
                         />
                     )}
                     {isProcessing && (
                         <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                             <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-pulse">
                                 <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                 <p className="font-medium text-slate-800">Redesigning Space...</p>
                             </div>
                         </div>
                     )}
                </div>

                {/* Style Selector */}
                <div className="w-full">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                        Instant Makeovers
                    </h3>
                    <StyleSelector onSelectStyle={handleStyleSelect} isGenerating={isProcessing} />
                </div>
            </div>

            {/* Right Column: Chat Interface */}
            <div className="w-96 shrink-0 h-full hidden md:block">
                <ChatInterface 
                    messages={chatMessages} 
                    onSendMessage={handleChatSubmit}
                    isProcessing={isProcessing}
                />
            </div>
        </div>
        
        {/* Mobile Chat Drawer (Visible only on small screens) */}
        <div className="md:hidden h-1/3 border-t border-slate-200">
             <ChatInterface 
                messages={chatMessages} 
                onSendMessage={handleChatSubmit}
                isProcessing={isProcessing}
            />
        </div>
    </div>
  );
};

export default App;