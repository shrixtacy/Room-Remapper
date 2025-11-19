import React from 'react';
import { DesignStyle } from '../types';
import { PREDEFINED_STYLES } from '../constants';

interface StyleSelectorProps {
  onSelectStyle: (style: DesignStyle) => void;
  isGenerating: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ onSelectStyle, isGenerating }) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="flex space-x-4 px-2">
        {PREDEFINED_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelectStyle(style)}
            disabled={isGenerating}
            className="group relative flex-shrink-0 w-32 h-40 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src={style.imagePlaceholder}
              alt={style.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-3">
              <p className="text-white text-xs font-bold leading-tight">{style.name}</p>
            </div>
            
            {/* Selection Ring Overlay */}
            <div className="absolute inset-0 border-2 border-transparent hover:border-indigo-400 rounded-xl transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;