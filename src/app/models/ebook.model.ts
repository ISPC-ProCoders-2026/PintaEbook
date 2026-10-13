export type EbookStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

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

// Editor-facing content uses the backend's canonical identifier and HTML keys.
export interface Section {
  section_id: string;
  content_id: string;
  title: string;
  content_html: string;
}

export interface Chapter {
  chapter_id: number;
  content_id: string;
  title: string;
  sections: Section[];
}

export interface EbookContent {
  ebook_id: string;
  title: string;
  chapters: Chapter[];
}

export interface EbookGenerationRequest {
  title: string;
  description: string;
  prompt: string;
  num_chapters: number;
}

export interface GenerationProgress {
  progress: number;
  status_message: string;
  completed: boolean;
  ebook_id?: string;
  error?: string;
  status?: EbookStatus;
  step?: number;
  credits_available?: number;
}

export interface CreditBalanceResponse {
  credits_available: number;
  last_updated: string;
}

export interface EbookGenerationResponse {
  ebook_id: string;
  title: string;
  status: EbookStatus;
  credits_available?: number;
}

export interface EbookMetadataResponse {
  ebook_id: string;
  title: string;
  description: string;
  status: EbookStatus;
  created_at: string;
  updated_at: string;
  credits_available?: number;
}

export interface UpdateEbookMetadataPayload {
  title: string;
  description: string;
}

export interface PaginatedEbookMetadataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EbookMetadataResponse[];
}

export interface EbookStatusResponse {
  ebook_id: string;
  status: EbookStatus;
  title: string;
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
