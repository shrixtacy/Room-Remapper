import { DesignStyle } from './types';

// Models
export const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';
export const MODEL_CHAT = 'gemini-3-pro-preview';

export const PREDEFINED_STYLES: DesignStyle[] = [
  {
    id: 'mid-century',
    name: 'Mid-Century Modern',
    promptFragment: 'redesigned in a Mid-Century Modern style with teak wood furniture, organic curves, and olive green accents',
    imagePlaceholder: 'https://picsum.photos/id/1/400/300'
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    promptFragment: 'redesigned in a Scandinavian style, minimalist, bright and airy, light wood, white walls, cozy textiles',
    imagePlaceholder: 'https://picsum.photos/id/2/400/300'
  },
  {
    id: 'industrial',
    name: 'Industrial Loft',
    promptFragment: 'redesigned in an Industrial Loft style, exposed brick, metal fixtures, leather furniture, dramatic lighting',
    imagePlaceholder: 'https://picsum.photos/id/3/400/300'
  },
  {
    id: 'boho',
    name: 'Bohemian Chic',
    promptFragment: 'redesigned in a Bohemian Chic style, rattan furniture, many plants, patterned rugs, warm earth tones',
    imagePlaceholder: 'https://picsum.photos/id/4/400/300'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    promptFragment: 'redesigned in a futuristic Cyberpunk style, neon pink and blue lighting, sleek metal surfaces, high-tech aesthetic',
    imagePlaceholder: 'https://picsum.photos/id/5/400/300'
  }
];