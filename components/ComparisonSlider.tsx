import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ComparisonSliderProps {
  originalImage: string; // base64
  generatedImage: string | null; // base64
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ originalImage, generatedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // Percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onTouchStart = () => setIsDragging(true);

  const onMouseUp = useCallback(() => setIsDragging(false), []);
  const onTouchEnd = useCallback(() => setIsDragging(false), []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);


  if (!generatedImage) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
             <img src={`data:image/png;base64,${originalImage}`} alt="Original" className="w-full h-full object-contain" />
        </div>
    );
  }

  return (
    <div 
        ref={containerRef} 
        className="relative w-full h-full select-none overflow-hidden rounded-xl border border-slate-200 shadow-lg bg-slate-900"
    >
      {/* Background Image (Generated/After) */}
      <img 
        src={`data:image/png;base64,${generatedImage}`} 
        alt="New Design" 
        className="absolute top-0 left-0 w-full h-full object-contain"
      />

      {/* Foreground Image (Original/Before) - Clipped */}
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full">
             {/* 
                We need to make sure the original image maintains the same aspect ratio and position 
                as the background image, but is cropped by the parent div. 
                Using standard img tag logic within a constrained width requires the img itself 
                to be the full width of the CONTAINER, not the parent div.
             */}
             {/* This relies on the container size being fixed by the parent component */}
             <img 
                src={`data:image/png;base64,${originalImage}`} 
                alt="Original" 
                className="absolute top-0 left-0 max-w-none h-full object-contain"
                // We need to know the width of the container to set this width correctly 
                // so it matches the background image exactly.
                style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%' }}
             />
        </div>
         {/* Label */}
         <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
            ORIGINAL
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-transparent cursor-ew-resize flex items-center justify-center group"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-slate-200 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-600">
                <path fillRule="evenodd" d="M15.75 2.25H8.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75Zm0 19.5H8.25a.75.75 0 0 0 .75.75h6a.75.75 0 0 0 .75-.75Zm-7.5-9.75a.75.75 0 0 1 0-1.5h7.5a.75.75 0 0 1 0 1.5h-7.5Z" clipRule="evenodd" />
                <path d="M12 6.75a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-1.5 0v-9a.75.75 0 0 1 .75-.75Z" />
            </svg>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 bg-indigo-600/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
            REIMAGINED
      </div>
    </div>
  );
};

export default ComparisonSlider;