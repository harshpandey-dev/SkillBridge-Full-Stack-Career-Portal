export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  description?: string | null;
  category: string;
  type: string;
  difficulty: Difficulty;
  duration?: string | null;
  resourceUrl: string;
  thumbnail?: string | null;
  tags: string[];
  rating?: number | null;
  featured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface LearningResourceQuery {
  search?: string;
  category?: string;
  difficulty?: Difficulty;
  type?: string;
  featured?: boolean;
  provider?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'rating_desc' | 'rating_asc' | 'duration_asc' | 'duration_desc';
}

export interface LearningResourceStats {
  totalResources: number;
  featuredResources: number;
  averageRating: number;
  totalResourcesByCategory: Record<string, number>;
  totalResourcesByDifficulty: Record<string, number>;
  totalResourcesByType: Record<string, number>;
}
