# EventPro — College Event Management System

A full-stack, role-based college event management web application built with Next.js 16, Firebase, and TypeScript.

## Features

- **15 management modules**: Registrations, Guests, Schedule, Budget, Vendors, Travel, Checklists, Announcements, Certificates, QR Badges, Analytics, Feedback, Media, Stage Logistics, Coordinators
- **Role-based access control** with 6 roles
- **Real-time updates** via Firestore `onSnapshot` listeners
- **QR check-in portal** — works on any device, no login required
- **Public event page** with schedule and feedback form
- **CSV import / Excel export** for registrations and budget
- **Firebase Cloud Functions** for email notifications and scheduled tasks
- **Drag-and-drop schedule builder**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.3 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Email + Google OAuth) |
| Storage | Firebase Storage |
| Functions | Firebase Cloud Functions (Node.js 20) |
| UI | Radix UI primitives + Tailwind CSS v4 |
| State | Zustand + TanStack React Query |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| DnD | @dnd-kit/core + @dnd-kit/sortable |

## Prerequisites

- Node.js 20+
- Firebase project with Firestore, Auth, Storage, and Functions enabled
- (Optional) Firebase CLI for deploying rules and functions

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd college_event_management
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase project credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Initialize Firebase

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Log in
firebase login

# Set your project
firebase use your_project_id
```

### 4. Deploy Firestore rules and indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage:rules
```

### 5. Seed demo data (optional)

```bash
npx ts-node scripts/seed.ts
```

This creates one sample event with 15 registrations, 5 guests, 10 schedule slots, 8 budget items, 3 vendors, 4 coordinators, and 2 checklists.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firestore project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase App ID |

## Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `super_admin` | Full system access | Create/delete events, manage all users, all modules |
| `event_admin` | Event-level admin | Create/edit events, manage registrations, approve budget |
| `quadinator` | Zone coordinator | View/update registrations, schedule, checklists |
| `volunteer` | On-ground support | Check in registrants, update checklist items, view schedule |
| `guest_coordinator` | Handles VIP guests | Full guest management, travel, arrival tracking |
| `viewer` | Read-only access | View dashboards and reports (no write access) |

Roles are stored in `/users/{uid}` in Firestore and enforced by both Firestore Security Rules (server-side) and UI-level guards.

## Project Structure

```
app/
  (auth)/          # Login and register pages (no sidebar)
  (dashboard)/     # All authenticated pages (sidebar + topbar)
    dashboard/[eventId]/   # Real-time event dashboard
    registrations/         # Registration management + CSV import
    guests/                # VIP guest management
    schedule/              # Drag-and-drop schedule builder
    budget/                # Budget tracker with approval workflow
    vendors/               # Vendor management
    travel/                # Travel & pickup tracking
    checklists/            # Checklist system with progress tracking
    announcements/         # Announcement center
    coordinators/          # Zone coordinator assignment
    stage/                 # Stage & logistics requirements
    certificates/          # Certificate issuance
    badges/                # QR badge system
    analytics/             # Feedback & analytics dashboard
    media/                 # Photo & document gallery
    settings/              # User roles & org settings
    notifications/         # In-app notification center
  checkin/         # Public QR check-in portal (no auth)
  event/[eventId]/public/  # Public event page
  feedback/[eventId]/submit/  # Public feedback form
components/
  layout/          # Sidebar, Topbar, AuthProvider, QueryProvider
  shared/          # DataTable, EmptyState, StatusBadge, FormField
  ui/              # Radix UI-based component library
lib/
  firebase.ts      # Firebase app initialization
  types.ts         # All TypeScript interfaces
  utils.ts         # Utility functions
  firestore/       # Firestore CRUD helpers per collection
  hooks/           # useAuth listener hook
  validations/     # Zod schemas
store/
  auth.ts          # Zustand auth store
  event.ts         # Zustand event store
functions/src/
  index.ts         # Firebase Cloud Functions (7 functions)
scripts/
  seed.ts          # Demo data seeder
```

## Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `onRegistrationCreate` | Firestore write | Generate QR token, send confirmation email |
| `onGuestStatusChange` | Firestore write | Notify pickup volunteer when guest is en route |
| `onBudgetApprovalRequest` | Firestore write | Notify admins of pending budget approvals |
| `scheduledReminderJob` | Pub/Sub (every 60 min) | Send 2-hour pickup reminders |
| `bulkCertificateEmail` | HTTPS callable | Email PDF certificates to all recipients |
| `processScheduledAnnouncements` | Pub/Sub (every 15 min) | Send scheduled announcements |
| `generateEventReport` | HTTPS callable | Return full event summary JSON |

To deploy functions:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Deployment

### Vercel (Frontend)

```bash
vercel deploy
```

Set the following environment variables in the Vercel dashboard (matching your `.env.local`). The `vercel.json` references them as `@firebase_*` secrets — link them via `vercel env`.

### Firebase (Rules + Functions)

```bash
firebase deploy
```

## Public URLs

| Path | Description |
|------|-------------|
| `/checkin` | QR check-in portal (no login required) |
| `/event/[eventId]/public` | Public event information page |
| `/feedback/[eventId]/submit` | Public feedback submission form |

## License

MIT
