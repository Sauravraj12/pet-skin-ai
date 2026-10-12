# Pet Skin AI Screening Platform

## Overview

This project is a mobile-first pet skin screening MVP for dog and cat owners. It supports image upload from a phone camera or gallery, validates image quality, performs AI preliminary screening, surfaces a traffic-light risk result, matches relevant supplements, stores screening history, tracks product clicks, and provides an analytics dashboard for admin testing.

## Features

- Mobile-first landing page and onboarding flow
- Pet profile capture for name, species, and optional metadata
- Camera / gallery image upload with client-side compression
- Image validation and quality feedback
- AI-like screening flow with mock provider fallback
- Green / Yellow / Red result reporting
- Product suggestion matching based on indicators
- Product click tracking and redirect flow
- Screening history and report review
- Admin analytics dashboard and table
- Privacy consent and disclaimer messaging
- Demo mode for presentation use

## Architecture

The app uses a Next.js App Router structure with a service-layer design:

- lib/ai: AI provider abstraction, mock provider, and risk logic
- lib/recommendation: product recommendation matching
- lib/analytics: click tracking helpers and analytics payloads
- lib/validation: schemas and image checks
- app/api: HTTP API endpoints for members, screenings, products, analytics, and admin
- prisma: database schema and future migrations

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Zod validation
- Lucide React icons

## Project Structure

- app/
- lib/
- prisma/
- public/
- .env.example
- README.md

## Environment Variables

Copy .env.example to .env and add your values:

- DATABASE_URL
- DIRECT_URL
- AI_API_KEY
- AI_PROVIDER
- STORAGE_PROVIDER
- STORAGE_BUCKET
- STORAGE_API_KEY
- NEXT_PUBLIC_APP_URL
- ADMIN_SECRET

## Database Setup

1. Install PostgreSQL locally or use Supabase/Neon.
2. Create a database named pet_skin_ai.
3. Set DATABASE_URL and DIRECT_URL in .env.
4. Run Prisma migration commands after install.

## Prisma Migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## AI Provider Setup

The project supports:

- AI_PROVIDER=vision_api for a live provider integration point
- AI_PROVIDER=mock for deterministic demo results

The mock mode is designed for demos and does not silently replace production AI. It is clearly labelled internally and intended for development/testing.

## Image Storage Setup

The storage layer is abstracted and can support Supabase, Cloudinary, or S3-compatible storage. The default project uses a mock placeholder configuration and will be ready for provider-specific integration later.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:3000.

## Demo Mode

The demo page provides preset runs for:

- Demo Green
- Demo Yellow
- Demo Red

## API Documentation

The application includes API routes for:

- POST /api/members
- POST /api/pets
- POST /api/screenings
- POST /api/screenings/analyze
- GET /api/screenings/:id
- GET /api/members/:id/screenings
- GET /api/products
- GET /api/recommendations/:screeningId
- POST /api/analytics/product-click
- GET /api/admin/analytics
- GET /api/admin/screenings
- GET /api/health

## Deployment

This is designed for deployment on Vercel with a PostgreSQL backing database such as Supabase or Neon. Set production environment variables in the Vercel project dashboard.

## Security

- Keep API keys in environment variables
- Never expose secret keys in the browser
- Validate all inputs on the server
- Use secure redirect handling for product clicks
- Protect admin routes in a production deployment

## Privacy

This app processes pet images and owner metadata for preliminary screening. The UI includes consent wording and a privacy notice, and it does not expose uploaded images publicly.

## Known Limitations

- Real AI inference is represented by the mock provider unless a live provider is configured.
- Image storage is structured for abstraction but not yet connected to a cloud provider.
- The database is designed for Prisma but requires a live PostgreSQL connection for runtime persistence.

## Future Development

- Real AI provider integration with vision model
- Actual storage and upload provider implementation
- Authentication and member protection
- Real analytics aggregation and dashboards
- Custom-trained model pipeline for species-specific screening

## Production Notes

This MVP is intended as a demo-ready assessment tool, not a veterinary diagnostic device. The UI clearly labels the output as preliminary AI screening and instructs users to consult a veterinarian when needed.
