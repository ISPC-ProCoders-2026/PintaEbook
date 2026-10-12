export type EbookStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Ebook {
  ebook_id: string;
  title: string;
  description: string;
  prompt_idea: string;
  quantity_chapters: number;
  status?: EbookStatus;
  created_at: string;
  updated_at: string;
  credits_available: number;
}

export interface EbookListResponse {
  results: Ebook[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface CreateEbookPayload {
  title: string;
  description: string;
  prompt_idea: string;
  quantity_chapters: number;
}

export interface CreateEbookResponse {
  ebook_id: string;
  title: string;
  description: string;
  status: EbookStatus;
  created_at: string;
  updated_at: string;
  credits_available?: number;
}

export interface Section {
  id: string;
  title: string;
  html: string;
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface EbookContent {
  ebook_id: string;
  chapters: Chapter[];
}

export interface PatchSectionPayload {
  sections: { chapter_id: string; section_id: string; html: string }[];
}

export interface AiGeneratePayload {
  ebook_id: string;
  chapter_id: string;
  section_id: string;
  prompt: string;
}

export interface AiGenerateResponse {
  generated_html: string;
  credits_available?: number;
  html?: string;
  credits_remaining?: number;
}

export interface EbookProgressEvent {
  type: 'progress_update';
  step: number;
  progress: number;
  message: string;
  status?: EbookStatus;
  credits_available?: number;
  error?: string;
}
