import { api } from '../lib/api';

export type BackendDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type UIDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LearningResourceItem {
  id: string;
  title: string;
  provider: string;
  description?: string | null;
  category: string;
  type: string;
  difficulty: BackendDifficulty | UIDifficulty;
  duration?: string | null;
  resourceUrl: string;
  thumbnail?: string | null;
  imageUrl?: string | null;
  tags: string[];
  rating?: number | null;
  featured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface LearningResourceQuery {
  search?: string;
  category?: string;
  difficulty?: BackendDifficulty;
  type?: string;
  featured?: boolean;
  provider?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'rating_desc' | 'rating_asc' | 'duration_asc' | 'duration_desc';
}

export interface PaginatedResourcesResponse {
  items: LearningResourceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LearningResourceStats {
  totalResources: number;
  featuredResources: number;
  averageRating: number;
  totalResourcesByCategory: Record<string, number>;
  totalResourcesByDifficulty: Record<string, number>;
  totalResourcesByType: Record<string, number>;
}

export interface CreateLearningResourcePayload {
  title: string;
  provider: string;
  description?: string | null;
  category: string;
  type: string;
  difficulty?: BackendDifficulty;
  duration?: string | null;
  resourceUrl: string;
  thumbnail?: string | null;
  imageUrl?: string | null;
  tags?: string[];
  rating?: number | null;
  featured?: boolean;
}

export function formatUIToBackendDifficulty(diff?: string): BackendDifficulty | undefined {
  if (!diff || diff === 'All') return undefined;
  const upper = diff.toUpperCase();
  if (upper === 'BEGINNER' || upper === 'INTERMEDIATE' || upper === 'ADVANCED') {
    return upper as BackendDifficulty;
  }
  return undefined;
}

export function formatBackendToUIDifficulty(diff: string): UIDifficulty {
  const upper = diff.toUpperCase();
  if (upper === 'INTERMEDIATE') return 'Intermediate';
  if (upper === 'ADVANCED') return 'Advanced';
  return 'Beginner';
}

export const learningResourceService = {
  // 1. Get resources with search, filters, sort, pagination (Public)
  async getResources(query: LearningResourceQuery = {}): Promise<PaginatedResourcesResponse> {
    const response = await api.get<{ success: boolean; data: PaginatedResourcesResponse }>(
      '/resources',
      { params: query }
    );
    return response.data.data;
  },

  // 2. Get featured resources (Public)
  async getFeaturedResources(limit: number = 6): Promise<{ items: LearningResourceItem[]; total: number }> {
    const response = await api.get<{
      success: boolean;
      data: { items: LearningResourceItem[]; total: number };
    }>('/resources/featured', { params: { limit } });
    return response.data.data;
  },

  // 3. Get single resource by ID (Public)
  async getResourceById(resourceId: string): Promise<LearningResourceItem> {
    const response = await api.get<{
      success: boolean;
      data: { resource: LearningResourceItem };
    }>(`/resources/${resourceId}`);
    return response.data.data.resource;
  },

  // 4. Create resource (Admin only)
  async createResource(data: CreateLearningResourcePayload): Promise<LearningResourceItem> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { resource: LearningResourceItem };
    }>('/admin/resources', data);
    return response.data.data.resource;
  },

  // 5. Update resource (Admin only)
  async updateResource(
    resourceId: string,
    data: Partial<CreateLearningResourcePayload>
  ): Promise<LearningResourceItem> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: { resource: LearningResourceItem };
    }>(`/admin/resources/${resourceId}`, data);
    return response.data.data.resource;
  },

  // 6. Delete resource (Admin only)
  async deleteResource(resourceId: string): Promise<{ message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/resources/${resourceId}`
    );
    return { message: response.data.message };
  },

  // 7. Toggle featured status (Admin only)
  async toggleFeatured(resourceId: string, featured: boolean): Promise<LearningResourceItem> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: { resource: LearningResourceItem };
    }>(`/admin/resources/${resourceId}/featured`, { featured });
    return response.data.data.resource;
  },

  // 8. Get resource statistics (Admin only)
  async getResourceStats(): Promise<LearningResourceStats> {
    const response = await api.get<{
      success: boolean;
      data: LearningResourceStats;
    }>('/admin/resources/stats');
    return response.data.data;
  },
};
