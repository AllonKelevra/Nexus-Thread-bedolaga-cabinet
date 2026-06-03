import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { brandingApi } from '@/api/branding';

export const CUSTOM_DESIGN_QUERY_KEY = ['custom-design'] as const;

function setCustomDesignAttribute(enabled: boolean) {
  const value = enabled ? 'nexus' : null;

  if (value) {
    document.documentElement.setAttribute('data-custom-design', value);
    document.body.setAttribute('data-custom-design', value);
  } else {
    document.documentElement.removeAttribute('data-custom-design');
    document.body.removeAttribute('data-custom-design');
  }
}

export function useCustomDesignMode() {
  const query = useQuery({
    queryKey: CUSTOM_DESIGN_QUERY_KEY,
    queryFn: brandingApi.getCustomDesignEnabled,
    staleTime: 60_000,
  });

  useEffect(() => {
    setCustomDesignAttribute(query.data?.enabled ?? false);
  }, [query.data?.enabled]);

  return query;
}
