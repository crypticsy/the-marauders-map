export type ElementType = 'room' | 'corridor' | 'text';

export interface MapElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface MapData {
  elements: MapElement[];
  zoom: number;
  pan: { x: number; y: number };
}
