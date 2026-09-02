import { api } from '../lib/api';

export interface UploadResult {
  url: string;
  publicId?: string;
}

export const uploadService = {
  // Upload Student Resume (PDF, max 5MB)
  async uploadResume(file: File): Promise<{ resumeUrl: string; resumePublicId: string }> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post<{
      success: boolean;
      message: string;
      data: { resumeUrl: string; resumePublicId: string };
    }>('/student/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  // Delete Student Resume
  async deleteResume(): Promise<{ message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      '/student/profile/resume'
    );
    return { message: response.data.message };
  },

  // Upload Authenticated User Profile Image (JPG, JPEG, PNG, WEBP, max 5MB)
  async uploadProfileImage(file: File): Promise<{ profileImage: string; profileImagePublicId?: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<{
      success: boolean;
      message: string;
      data: { profileImage: string; profileImagePublicId?: string };
    }>('/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  // Delete Authenticated User Profile Image
  async deleteProfileImage(): Promise<{ message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      '/profile/image'
    );
    return { message: response.data.message };
  },
};
