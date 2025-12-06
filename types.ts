export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface MapLocation {
  lat: number;
  lng: number;
  title?: string;
  address?: string;
  placeId?: string;
  uri?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isLoading?: boolean;
  locations?: MapLocation[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    placeId: string;
    title: string;
    description: string;
    uri: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
        sourceUri: string;
        author: string;
      }[];
    };
  };
}
