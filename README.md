# Swayam Nirman

A local-first skill marketplace — build yourself through skill, earn with dignity, or find help with respect.

Built with **Next.js 15**, **React 19**, and **TypeScript**. Data is stored in the browser (localStorage) for demo use.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run Next.js lint |

## Environment variables

Copy `.env.example` to `.env.local` and configure optional Razorpay payment keys:

- `NEXT_PUBLIC_PAYMENT_MODE` — `demo` (default) or `razorpay`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Razorpay publishable key
- `NEXT_PUBLIC_PAYMENT_ORDER_URL` — backend order creation endpoint
- `NEXT_PUBLIC_PAYMENT_VERIFY_URL` — backend payment verification endpoint

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — hero, skill grid |
| `/account` | Login / signup / my skills |
| `/offer` | List a skill (seeker) |
| `/find` | Browse & request help (giver) |
| `/requests` | Incoming hire requests (seeker) |
| `/my-requests` | Outgoing help requests (giver) |
| `/admin` | Admin dashboard (demo password in UI) |

## Deploy

Deploy to [Vercel](https://vercel.com) or any Node.js host that supports Next.js:

```bash
npm run build
npm run start
```
