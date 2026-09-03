-- 0008 — Stripe integration on payments + memberships

alter table public.payments
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent text,
  add column if not exists paid_at timestamptz;

create unique index if not exists payments_stripe_session_uidx
  on public.payments(stripe_session_id)
  where stripe_session_id is not null;

create index if not exists payments_membership_idx
  on public.payments(membership_id);
