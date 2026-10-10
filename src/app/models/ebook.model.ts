export interface Section {
  section_id: string;
  title: string;
  content_html: string;
}

export interface Chapter {
  chapter_id: number;
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
}

export interface EbookGenerationResponse {
  ebook_id: string;
  title: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  credits_available?: number;
}

export interface EbookMetadataResponse {
  ebook_id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
  credits_available?: number;
}

export interface PaginatedEbookMetadataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EbookMetadataResponse[];
}

export interface EbookStatusResponse {
  ebook_id: string;
  status: EbookGenerationResponse['status'];
  title: string;
}
