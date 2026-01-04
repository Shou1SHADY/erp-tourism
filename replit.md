# WanderlustERP - Tourism Company Management System

## Overview

This is a modular ERP (Enterprise Resource Planning) system built for a tourism and travel company. The application manages tours, bookings, customers, and payments with a clean React frontend and Express backend. It's designed for tour operators, sales teams, operations managers, and finance departments to handle multi-day travel packages, adventure activities, and optional add-ons.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Charts**: Recharts for dashboard analytics visualization

The frontend follows a modular page-based structure under `client/src/pages/` with reusable components in `client/src/components/`. Custom hooks in `client/src/hooks/` encapsulate data fetching logic for each entity (tours, bookings, customers, payments).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: REST API with typed routes defined in `shared/routes.ts`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Build System**: Vite for frontend, esbuild for server bundling

The backend uses a storage layer pattern (`server/storage.ts`) that abstracts database operations, making it easier to swap implementations or add caching. API routes are registered in `server/routes.ts` with validation against shared schemas.

### Data Storage
- **Database**: PostgreSQL (configured via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Managed via Drizzle Kit (`drizzle.config.ts`)

Core entities:
- **Users**: Staff accounts with role-based permissions (admin, manager, sales, operations, accountant)
- **Tours**: Travel packages with pricing, duration, and capacity
- **Customers**: Client information including passport details
- **Bookings**: Reservations linking customers to tours with status tracking
- **Payments**: Transaction records with multiple payment method support

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod insert schemas
- `routes.ts`: API route definitions with method, path, and response schemas

This pattern ensures type safety across the full stack and eliminates API contract drift.

## External Dependencies

### Payment Gateways
- **PayPal**: Server SDK integration for international payments (`server/paypal.ts`)
  - Requires `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` environment variables
  - Supports sandbox and production environments
- **Paymob**: Egypt-focused payment gateway (`server/paymob.ts`)
  - Requires `PAYMOB_API_KEY`, `PAYMOB_INTEGRATION_ID_CARD`, `PAYMOB_IFRAME_ID_CARD`, `PAYMOB_HMAC_SECRET`
  - Uses iframe-based payment flow

### Database
- PostgreSQL database connection via `DATABASE_URL` environment variable
- Uses `pg` (node-postgres) connection pool
- Session storage via `connect-pg-simple`

### Development Tools
- Replit-specific Vite plugins for error overlay and development experience
- Drizzle Kit for database schema management (`npm run db:push`)