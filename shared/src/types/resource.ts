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
