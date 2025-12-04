export enum StyleType {
  ELEGANT_MINIMAL = 'elegant_minimal',
  PLAYFUL_POP = 'playful_pop',
  MODERN_GRID = 'modern_grid',
  RUSTIC_GARDEN = 'rustic_garden',
  LUXURY_MARBLE = 'luxury_marble',
  VINTAGE_POLAROID = 'vintage_polaroid',
  JAPANESE_ZEN = 'japanese_zen',
  BOHO_CHIC = 'boho_chic',
  CYBER_NEON = 'cyber_neon',
  ART_DECO = 'art_deco',
  COMIC_POP = 'comic_pop',
  WATERCOLOR_DREAM = 'watercolor_dream',
  INDUSTRIAL_CHIC = 'industrial_chic',
  ANIME_MANGA = 'anime_manga',
  IOS_MODERN = 'ios_modern',
  MUJI_SIMPLE = 'muji_simple',
  COFFEE_HOUSE = 'coffee_house',
  NORDIC_HYGGE = 'nordic_hygge',
  WABI_SABI = 'wabi_sabi',
  JAPANESE_TRADITIONAL = 'japanese_traditional',
  SCI_FI_HUD = 'sci_fi_hud',
  STREET_GRAFFITI = 'street_graffiti',
  CUTE_KAWAII = 'cute_kawaii',
}

export interface Vendor {
  id: string;
  role: string;
  name: string;
  handle: string;
  url: string;
  imageUrl?: string;
}

export interface AppState {
  vendors: Vendor[];
  currentStyle: StyleType;
  duration: number; // seconds
  isPlaying: boolean;
  currentVendorIndex: number;
}