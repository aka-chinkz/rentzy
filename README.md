# 🏠 Rentzy - Community Rental Marketplace

A dark-themed, aesthetic e-commerce platform where users can **borrow and rent items** from people nearby. Built with a **separate frontend and backend** architecture.

![Rentzy Preview](https://via.placeholder.com/1200x600/0a0a0f/6366f1?text=Rentzy+-+Borrow.+Rent.+Share.)

## ✨ Features

### Core Functionality
- **User Authentication** - Email/password and Google OAuth
- **User Profiles** - Ratings, reviews, and rental history
- **Item Listings** - Images, descriptions, pricing, and availability
- **Location Discovery** - Find items near you using GPS/OpenStreetMap
- **Rental Requests** - Request, approve, track rental status
- **In-app Chat** - Real-time messaging with Socket.IO
- **Review System** - Rate and review after completed rentals

### Design
- 🌙 **Dark mode by default**
- 🪟 **Glassmorphism cards** with blur effects
- ✨ **Smooth animations** using Framer Motion
- 📱 **Mobile-first responsive layout**
- 🎨 **Modern, minimal aesthetic**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Backend** | Express.js, Node.js, Socket.IO |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Real-time** | Socket.IO |
| **Maps** | OpenStreetMap + Leaflet |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) |

---

## 📁 Project Structure

```
rentzy/
├── backend/                      # Express.js API Server
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── config/
│   │   │   └── supabase.ts       # Supabase client config
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT authentication
│   │   │   ├── errorHandler.ts   # Error handling
│   │   │   └── validate.ts       # Request validation
│   │   ├── routes/
│   │   │   ├── auth.routes.ts    # Auth endpoints
│   │   │   ├── user.routes.ts    # User endpoints
│   │   │   ├── item.routes.ts    # Item CRUD
│   │   │   ├── rental.routes.ts  # Rental management
│   │   │   ├── message.routes.ts # Chat/messaging
│   │   │   ├── review.routes.ts  # Reviews
│   │   │   ├── notification.routes.ts
│   │   │   └── upload.routes.ts  # File uploads
│   │   └── socket/
│   │       └── index.ts          # Socket.IO handlers
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Next.js Application
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── auth/             # Login, signup
│   │   │   ├── browse/           # Browse items
│   │   │   ├── items/[id]/       # Item details
│   │   │   ├── list-item/        # Create listing
│   │   │   ├── messages/         # Chat system
│   │   │   ├── my-rentals/       # Rental management
│   │   │   ├── notifications/    # Notifications
│   │   │   ├── profile/          # User profile
│   │   │   └── page.tsx          # Homepage
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI components
│   │   │   ├── layout/           # Layout components
│   │   │   └── items/            # Item components
│   │   ├── contexts/             # React Context (Auth, Location)
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios API client
│   │   │   └── socket.ts         # Socket.IO client
│   │   └── types/                # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
│
├── supabase/
│   └── schema.sql                # Database schema
│
├── package.json                  # Root workspace config
└── README.md
```

---

## 🎨 Design System

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0a0a0f` | Main background |
| Secondary BG | `#12121a` | Cards, inputs |
| Tertiary BG | `#1a1a24` | Elevated surfaces |
| Accent Primary | `#6366f1` | Buttons, links, CTAs |
| Accent Secondary | `#8b5cf6` | Gradients, hover |
| Accent Tertiary | `#a855f7` | Gradients |
| Success | `#10b981` | Success states |
| Warning | `#f59e0b` | Warnings, ratings |
| Error | `#ef4444` | Errors, destructive |
| Text Primary | `#f8fafc` | Main text |
| Text Secondary | `#94a3b8` | Secondary text |
| Text Muted | `#64748b` | Muted text |

### Typography

- **Display Font**: Space Grotesk (headings, brand)
- **Body Font**: Outfit (general text)
- **Mono Font**: JetBrains Mono (code, numbers)

---

## 📊 Database Schema

### Tables

```
profiles          - User profiles with ratings
categories        - Item categories
items            - Listed rental items
rental_requests  - Rental request/status tracking
conversations    - Chat conversations
messages         - Chat messages
reviews          - User reviews
saved_items      - Favorited items
notifications    - User notifications
```

### Entity Relationship

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │────<│    items     │────<│rental_requests│
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │              ┌─────┴─────┐              │
       │              │           │              │
       ▼              ▼           ▼              ▼
┌──────────────┐  ┌─────────┐  ┌────────┐  ┌─────────┐
│   reviews    │  │ saved   │  │messages│  │ notify  │
└──────────────┘  └─────────┘  └────────┘  └─────────┘
```

---

## 🔄 User Flow Diagrams

### Rental Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   BROWSE    │───>│   SELECT    │───>│   REQUEST   │
│   Items     │    │    Item     │    │   Rental    │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                    ┌───────────────────────┘
                    ▼
              ┌─────────────┐
              │   PENDING   │
              │  (waiting)  │
              └─────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐
│  APPROVED   │ │REJECTED │ │  CANCELLED  │
└─────────────┘ └─────────┘ └─────────────┘
        │
        ▼
┌─────────────┐
│   RENTED    │ ←── Item picked up
│ (active)    │     Security deposit paid
└─────────────┘
        │
        ▼
┌─────────────┐
│  RETURNED   │ ←── Item returned
│ (complete)  │     Deposit refunded
└─────────────┘
        │
        ▼
┌─────────────┐
│   REVIEW    │ ←── Both parties can review
└─────────────┘
```

### Listing Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CREATE    │───>│    ADD      │───>│    SET      │
│   Listing   │    │   Images    │    │   Pricing   │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   LIVE!     │<───│   REVIEW    │<───│    SET      │
│  Published  │    │   Details   │    │  Location   │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/rentzy.git
cd rentzy

# Install all dependencies (root + backend + frontend)
npm run install:all
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Create storage buckets:
   - `item-images` (public)
   - `avatars` (public)
4. Enable Google OAuth in Authentication > Providers (optional)
5. Get your project URL and keys from Settings > API

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Run Development Servers

```bash
# Run both backend and frontend concurrently
npm run dev

# Or run them separately:
npm run dev:backend   # Backend on http://localhost:5000
npm run dev:frontend  # Frontend on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Page Structure (Frontend)

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, categories |
| `/browse` | Browse/search items with filters |
| `/items/[id]` | Item detail with booking |
| `/list-item` | Multi-step listing creation |
| `/profile` | User profile with listings & reviews |
| `/my-rentals` | Manage rentals (as renter/owner) |
| `/messages` | Chat inbox |
| `/messages/[id]` | Individual conversation |
| `/notifications` | Notification center |
| `/auth/login` | Sign in page |
| `/auth/signup` | Create account page |

---

## 🔌 API Endpoints (Backend)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/signout` | Sign out |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/me/items` | Get my items |
| GET | `/api/users/me/saved` | Get saved items |
| POST | `/api/users/me/saved/:itemId` | Toggle save item |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List items (with filters) |
| GET | `/api/items/:id` | Get item details |
| POST | `/api/items` | Create item |
| PATCH | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Rentals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rentals` | Get my rentals |
| GET | `/api/rentals/:id` | Get rental details |
| POST | `/api/rentals` | Create rental request |
| PATCH | `/api/rentals/:id/status` | Update status |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get conversations |
| GET | `/api/messages/conversations/:id` | Get messages |
| POST | `/api/messages/conversations` | Start conversation |
| POST | `/api/messages/conversations/:id/messages` | Send message |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/user/:userId` | Get user reviews |
| GET | `/api/reviews/item/:itemId` | Get item reviews |
| POST | `/api/reviews` | Create review |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload single image |
| POST | `/api/upload/images` | Upload multiple images |
| POST | `/api/upload/avatar` | Upload avatar |
| DELETE | `/api/upload/image` | Delete image |

---

## 🔐 Authentication Flow

```
Email Sign-up → Verify Email → Create Profile → Browse

Google OAuth → Callback → Auto-create Profile → Browse
```

---

## 💰 Monetization Roadmap (Future)

When ready to scale, consider:

### Phase 1: Transaction Fees
- 5-10% platform fee on rental price
- Integrate Stripe for secure deposits
- Hold deposits in escrow

### Phase 2: Premium Features
- Featured listings (higher visibility)
- Verified badge for trusted users
- Premium analytics for owners

### Phase 3: Insurance & Protection
- Partner with insurance providers
- Damage protection plans
- Rental guarantees

### Phase 4: Business Accounts
- Multi-item management
- Inventory tracking
- Team access controls

---

## 🔧 Scaling Considerations

### Performance
- [ ] Implement infinite scroll pagination
- [ ] Add Redis caching for frequently accessed data
- [ ] Use Vercel Edge Functions for faster responses
- [ ] Optimize images with Next.js Image component

### Features
- [ ] Push notifications (Web Push API)
- [ ] Email notifications (SendGrid/Resend)
- [ ] Advanced search with Algolia
- [ ] Calendar integration for availability
- [ ] QR code for pickup verification

### Infrastructure
- [ ] CDN for static assets
- [ ] Database read replicas
- [ ] Rate limiting
- [ ] Error monitoring (Sentry)
- [ ] Analytics (PostHog, Mixpanel)

---

## 📄 API Routes (Optional)

If needed, create API routes in `src/app/api/`:

```typescript
// src/app/api/items/route.ts
export async function GET(request: Request) {
  // Handle item queries
}

// src/app/api/rentals/route.ts  
export async function POST(request: Request) {
  // Handle rental requests
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📝 License

MIT License - feel free to use this for personal or commercial projects.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Framer Motion](https://framer.com/motion) - Animations
- [Lucide](https://lucide.dev) - Beautiful icons
- [OpenStreetMap](https://openstreetmap.org) - Free mapping

---

<p align="center">
  Made with 💜 for the sharing economy
</p>
