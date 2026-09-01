import { prisma } from '../lib/prisma';
import { SkillQueryInput } from '../validators/skill.validator';
import { Prisma } from '@prisma/client';

export class SkillService {
  // Search or list skills with case-insensitive search and limit
  static async searchSkills(query: SkillQueryInput) {
    const { search, limit = 20 } = query;

    const where: Prisma.SkillWhereInput = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              students: true,
              jobs: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
        take: limit,
      }),
      prisma.skill.count({ where }),
    ]);

    const formatted = items.map(s => ({
      id: s.id,
      name: s.name,
      studentCount: s._count.students,
      jobCount: s._count.jobs,
    }));

    return {
      items: formatted,
      total,
    };
  }
}
