# Arsip Mahasiswa Prodi ABT - Politeknik Negeri Semarang

Sistem arsip digital data mahasiswa & alumni dan tracer study untuk Program Studi Administrasi Bisnis Terapan (ABT) Politeknik Negeri Semarang.

## 📋 Fitur Utama

- **Dashboard Mahasiswa/Alumni**: Lihat data prestasi, riwayat karier, dan status alumni
- **Dashboard Admin**: Kelola data mahasiswa, tracer study, dan prestasi
- **Tracer Study**: Pelacakan karir dan status alumni setelah lulus
- **Portfolio Prestasi**: Dokumentasi prestasi akademik dan non-akademik
- **Protected Routes**: Sistem autentikasi untuk mahasiswa dan admin

## 🛠️ Tech Stack

### Frontend
- **Vite** - Build tool & dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Routing & navigation
- **React Hook Form + Zod** - Form validation
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **React Query** - Data fetching & caching
- **Recharts** - Data visualization

### Backend (Coming Soon)
- **PHP** - Server-side logic
- **MySQL** - Database
- **Shared Hosting** (Rumahweb)

## 🚀 Development Setup

### Prerequisites
- Node.js (v16+)
- npm atau bun

### Installation

```bash
# Clone repository
git clone <repo-url>
cd Arsipmhs

# Install dependencies
npm install

# Start development server
npm run dev
```

Server akan berjalan di `http://localhost:8080`

## 📁 Project Structure

```
src/
├── auth/              # Authentication module
├── components/        # Reusable React components
│   ├── admin/        # Admin-specific components
│   ├── auth/         # Auth components
│   ├── dashboard/    # Dashboard components
│   ├── landing/      # Landing page components
│   ├── layout/       # Layout components
│   ├── prestasi/     # Achievement components
│   ├── shared/       # Shared UI components
│   └── ui/           # shadcn/ui components
├── contexts/          # React Context for state
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── pages/             # Page components
├── services/          # Business logic & API calls
├── types/             # TypeScript type definitions
├── constants/         # Application constants
├── data/              # Seed data (temporary)
└── repositories/      # Data access layer
```

## 🔐 Demo Credentials

### Student Account
- **Username**: `mahasiswa1`
- **Password**: `student123`

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run build:dev  # Build in development mode
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## ⚠️ Current Status (MVP)

### ✅ Implemented
- Frontend UI & routing
- Form validation & submission
- Protected routes
- React Context state management
- In-memory data storage
- Authentication UI (frontend-only)

### 🔄 In Progress
- Backend API (PHP + MySQL)
- Database schema & migrations
- Server-side authentication
- Persistent data storage
- File upload functionality

### 📌 Planned
- Email notifications
- Advanced analytics
- User permissions & roles
- Audit logging
- Performance optimization

## 🔗 Roadmap

1. **Phase 1**: Cleanup frontend & remove Lovable dependencies ✅
2. **Phase 2**: Design & implement MySQL database schema
3. **Phase 3**: Build PHP backend API
4. **Phase 4**: Connect frontend to backend
5. **Phase 5**: Implement authentication & security
6. **Phase 6**: Deploy to shared hosting (Rumahweb)
7. **Phase 7**: Testing & optimization

## 📦 Deployment

Akan menggunakan **Shared Hosting (Rumahweb)** dengan:
- PHP (Apache)
- MySQL
- .htaccess untuk SPA routing

## 🤝 Contributing

Silakan submit issues dan pull requests.

## 📄 License

[Tentukan license yang sesuai]

## 📧 Contact

For questions or support, contact development team.

---

**Note**: Ini adalah dalam tahap pengembangan awal. Banyak fitur masih menggunakan mock data dan akan dikoneksikan ke database nyata di fase berikutnya.
