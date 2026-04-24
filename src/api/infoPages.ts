import apiClient from './client';

export interface InfoPage {
  id: number;
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
  is_active: boolean;
  sort_order: number;
  icon: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface InfoPageListItem {
  id: number;
  slug: string;
  title: Record<string, string>;
  is_active: boolean;
  sort_order: number;
  icon: string | null;
  updated_at: string | null;
}

export interface InfoPageCreateRequest {
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
  is_active: boolean;
  sort_order: number;
  icon: string | null;
}

export interface InfoPageUpdateRequest {
  slug?: string;
  title?: Record<string, string>;
  content?: Record<string, string>;
  is_active?: boolean;
  sort_order?: number;
  icon?: string | null;
}

export interface InfoPageReorderRequest {
  items: Array<{ id: number; sort_order: number }>;
}

export const infoPagesApi = {
  // Public endpoints
  getPages: async (): Promise<InfoPageListItem[]> => {
    const response = await apiClient.get<InfoPageListItem[]>('/cabinet/info-pages');
    return response.data;
  },

  getPageBySlug: async (slug: string): Promise<InfoPage> => {
    const response = await apiClient.get<InfoPage>(
      `/cabinet/info-pages/${encodeURIComponent(slug)}`,
    );
    return response.data;
  },

  // Admin endpoints
  getAdminPages: async (): Promise<InfoPageListItem[]> => {
    const response = await apiClient.get<InfoPageListItem[]>('/cabinet/admin/info-pages');
    return response.data;
  },

  getAdminPage: async (id: number): Promise<InfoPage> => {
    const response = await apiClient.get<InfoPage>(`/cabinet/admin/info-pages/${id}`);
    return response.data;
  },

  createPage: async (data: InfoPageCreateRequest): Promise<InfoPage> => {
    const response = await apiClient.post<InfoPage>('/cabinet/admin/info-pages', data);
    return response.data;
  },

  updatePage: async (id: number, data: InfoPageUpdateRequest): Promise<InfoPage> => {
    const response = await apiClient.put<InfoPage>(`/cabinet/admin/info-pages/${id}`, data);
    return response.data;
  },

  deletePage: async (id: number): Promise<void> => {
    await apiClient.delete(`/cabinet/admin/info-pages/${id}`);
  },

  toggleActive: async (id: number): Promise<InfoPage> => {
    const response = await apiClient.post<InfoPage>(
      `/cabinet/admin/info-pages/${id}/toggle-active`,
    );
    return response.data;
  },

  reorder: async (data: InfoPageReorderRequest): Promise<void> => {
    await apiClient.post('/cabinet/admin/info-pages/reorder', data);
  },
};
