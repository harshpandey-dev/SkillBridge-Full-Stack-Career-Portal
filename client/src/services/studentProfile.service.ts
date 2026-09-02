import { api } from '../lib/api';

export interface StudentSkillItem {
  id: string;
  skillId: string;
  name: string;
  addedAt: string | Date;
}

export interface ProfileCompletion {
  completionPercentage: number;
  completedFields: string[];
  missingFields: string[];
}

export interface StudentProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    profileImage?: string | null;
    phone?: string | null;
    location?: string | null;
    createdAt: string | Date;
  };
  profile: {
    id: string;
    university: string;
    major: string;
    graduationYear: number;
    gpa?: number | null;
    bio?: string | null;
    resumeUrl?: string | null;
    resumePublicId?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  skills: StudentSkillItem[];
  profileCompletion: ProfileCompletion;
}

export interface UpdateStudentProfilePayload {
  name?: string;
  phone?: string | null;
  location?: string | null;
  profileImage?: string | null;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number | null;
  bio?: string | null;
  resumeUrl?: string | null;
}

export interface GlobalSkillItem {
  id: string;
  name: string;
  category?: string | null;
}

export const studentProfileService = {
  // 1. Get Current Student Profile
  async getProfile(): Promise<StudentProfileData> {
    const response = await api.get<{ success: boolean; data: StudentProfileData }>(
      '/student/profile'
    );
    return response.data.data;
  },

  // 2. Update Student Profile
  async updateProfile(data: UpdateStudentProfilePayload): Promise<StudentProfileData> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: StudentProfileData;
    }>('/student/profile', data);
    return response.data.data;
  },

  // 3. Get Student Profile Completion
  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await api.get<{ success: boolean; data: ProfileCompletion }>(
      '/student/profile/completion'
    );
    return response.data.data;
  },

  // 4. Get Student Skills
  async getSkills(): Promise<StudentSkillItem[]> {
    const response = await api.get<{
      success: boolean;
      data: { skills: StudentSkillItem[] };
    }>('/student/skills');
    return response.data.data.skills;
  },

  // 5. Add Skill to Student Profile
  async addSkill(name: string): Promise<StudentSkillItem> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { skill: StudentSkillItem };
    }>('/student/skills', { name: name.trim() });
    return response.data.data.skill;
  },

  // 6. Remove Skill from Student Profile
  async removeSkill(skillId: string): Promise<{ message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/student/skills/${skillId}`
    );
    return { message: response.data.message };
  },

  // 7. Search Global Skills for suggestions / autocomplete
  async searchSkills(search?: string, limit: number = 10): Promise<GlobalSkillItem[]> {
    const response = await api.get<{
      success: boolean;
      data: { skills?: GlobalSkillItem[]; items?: GlobalSkillItem[] };
    }>('/skills', {
      params: { search: search?.trim() || undefined, limit },
    });
    return response.data.data.skills || response.data.data.items || [];
  },
};
