export enum StyleType {
  ELEGANT_MINIMAL = 'elegant_minimal',
  PLAYFUL_POP = 'playful_pop',
  RUSTIC_GARDEN = 'rustic_garden',
  LUXURY_MARBLE = 'luxury_marble',
  VINTAGE_POLAROID = 'vintage_polaroid',
  BOHO_CHIC = 'boho_chic',
  ART_DECO = 'art_deco',
  COMIC_POP = 'comic_pop',
  WATERCOLOR_DREAM = 'watercolor_dream',
  ANIME_MANGA = 'anime_manga',
  IOS_MODERN = 'ios_modern',
  COFFEE_HOUSE = 'coffee_house',
  WABI_SABI = 'wabi_sabi',
  CUTE_KAWAII = 'cute_kawaii',
}

export interface Vendor {
  id: string;
  role: string;
  name: string;
  handle: string;
  url: string;
  imageUrl?: string;
  scale?: number; // 0-100, default 50 (1x)
  offsetX?: number; // pixels, default 0
  offsetY?: number; // pixels, default 0
}

export interface AppState {
  vendors: Vendor[];
  currentStyle: StyleType;
  duration: number; // seconds
  isPlaying: boolean;
  currentVendorIndex: number;
}