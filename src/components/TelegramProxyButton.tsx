import { useQuery } from '@tanstack/react-query';
import { PiTelegramLogo } from 'react-icons/pi';

import { mtprotoApi } from '@/api/mtproto';

export default function TelegramProxyButton() {
  const { data } = useQuery({
    queryKey: ['mtproto-link'],
    queryFn: mtprotoApi.getLink,
    retry: false,
    staleTime: 1000 * 60 * 30,
  });

  if (!data?.url) {
    return null;
  }

  return (
    <a
      href={data.url}
      aria-label="Telegram proxy"
      title="Telegram proxy"
      className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-400 transition-colors duration-200 hover:border-sky-400/50 hover:bg-sky-500/20 hover:text-sky-300"
    >
      <PiTelegramLogo className="h-5 w-5 shrink-0" />
      <span>Telegram proxy</span>
    </a>
  );
}
