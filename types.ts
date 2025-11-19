export interface Chapter {
  title: string;
  content: string;
  visualPrompt: string;
}

export interface StoryData {
  title: string;
  chapters: Chapter[];
}

export enum AppState {
  INPUT,
  PROCESSING,
  READING,
  ERROR
}
