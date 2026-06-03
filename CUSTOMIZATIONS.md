# Customizations

Этот fork содержит кастомный слой Nexus Thread поверх upstream `BEDOLAGA-DEV/bedolaga-cabinet`.

## Правило Слоя

- Custom-код держать в `src/custom/*`.
- Core-файлы менять только в маленьких integration points.
- Новые features добавлять как отдельные modules, не смешивать с upstream pages/services.
- Перед обновлением upstream фиксировать safety branch/tag и проверять diff core integration points.

## Active Features

### SBP Manual Payment

Цель: пользователь создаёт СБП ticket прямо в кабинете, администратор подтверждает платёж кнопкой в кабинете или в боте, баланс начисляется один раз, ticket получает admin-message и закрывается.

Custom frontend:

- `src/custom/sbp/api.ts`
- `src/custom/sbp/types.ts`
- `src/custom/sbp/useSbpTicketActions.ts`
- `src/custom/sbp/SbpTicketActions.tsx`
- `src/custom/sbp/SbpConfirmButton.tsx`
- `src/custom/sbp/SbpManualTopUpPage.tsx`
- `src/custom/index.ts`

Core integration point:

- `src/pages/AdminTickets.tsx` renders `<SbpTicketActions ticketId={selectedTicket.id} />`.
- `src/App.tsx` routes `/balance/top-up/manual` to the custom SBP page before `/balance/top-up/:methodId`.

Backend dependencies:

- `GET /cabinet/balance/ticket-actions/{ticket_id}`
- `POST /cabinet/balance/sbp-admin-confirm/{ticket_id}`
- `POST /cabinet/balance/sbp-ticket`

Both calls must use `apiClient`, not raw `fetch`, so Bearer auth refresh and CSRF handling remain intact.

Backend custom layer:

- `/opt/bedolaga-bot/custom/services/sbp_manual_service.py` is mounted to `/app/app/services/sbp_manual_service.py`.
- Bot callback `sbp_approve:{ticket_id}` and cabinet confirm endpoint must use the same confirm helper.
- Confirm helper sets `sbp_meta:{ticket_id}.confirmed=true`, adds admin ticket message, then closes the ticket.

### Nexus Thread Design Layer

Цель: Superadmin может включить или выключить фирменный Nexus Thread skin для всех клиентов кабинета из `Настройки системы -> Брендинг`.

Custom frontend:

- `src/custom/design/useCustomDesignMode.ts`
- `src/custom/design/NexusDesignToggle.tsx`
- `src/custom/design/nexus-design.css`

Core integration points:

- `src/AppWithNavigator.tsx` boots the public custom design setting on every route.
- `src/main.tsx` imports the custom CSS skin. Styles are inactive unless `data-custom-design="nexus"` is set.
- `src/components/admin/BrandingTab.tsx` renders the Superadmin-only toggle.

Backend dependencies:

- `GET /cabinet/branding/custom-design`
- `PATCH /cabinet/branding/custom-design`

Backend custom layer:

- `/opt/bedolaga-bot/custom/cabinet/routes/branding.py` is mounted to `/app/app/cabinet/routes/branding.py`.
- The custom design setting is stored in `SystemSetting` key `CABINET_CUSTOM_DESIGN_ENABLED`.

### Branding Upload Fix

- `src/components/admin/BrandingTab.tsx` preloads uploaded logo blobs before rendering the logo preview and falls back to the logo letter while the blob is not ready.
- `src/components/ui/backgrounds/vortex.tsx` guards against 0x0 canvas draw operations during resize/preview transitions.

### YooMoney Auto Payment

Цель: пользователь вводит сумму в cabinet, видит сумму к зачислению после комиссии 3%, нажимает `Оплатить`, после чего cabinet создаёт YooMoney auto-payment label и отправляет POST-форму в YooMoney. Баланс зачисляется автоматически по валидному YooMoney HTTP notification.

Custom frontend:

- `src/custom/yoomoney/api.ts`
- `src/custom/yoomoney/types.ts`
- `src/custom/yoomoney/YooMoneyDonateTopUpPage.tsx`
- `src/custom/yoomoney/YooMoneyConfirmButton.tsx`

Core integration points:

- `src/App.tsx` routes `/balance/top-up/yoomoney_donate` to the custom YooMoney page before `/balance/top-up/:methodId`.
- `src/custom/sbp/SbpTicketActions.tsx` renders both SBP and YooMoney custom ticket actions from the same `ticket-actions` response.

Backend dependencies:

- `POST /cabinet/balance/yoomoney-auto-payment`
- `POST /cabinet/balance/yoomoney-notification`
- `GET /cabinet/balance/ticket-actions/{ticket_id}` with `has_yoomoney_confirm`, `yoomoney_status`, `yoomoney_fee_percent`.
- Legacy manual fallback, not used by the primary UI: `POST /cabinet/balance/yoomoney-ticket`, `POST /cabinet/balance/yoomoney-admin-confirm/{ticket_id}`.

Backend custom layer:

- `/opt/bedolaga-bot/custom/services/yoomoney_manual_service.py` is mounted to `/app/app/services/yoomoney_manual_service.py`.
- `yoomoney_donate` is added to `payment_method_config_service.py`, so the method is configurable from payment settings like other methods.
- Confirm helper stores `yoomoney_meta:{ticket_id}`, sets `confirmed=true`, stores gross/credit amounts, adds admin ticket message, then closes the ticket.
- Auto-flow stores `yoomoney_auto_pending:{label}` and accepts YooMoney HTTP notifications only when `YOOMONEY_NOTIFICATION_SECRET` is configured and the incoming `sign` is valid.

### Gift Balance-Only Payment

Цель: в разделе `Подарки` пользователь может оплачивать подарок только с баланса, без варианта `Через платёжку`.

Core integration point:

- `src/pages/GiftSubscription.tsx` keeps purchase payload `payment_mode: balance` and hides the gateway selector from the UI.

## Removed Legacy Injection

`sbp-inject.js` was a pre-fork workaround for injecting a button into built cabinet static files. Do not restore it. The button now lives natively in this fork.

Production cleanup:

- remove nginx `sub_filter` that injects `/sbp-inject.js`;
- remove nginx `location = /sbp-inject.js`;
- keep `/srv/cabinet/sbp.html`, because it is the user-side "Перевёл" confirmation page.
- Keep `/srv/cabinet/sbp.html` as legacy fallback only; primary Nexus flow uses `/balance/top-up/manual`.
- Keep `/cabinet/branding/custom-design` endpoints when refreshing backend custom overrides.

## Upstream Update Workflow

1. Ensure local work is committed.
2. `git fetch upstream`
3. Create a safety branch/tag before merge or rebase.
4. Merge/rebase upstream.
5. Resolve conflicts first in core integration points, then custom modules if needed.
6. Run `npm run type-check`, `npm run lint`, `npm run build`.
7. Deploy built static files and recheck SBP/YooMoney ticket actions.

## Planned Custom Features

- Nexus visual design layer: theme/tokens/components first, avoid page rewrites.
- Future custom top-up methods: separate custom payment modules, reuse SBP/YooMoney extension patterns.
