import apiClient from './client';
import { tokenStorage } from '../utils/token';

export type BulkActionType =
  | 'extend'
  | 'cancel'
  | 'activate'
  | 'change_tariff'
  | 'add_traffic'
  | 'add_balance'
  | 'assign_promo_group'
  | 'grant_subscription';

export interface BulkActionRequest {
  action: BulkActionType;
  user_ids: number[];
  params: BulkActionParams;
}

export interface BulkActionParams {
  days?: number;
  tariff_id?: number;
  traffic_gb?: number;
  balance_kopeks?: number;
  promo_group_id?: number | null;
}

export interface BulkActionErrorItem {
  user_id: number;
  username?: string;
  error: string;
}

export interface BulkActionResult {
  success: boolean;
  total: number;
  success_count: number;
  error_count: number;
  errors: BulkActionErrorItem[];
}

export interface BulkProgressEvent {
  type: 'progress';
  current: number;
  total: number;
  user_id: number;
  username?: string;
  success: boolean;
  message?: string;
  error?: string;
}

export interface BulkCompleteEvent {
  type: 'complete';
  success: boolean;
  total: number;
  success_count: number;
  error_count: number;
  errors: BulkActionErrorItem[];
}

export type BulkSSEEvent = BulkProgressEvent | BulkCompleteEvent;

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const adminBulkActionsApi = {
  execute: async (data: BulkActionRequest): Promise<BulkActionResult> => {
    const response = await apiClient.post('/cabinet/admin/bulk/execute', data);
    return response.data;
  },

  executeWithStream: async (
    data: BulkActionRequest,
    onEvent: (event: BulkSSEEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    const token = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/cabinet/admin/bulk/execute?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/event-stream') && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const event = JSON.parse(trimmed.slice(6)) as BulkSSEEvent;
              onEvent(event);
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }

      // process remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const event = JSON.parse(buffer.trim().slice(6)) as BulkSSEEvent;
          onEvent(event);
        } catch {
          // skip
        }
      }
    } else {
      // Fallback: non-streaming JSON response
      const result = (await response.json()) as BulkActionResult;
      onEvent({
        type: 'complete',
        ...result,
      });
    }
  },
};
