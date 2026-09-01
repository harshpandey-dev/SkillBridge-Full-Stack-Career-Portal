import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../lib/errors';
import {
  CreateLearningResourceInput,
  UpdateLearningResourceInput,
  ResourceQueryInput,
  FeaturedResourceQueryInput,
  ToggleFeaturedInput,
} from '../validators/learningResource.validator';

export class LearningResourceService {
  // 1. Get all resources with search, filters, sorting, and pagination (Public)
  static async getAllResources(query: ResourceQueryInput) {
    const {
      search,
      category,
      difficulty,
      type,
      featured,
      provider,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = query;

    const where: Prisma.LearningResourceWhereInput = {};

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (type) {
      where.type = { equals: type, mode: 'insensitive' };
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (provider) {
      where.provider = { contains: provider, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    let orderBy: Prisma.LearningResourceOrderByWithRelationInput | Prisma.LearningResourceOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };

    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'rating_desc') {
      orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'rating_asc') {
      orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }];
    } else if (sort === 'duration_asc') {
      orderBy = { duration: 'asc' };
    } else if (sort === 'duration_desc') {
      orderBy = { duration: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.learningResource.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.learningResource.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // 2. Get featured resources (Public)
  static async getFeaturedResources(query: FeaturedResourceQueryInput) {
    const { limit = 6 } = query;

    const [items, total] = await Promise.all([
      prisma.learningResource.findMany({
        where: { featured: true },
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      }),
      prisma.learningResource.count({ where: { featured: true } }),
    ]);

    return {
      items,
      total,
    };
  }

  // 3. Get resource by ID (Public)
  static async getResourceById(resourceId: string) {
    const resource = await prisma.learningResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundError('Learning resource not found');
    }

    return resource;
  }

  // 4. Create resource (Admin only)
  static async createResource(input: CreateLearningResourceInput) {
    const thumbnail = input.thumbnail || input.imageUrl || null;

    const resource = await prisma.learningResource.create({
      data: {
        title: input.title,
        provider: input.provider,
        description: input.description || null,
        category: input.category,
        type: input.type,
        difficulty: input.difficulty,
        duration: input.duration || null,
        resourceUrl: input.resourceUrl,
        thumbnail,
        tags: input.tags || [],
        rating: input.rating !== undefined ? input.rating : null,
        featured: input.featured ?? false,
      },
    });

    return resource;
  }

  // 5. Update resource (Admin only)
  static async updateResource(resourceId: string, input: UpdateLearningResourceInput) {
    const existing = await prisma.learningResource.findUnique({
      where: { id: resourceId },
    });

    if (!existing) {
      throw new NotFoundError('Learning resource not found');
    }

    const data: Prisma.LearningResourceUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.provider !== undefined) data.provider = input.provider;
    if (input.description !== undefined) data.description = input.description;
    if (input.category !== undefined) data.category = input.category;
    if (input.type !== undefined) data.type = input.type;
    if (input.difficulty !== undefined) data.difficulty = input.difficulty;
    if (input.duration !== undefined) data.duration = input.duration;
    if (input.resourceUrl !== undefined) data.resourceUrl = input.resourceUrl;
    if (input.thumbnail !== undefined || input.imageUrl !== undefined) {
      data.thumbnail = input.thumbnail || input.imageUrl || null;
    }
    if (input.tags !== undefined) data.tags = input.tags;
    if (input.rating !== undefined) data.rating = input.rating;
    if (input.featured !== undefined) data.featured = input.featured;

    const updated = await prisma.learningResource.update({
      where: { id: resourceId },
      data,
    });

    return updated;
  }

  // 6. Delete resource (Admin only)
  static async deleteResource(resourceId: string) {
    const existing = await prisma.learningResource.findUnique({
      where: { id: resourceId },
    });

    if (!existing) {
      throw new NotFoundError('Learning resource not found');
    }

    await prisma.learningResource.delete({
      where: { id: resourceId },
    });

    return { message: 'Learning resource deleted successfully' };
  }

  // 7. Toggle featured status (Admin only)
  static async toggleFeatured(resourceId: string, input: ToggleFeaturedInput) {
    const existing = await prisma.learningResource.findUnique({
      where: { id: resourceId },
    });

    if (!existing) {
      throw new NotFoundError('Learning resource not found');
    }

    const updated = await prisma.learningResource.update({
      where: { id: resourceId },
      data: {
        featured: input.featured,
      },
    });

    return updated;
  }

  // 8. Get Resource Statistics (Admin only)
  static async getResourceStats() {
    const [totalResources, featuredResources, ratingAgg, byCategory, byDifficulty, byType] =
      await Promise.all([
        prisma.learningResource.count(),
        prisma.learningResource.count({ where: { featured: true } }),
        prisma.learningResource.aggregate({
          _avg: { rating: true },
        }),
        prisma.learningResource.groupBy({
          by: ['category'],
          _count: { id: true },
        }),
        prisma.learningResource.groupBy({
          by: ['difficulty'],
          _count: { id: true },
        }),
        prisma.learningResource.groupBy({
          by: ['type'],
          _count: { id: true },
        }),
      ]);

    const totalResourcesByCategory: Record<string, number> = {};
    byCategory.forEach(item => {
      totalResourcesByCategory[item.category] = item._count.id;
    });

    const totalResourcesByDifficulty: Record<string, number> = {};
    byDifficulty.forEach(item => {
      totalResourcesByDifficulty[item.difficulty] = item._count.id;
    });

    const totalResourcesByType: Record<string, number> = {};
    byType.forEach(item => {
      totalResourcesByType[item.type] = item._count.id;
    });

    const rawAvg = ratingAgg._avg.rating ?? 0;
    const averageRating = Math.round(rawAvg * 10) / 10;

    return {
      totalResources,
      featuredResources,
      averageRating,
      totalResourcesByCategory,
      totalResourcesByDifficulty,
      totalResourcesByType,
    };
  }
}
