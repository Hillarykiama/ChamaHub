# ChamaHub

A SaaS platform for managing chamas (savings groups) in Kenya. Built with Next.js, Supabase, M-Pesa (Daraja API), and Africa's Talking SMS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Safaricom Daraja API (STK Push) |
| SMS | Africa's Talking |
| Hosting | Vercel |

---

## Features

- Member management — add, edit, track roles and status
- Contribution tracking — monthly ledger, M-Pesa STK Push collection
- Loan management — apply, approve, repayment schedules
- Meeting scheduler — agenda, attendance, SMS reminders
- Reports — member ledger, fund summary, PDF/CSV exports
- Multi-chama support — one account can manage multiple chamas

---

## Project Structure
```
chamahub/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, signup pages
│   │   ├── (dashboard)/      # Protected chama pages
│   │   │   ├── dashboard/
│   │   │   ├── members/
│   │   │   ├── contributions/
│   │   │   ├── loans/
│   │   │   ├── meetings/
│   │   │   └── reports/
│   │   └── api/
│   │       ├── mpesa/        # STK Push + callback
│   │       └── sms/          # Africa's Talking
│   ├── lib/
│   │   ├── supabase/         # Browser + server clients
│   │   ├── mpesa/            # Daraja + SMS helpers
│   │   └── queries/          # Database query functions
│   └── components/
│       ├── layout/           # Sidebar, topbar
│       ├── dashboard/        # Metrics, activity feed
│       ├── members/          # Members table, forms
│       ├── contributions/    # Ledger, M-Pesa trigger
│       ├── loans/            # Loan cards, approval
│       ├── meetings/         # Schedule, reminders
│       └── ui/               # Shared UI components
└── supabase/
    └── migrations/           # Database schema SQL
```

---

## Getting Started

### 1. Clone and install
```bash
git clone https://github.com/yourname/chamahub.git
cd chamahub
npm install
```

### 2. Set up environment variables

Copy `.env.local` and fill in your credentials:
```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings |
| `MPESA_CONSUMER_KEY` | Safaricom Developer Portal |
| `MPESA_CONSUMER_SECRET` | Safaricom Developer Portal |
| `MPESA_SHORTCODE` | Safaricom (174379 for sandbox) |
| `MPESA_PASSKEY` | Safaricom Developer Portal |
| `AT_API_KEY` | Africa's Talking dashboard |
| `AT_USERNAME` | Africa's Talking dashboard |

### 3. Set up Supabase
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## M-Pesa Integration

ChamaHub uses Safaricom Daraja API for payment collection.

- **STK Push** — triggers a payment prompt on a member's phone
- **Callback** — Safaricom posts the payment result to `/api/mpesa/callback`
- **Sandbox** — use [https://sandbox.safaricom.co.ke](https://sandbox.safaricom.co.ke) for testing
- **Go live** — swap `BASE` in `src/lib/mpesa/daraja.ts` to `https://api.safaricom.co.ke`

Test credentials available at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)

---

## SMS Integration

Africa's Talking handles all SMS notifications:

- Contribution reminders (sent before due date)
- Meeting notifications
- Loan approval/rejection alerts
- Payment confirmations

Sandbox mode sends SMS to the simulator at [simulator.africastalking.com](https://simulator.africastalking.com)

---

## Deployment
```bash
# Deploy to Vercel
npx vercel

# Set environment variables in Vercel dashboard
# Update MPESA_CALLBACK_URL to your live domain
```

---

## Roadmap

- [ ] USSD interface for non-smartphone members
- [ ] Multi-chama federation support
- [ ] Investment portfolio tracking
- [ ] KRA iTax export
- [ ] Mobile app (React Native)
- [ ] Dividend calculation and distribution

---

## License

MIT