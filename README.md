# LuXe Euro

Modern Next.js catalogue for authentic Italian / European brands delivered to Sri Lanka. Orders go through WhatsApp — no payment gateway.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Product data in `src/data/products.ts`
- WhatsApp cart checkout in `src/lib/whatsapp.ts`
- Google sign-in via **Supabase Auth** (free tier)

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth setup (Google)

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **anon public** key → `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

3. Supabase → **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

4. Enable Google:
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
     - Type: **OAuth client ID** → Web application
     - Authorized redirect URI (from Supabase Google provider screen), usually:
       `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Supabase → **Authentication → Providers → Google** → enable
   - Paste Google **Client ID** and **Client Secret**
   - Save

5. Restart `npm run dev`

Pages: `/login`, `/signup` — enter email (optional) → **Continue with Google**.

## Orders

1. Run `supabase/orders.sql` in Supabase → SQL Editor
2. (Optional email) Add Resend keys to `.env.local`:

```env
RESEND_API_KEY=re_...
ORDER_EMAIL_FROM=LuXe Euro <onboarding@resend.dev>
```

3. Clicking **Place Order** saves the order, emails a confirmation to the
   customer, then opens WhatsApp with `Order #LX-...`

## Admin products

1. Run `supabase/products.sql` in Supabase → SQL Editor
2. Set your Google email in `.env.local`:

```env
NEXT_PUBLIC_ADMIN_EMAILS=you@gmail.com
```

3. Restart `npm run dev`
4. Open `/admin`, sign in with that Google account
5. Add products (or click **Import sample products**)

## Deploy

Push to GitHub and import on [Vercel](https://vercel.com). Add the same env vars, and update Supabase + Google redirect URLs for your production domain.
