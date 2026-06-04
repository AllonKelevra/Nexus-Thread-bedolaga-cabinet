import apiClient from './client';

export interface MtprotoLink {
  url: string;
}

export const mtprotoApi = {
  getLink: async (): Promise<MtprotoLink> => {
    const response = await apiClient.get<MtprotoLink>('/cabinet/mtproto');
    return response.data;
  },
};
