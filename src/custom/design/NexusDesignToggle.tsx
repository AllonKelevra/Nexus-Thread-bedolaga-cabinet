import { useMutation, useQueryClient } from '@tanstack/react-query';

import { brandingApi } from '@/api/branding';
import { Toggle } from '@/components/admin/Toggle';
import { usePermissionStore } from '@/store/permissions';

import { CUSTOM_DESIGN_QUERY_KEY, useCustomDesignMode } from './useCustomDesignMode';

export function NexusDesignToggle() {
  const queryClient = useQueryClient();
  const roles = usePermissionStore((state) => state.roles);
  const roleLevel = usePermissionStore((state) => state.roleLevel);
  const isSuperadmin = roles.includes('Superadmin') || roleLevel >= 999;
  const { data } = useCustomDesignMode();

  const mutation = useMutation({
    mutationFn: (enabled: boolean) => brandingApi.updateCustomDesignEnabled(enabled),
    onSuccess: (next) => {
      queryClient.setQueryData(CUSTOM_DESIGN_QUERY_KEY, next);
      queryClient.invalidateQueries({ queryKey: CUSTOM_DESIGN_QUERY_KEY });
    },
  });

  if (!isSuperadmin) return null;

  const enabled = data?.enabled ?? false;

  return (
    <div className="flex items-center justify-between rounded-xl bg-dark-700/30 p-4">
      <div>
        <span className="font-medium text-dark-100">Дизайн Nexus Thread</span>
        <p className="text-sm text-dark-400">
          Включает фирменный cyberpunk skin для всех клиентов кабинета.
        </p>
      </div>
      <Toggle
        checked={enabled}
        onChange={() => mutation.mutate(!enabled)}
        disabled={mutation.isPending}
        aria-label="Переключить дизайн Nexus Thread"
      />
    </div>
  );
}
