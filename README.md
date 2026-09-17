# Purchase Management — Frontend (Angular)

Angular frontend for the **Enhanzer Full Stack Developer Assessment**. A two-page web application that authenticates users via the Enhanzer POS API and manages purchase bill entries.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Pages & Features](#pages--features)
  - [Login Page](#1-login-page)
  - [Purchase Bill Page](#2-purchase-bill-page)
- [Architecture](#architecture)
  - [Session & Authentication Strategy](#session--authentication-strategy)
  - [HTTP Interceptor](#http-interceptor)
  - [Route Guard](#route-guard)
  - [Calculation Logic](#calculation-logic)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Running Unit Tests](#running-unit-tests)
- [Build for Production](#build-for-production)
- [Environment Configuration](#environment-configuration)

---

## Overview

```
Angular (localhost:4200)
       │
       │  HTTP (Authorization: Bearer <JWT>)
       ▼
ASP.NET Core API (localhost:5048)
       │
       ├── External Enhanzer POS API (authentication)
       └── SQL Server (Location_Details, Purchase_Bills)
```

> **Non-negotiable rule**: Angular only ever communicates with the own ASP.NET Core backend API.  
> It never directly calls the external Enhanzer API or the SQL Server database.

---

## Technology Stack

| Concern | Technology |
|---|---|
| **Framework** | Angular 22.1 (standalone components) |
| **Language** | TypeScript 6.0 |
| **Forms** | Angular Reactive Forms (`FormGroup`, `FormControl`, `Validators`) |
| **HTTP** | Angular `HttpClient` with functional `HttpInterceptorFn` |
| **State** | Angular Signals (`signal`, `computed`) |
| **Styling** | Vanilla CSS (component-scoped + global) |
| **Testing** | Vitest 4 via Angular CLI test runner |

---

## Project Structure

```
src/
├── environments/
│   ├── environment.ts                    # API base URL (production)
│   └── environment.development.ts        # API base URL (development)
│
├── app/
│   ├── core/                             # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   └── auth.guard.ts             # Functional route guard (canActivateFn)
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts       # Attaches Bearer JWT to all HTTP requests
│   │   └── services/
│   │       ├── auth.service.ts           # Login, logout, sessionStorage, Signals
│   │       ├── location.service.ts       # GET /api/locations
│   │       └── purchase-bill.service.ts  # GET/POST /api/purchase-bills
│   │
│   ├── features/                         # Page-level components (lazy-loadable)
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   ├── login.component.css
│   │   │   └── login.component.spec.ts   # 6 unit tests
│   │   └── purchase-bill/
│   │       ├── purchase-bill.component.ts
│   │       ├── purchase-bill.component.html
│   │       ├── purchase-bill.component.css
│   │       └── purchase-bill.component.spec.ts # 5 unit tests
│   │
│   ├── shared/                           # Reusable building blocks
│   │   ├── components/
│   │   │   ├── item-table/
│   │   │   │   └── item-table.component.ts     # Reusable items data table
│   │   │   └── item-summary/
│   │   │       └── item-summary.component.ts   # Reusable summary panel
│   │   ├── models/
│   │   │   ├── auth.model.ts             # LoginRequest, LoginResponse, LocationDto
│   │   │   └── purchase-bill.model.ts    # PurchaseBillItem, Request, ItemSummary
│   │   └── utils/
│   │       ├── calculation.util.ts       # Pure calculation functions
│   │       └── calculation.util.spec.ts  # 9 unit tests
│   │
│   ├── app.config.ts                     # provideRouter + provideHttpClient + interceptors
│   ├── app.routes.ts                     # Route definitions with AuthGuard
│   └── app.html                          # Root template — just <router-outlet>
│
├── index.html                            # Entry HTML
├── main.ts                               # Application bootstrap
└── styles.css                            # Global styles (Tailwind import)
```

---

## Pages & Features

### 1. Login Page

**Route:** `/login` (default redirect from `/`)

#### UI Elements
- **"Hi"** heading matching the Enhanzer UI design
- **Email** input with mail icon — `Validators.required`, `Validators.email`
- **Password** input with key icon — `Validators.required`
- **Eye toggle** button — switches between `type="password"` and `type="text"`
- **LOGIN** button — disabled and shows spinner while the API call is in progress

#### Validation Messages
| Condition | Message displayed |
|---|---|
| Email field left empty | `Email is required` |
| Email format is invalid | `Please enter a valid email` |
| Password field left empty | `Password is required` |
| Backend returns 401 (wrong credentials) | `Invalid username or password` |
| Backend / network error (5xx) | `Unable to authenticate. Please try again.` |

#### On Successful Login
1. JWT token received from backend is saved to `sessionStorage`.
2. User email and their locations (`Location_Code`, `Location_Name`) are saved to `sessionStorage`.
3. User is redirected to `/purchase-bill`.

---

### 2. Purchase Bill Page

**Route:** `/purchase-bill` — **protected by `authGuard`** (redirects to `/login` if no session).

#### Layout
- **Top bar** — Enhanzer brand logo, page title, authenticated user email, Logout button
- **Tab nav** — Header / Details / Notes / Documents tabs
- **Sub-tabs** — Items / Accounts / Taxes
- **Two-column grid** (responsive):
  - Left: entry form + items table
  - Right: summary panel (sticky on desktop)

#### Form Fields

| Field | Type | Behaviour |
|---|---|---|
| **Item** | Autocomplete text | Filters dropdown from allowed fruits: Mango, Apple, Banana, Orange, Grapes, Kiwi, Strawberry |
| **Batch** | Select dropdown | Populated from `GET /api/locations` (`Location_Name` values). Shows "Loading..." indicator while fetching |
| **Standard Cost** | Number | Must be ≥ 0 |
| **Standard Price** | Number | Must be ≥ 0 |
| **Qty** | Integer | Must be > 0 |
| **Free Qty** | Disabled | Always 0 |
| **Discount (%)** | Number | Must be 0–100 |
| **Total Cost** | Read-only | Auto-calculated live preview |
| **Total Selling** | Read-only | Auto-calculated live preview |
| **Margin** | Read-only | Standard Price − Standard Cost |

#### Calculation Rules (exact formulas from assignment PDF)

```
Total Cost   = (Standard Cost × Quantity) − Discount% × (Standard Cost × Quantity)
             = Gross − (Gross × Discount / 100)

Total Selling = Standard Price × Quantity
```

**Worked example (from PDF):**
- Standard Cost = 100, Standard Price = 150, Quantity = 5, Discount = 20%
- Total Cost = (100 × 5) − 20% of 500 = 500 − 100 = **400**
- Total Selling = 150 × 5 = **750**

> These formulas are implemented once in `src/app/shared/utils/calculation.util.ts` as pure functions and reused for both the live preview and the submitted table row — they can never drift apart.

#### "+ Add" Button
1. Validates the form (`markAllAsTouched()` if invalid — shows all errors).
2. Calls `POST /api/purchase-bills` with the row data.
3. On success: appends returned row to the items table and immediately recalculates the summary.
4. Shows spinner + "Adding..." text while the request is in flight.

#### Reusable Components
- **`<app-item-table>`** — Displays all bill rows (Item, Batch, Std Cost, Std Price, Margin, Qty, Free Qty, Discount, Total Cost, Total Selling). Shows empty-state illustration when no rows exist.
- **`<app-item-summary>`** — Right-panel showing:
  - **Item Summary**: Total Items (count of rows), Total Qty (sum)
  - **Financial Summary**: Gross Total, Item Discount, Net Total Cost, Expected Total Selling

---

## Architecture

### Session & Authentication Strategy

This application uses **JWT (JSON Web Token)** issued by the own ASP.NET Core backend:

1. User submits credentials → Angular calls `POST /api/auth/login` (own backend only — **never** directly to external API).
2. Backend validates credentials against the external Enhanzer POS API.
3. On success, backend issues a short-lived JWT and returns it along with `userLocations`.
4. Angular stores the token, user email, and locations in **`sessionStorage`** via `AuthService`.
   - `sessionStorage` is used (not `localStorage`) so the session is cleared when the browser tab is closed.
5. The token is attached to every subsequent API call via the `HttpInterceptor`.

```typescript
// auth.service.ts — key state managed via Angular Signals
readonly token       = signal<string | null>(sessionStorage.getItem('auth_token'));
readonly currentUser = signal<string | null>(sessionStorage.getItem('auth_user'));
readonly isAuthenticated = computed(() => !!this.token());
```

### HTTP Interceptor

`src/app/core/interceptors/auth.interceptor.ts` — Functional interceptor registered in `app.config.ts`:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
```

Every `HttpClient` request made after login automatically carries the `Authorization: Bearer <JWT>` header — no manual header setting required in any service.

### Route Guard

`src/app/core/guards/auth.guard.ts` — Functional `canActivateFn`:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const isLoggedIn = inject(AuthService).isLoggedIn();
  return isLoggedIn ? true : inject(Router).createUrlTree(['/login']);
};
```

Applied to `/purchase-bill` in `app.routes.ts`:
```typescript
{
  path: 'purchase-bill',
  component: PurchaseBillComponent,
  canActivate: [authGuard]
}
```

### Calculation Logic

`src/app/shared/utils/calculation.util.ts` — Pure functions with no side effects:

```typescript
export function calculateTotalCost(standardCost, quantity, discountPercentage): number {
  const gross = standardCost * quantity;
  const discountAmount = gross * (discountPercentage / 100);
  return Math.round((gross - discountAmount) * 100) / 100;
}

export function calculateTotalSelling(standardPrice, quantity): number {
  return Math.round((standardPrice * quantity) * 100) / 100;
}

export function calculateItemSummary(items): ItemSummary {
  return {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}
```

---

## API Integration

All API calls go through the Angular `HttpClient` to the own ASP.NET Core backend. The base URL is configured in `src/environments/environment.ts`.

| Service | Method | Endpoint | Description |
|---|---|---|---|
| `AuthService` | `POST` | `/api/auth/login` | Authenticate and receive JWT + locations |
| `LocationService` | `GET` | `/api/locations` | Fetch saved locations for Batch dropdown |
| `PurchaseBillService` | `GET` | `/api/purchase-bills` | Load all bill rows + summary |
| `PurchaseBillService` | `POST` | `/api/purchase-bills` | Save a new bill row (server calculates totals) |
| `PurchaseBillService` | `GET` | `/api/purchase-bills/items` | Fetch allowed fruit items for autocomplete |

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org/) | 22.x or later |
| [npm](https://www.npmjs.com/) | 10.x or later |
| [Angular CLI](https://angular.dev/tools/cli) | 22.x |

> The **backend API must be running** on `http://localhost:5048` before starting the frontend.  
> See the backend `README.md` for backend setup instructions.

### Installation

```bash
# Clone the repo (or navigate to the frontend folder)
cd PurchaseManagement.Web

# Install dependencies
npm install
```

### Running the App

```bash
npm start
# or
ng serve
```

Open **http://localhost:4200** in your browser.

**Login credentials (Enhanzer staging):**
```
Email:    info@enhanzer.com
Password: Welcome#5
```

---

## Running Unit Tests

```bash
npm test
```

Uses **Vitest** via the Angular CLI test runner. All tests run in a jsdom environment (no browser required).

### Test Coverage

| File | Tests |
|---|---|
| `calculation.util.spec.ts` | 9 — calculation formulas incl. exact PDF worked examples |
| `login.component.spec.ts` | 6 — form validation, toggle, auth flow, error handling |
| `purchase-bill.component.spec.ts` | 5 — location loading, calculations, Add flow, logout |
| `app.spec.ts` | 1 — app shell creation |
| **Total** | **21 tests — all passing** |

---

## Build for Production

```bash
npm run build
```

Output is placed in `dist/PurchaseManagement.Web/`. The build is optimized and tree-shaken.

---

## Environment Configuration

### `.env` File

Frontend configuration variables are defined in [`.env`](file:///c:/Users/sachi/Desktop/Enhanzer/PurchaseManagement.Web/.env) (and template in [`.env.example`](file:///c:/Users/sachi/Desktop/Enhanzer/PurchaseManagement.Web/.env.example)):

```env
# Backend API Base URL (ASP.NET Core Backend)
API_URL=http://localhost:5048/api
NG_APP_API_URL=http://localhost:5048/api

# Frontend Dev Server Settings
PORT=4200
HOST=localhost

# Application Mode
NODE_ENV=development
```

### Angular Environment Files

`src/environments/environment.ts` / `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5048/api'   // ← backend API base URL
};
```

To point to a different backend (e.g. staging or cloud), update `apiUrl` in `environment.ts` / `environment.development.ts` or set your `.env` variables accordingly.
