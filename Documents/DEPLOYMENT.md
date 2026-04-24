# Deployment Runbook

## Runtime

- Node.js: `22.x`
- Package manager: `npm` with lockfile v3

## Local Build Validation

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test:ci`
5. `npm run build`

## Docker Build

```bash
docker build -t apparel-quoter:latest .
docker run --rm -p 3000:3000 --env-file .env.local apparel-quoter:latest
```

## CI Gate

GitHub Actions workflow in `.github/workflows/ci.yml` enforces:

- Lint
- Typecheck
- Jest CI tests

## Required Environment Variables

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- Provider variables used by NextAuth (Google/Facebook if enabled)
- Stripe secret/public variables where applicable
- Email provider variables for SendGrid/Resend/Nodemailer usage
