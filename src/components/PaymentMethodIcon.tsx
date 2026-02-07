interface PaymentMethodIconProps {
  method: string;
  className?: string;
}

export default function PaymentMethodIcon({
  method,
  className = 'h-8 w-8',
}: PaymentMethodIconProps) {
  switch (method) {
    // Telegram Stars — blue circle + gold star
    case 'telegram_stars':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#229ED9" />
          <path
            d="M20 8l3.09 6.26L30 15.27l-5 4.87 1.18 6.88L20 23.77l-6.18 3.25L15 20.14l-5-4.87 6.91-1.01L20 8z"
            fill="#FFD700"
          />
        </svg>
      );

    // CryptoBot (app.cr.bot) — blue circle, white BTC-style ₿ mark
    case 'cryptobot':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#0088CC" />
          <path
            d="M16.5 11.5V13h-1v2h1v10h-1v2h1v1.5h2V28h3c2.5 0 4.5-1.2 4.5-3.3 0-1.5-.9-2.6-2.3-3.1 1-.5 1.8-1.5 1.8-2.9 0-2-1.8-3.2-4-3.2h-3v-1.5h-2zM20 17h1.5c1.1 0 1.8.6 1.8 1.5s-.7 1.5-1.8 1.5H20v-3zm0 5h2c1.2 0 2 .7 2 1.7s-.8 1.8-2 1.8h-2v-3.5z"
            fill="#fff"
          />
        </svg>
      );

    // YooKassa — blue circle, stylized "Ю" mark (vertical bar + ring)
    case 'yookassa':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#0070F0" />
          <rect x="11" y="11" width="4.5" height="18" rx="2.25" fill="#fff" />
          <circle cx="25" cy="20" r="6.5" fill="none" stroke="#fff" strokeWidth="3.5" />
        </svg>
      );

    // Heleket — dark circle, green H-mark (from favicon.ico brand)
    case 'heleket':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#1A1A2E" />
          <path d="M12 11h4v7h8v-7h4v18h-4v-7h-8v7h-4z" fill="#00E68A" />
        </svg>
      );

    // MulenPay — red circle, white "M" letter mark
    case 'mulenpay':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#E5383B" />
          <path d="M10 28V12h4.5l5.5 10 5.5-10H30v16h-4v-9.5l-4.5 8h-3l-4.5-8V28z" fill="#fff" />
        </svg>
      );

    // PAL24 / PayPalych (pally.info) — green circle, white "P" mark
    case 'pal24':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#31B545" />
          <path
            d="M14 10h8c4.42 0 7 2.8 7 6.5S26.42 23 22 23h-4v7h-4V10zm4 3.5v6h4c1.93 0 3-1.3 3-3s-1.07-3-3-3h-4z"
            fill="#fff"
          />
        </svg>
      );

    // Platega — purple/blue gradient mark from favicon (triangle P shape)
    case 'platega':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#533BEB" />
          <path d="M14.4 27.1L8.5 24.5l2.3-7L17.6 20.8z" fill="#533BEB" opacity="0.7" />
          <path
            d="M23.2 6h-6.4c-.7 0-1.4.6-1.6 1.3L9.4 28.6c-.2.7.2 1.3.9 1.3h5.1c.7 0 1.4-.6 1.6-1.3l.6-2.3c.2-.7.9-1.2 1.7-1.3 2.1-.2 4.2-1.1 6-2.5 2.2-1.6 3.8-3.8 4.4-6.1.6-2.3.2-4.5-1.2-6.2S25.8 6 23.2 6z"
            fill="#fff"
          />
          <path
            d="M9.5 22.4l9.1-4.4c.4-.2.8-.1 1 .3l.4 1.1c.2.5.9.5 1.3 0l7-8.1c.4-.5.2-1.1-.4-1.1H16.5c-.6 0-1.1.6-.9 1.1l.3.9c.1.4-.1.8-.5 1l-5.8 2.8z"
            fill="url(#plategaGrad)"
          />
          <defs>
            <linearGradient id="plategaGrad" x1="28" y1="10.7" x2="12" y2="17">
              <stop stopColor="#2B99FF" />
              <stop offset="1" stopColor="#725BFF" />
            </linearGradient>
          </defs>
        </svg>
      );

    // WATA (wata.pro) — yellow-green square icon with black W/V shapes from favicon
    case 'wata':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <rect width="40" height="40" rx="8" fill="#E1FF00" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.8 24.4l-2.8 5.9L6.7 12.6h5.7l6.4 11.8zm-4.2-11.9l5.2 10.3 5.4-10.3h-10.6zm9.5 17.4l-2.8-5.8 6.4-11.7h5.7L24.1 29.9z"
            fill="#1B1C19"
          />
        </svg>
      );

    // Freekassa — orange circle, white "F" mark
    case 'freekassa':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#FF6600" />
          <path d="M14 10h13v4H18v4h8v4h-8v8h-4z" fill="#fff" />
        </svg>
      );

    // CloudPayments — blue circle with white checkmark cross from favicon.svg
    case 'cloudpayments':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#6496DC" />
          <path
            d="M15.7 25.6l12.9-12.9c1.35-1.35 3.53-1.35 4.88 0 1.35 1.35 1.35 3.53 0 4.88l-8.07 8.07c-2.7 2.7-7.08 2.7-9.78 0z"
            fill="#fff"
          />
          <path
            d="M24.3 14.4L11.3 27.4c-1.35 1.35-3.53 1.35-4.88 0-1.35-1.35-1.35-3.53 0-4.88l8.07-8.07c2.7-2.7 7.08-2.7 9.78 0z"
            fill="#fff"
          />
        </svg>
      );

    // Tribute — blue gradient rounded square with white star/arrow from favicon
    case 'tribute':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <rect width="40" height="40" rx="13" fill="url(#tributeGrad)" />
          <path
            opacity="0.65"
            d="M19 10.2c.5-1.4.7-2.1 1.1-2.3a1.1 1.1 0 011.1 0c.4.2.6.9 1.1 2.3.9 2.5 2 5.6 2.8 8 .8 2.5 1.6 5.2 2.5 8.1.4 1.4.6 2.2.4 2.6a1.1 1.1 0 01-.9.6c-.4.1-1.1-.4-2.3-1.2l-3.2-2.2c-.4-.2-.5-.4-.7-.4a1.1 1.1 0 00-.5 0c-.2.1-.4.2-.8.4L16.5 30c-1.2.8-1.9 1.3-2.3 1.2a1.1 1.1 0 01-.9-.6c-.2-.4 0-1.1.5-2.6.7-2.5 1.7-5.6 2.4-8.1.8-2.4 1.9-5.5 2.8-8z"
            fill="#fff"
          />
          <path
            d="M27 15.5c1.5 0 2.2.1 2.5.4.3.2.4.5.3 1-.1.4-.7.9-1.8 1.8-2.1 1.6-4.7 3.6-6.8 5.1-2 1.5-4.5 3.2-6.9 4.8-1.2.9-1.9 1.3-2.3 1.2a1.1 1.1 0 01-.9-.6c-.2-.4 0-1.1.4-2.6l1.1-3.7c.1-.4.2-.6.2-.8a1.1 1.1 0 00-.2-.5c-.1-.2-.3-.3-.6-.6L9 17.6c-1.2-.9-1.8-1.4-1.9-1.8-.1-.4.1-.7.3-1 .3-.3 1.1-.3 2.6-.4 2.6-.1 5.9-.2 8.4-.2 2.6 0 5.8.1 8.5.2z"
            fill="#fff"
          />
          <defs>
            <linearGradient
              id="tributeGrad"
              x1="20"
              y1="0"
              x2="20"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#79C9FF" />
              <stop offset="1" stopColor="#007AFF" />
            </linearGradient>
          </defs>
        </svg>
      );

    // Kassa AI — orange circle with white "K" mark from brand
    case 'kassa_ai':
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#FF6C1A" />
          <path d="M14 10h4v7.5l7-7.5h5l-7.5 8L30 30h-5l-7-8.5V30h-4z" fill="#fff" />
        </svg>
      );

    default:
      return (
        <svg className={className} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#4B5563" />
          <path
            d="M10 14h20c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2zm0 3v6h20v-6H10z"
            fill="#fff"
            opacity=".7"
          />
        </svg>
      );
  }
}
