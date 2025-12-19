# 🔧 Karigar - Local Services Marketplace

A modern platform connecting local service providers (electricians, plumbers, tutors, etc.) with customers in Pakistan.

## 🚀 Features

### For Customers
- **Browse Providers** - Search by category, region, and availability
- **Request Services** - Book appointments with preferred time slots
- **Real-time Chat** - Communicate with providers
- **Reviews & Ratings** - Rate completed services
- **Mutual Cancellation** - Fair cancellation with agreement system

### For Providers
- **Provider Dashboard** - Manage incoming requests
- **Profile Setup** - Showcase services, pricing, and availability
- **CNIC Verification** - Optional ID verification for trust
- **Accept/Decline Requests** - Control your workload
- **Mark Complete & Paid** - Track job status

### For Admins
- **User Management** - View all users, ban/unban
- **Provider Overview** - Monitor all registered providers
- **Stats Dashboard** - Track platform metrics

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Vanilla CSS with CSS Variables
- **Backend:** Firebase (Auth, Firestore)
- **Real-time:** Firebase Realtime Database (Chat)
- **Storage:** Supabase Storage (Images)
- **Icons:** React Icons (Feather)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Web-Hackathon-2025/Full-Stack-Four-Eyes.git
cd Full-Stack-Four-Eyes

# Install dependencies
npm install

# Start development server
npm run dev
```

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navbar.jsx
│   ├── ProviderCard.jsx
│   ├── RequestModal.jsx
│   ├── ReviewModal.jsx
│   └── CancellationModal.jsx
├── pages/           # Route pages
│   ├── Home.jsx
│   ├── Browse.jsx
│   ├── ProviderProfile.jsx
│   ├── CustomerDashboard.jsx
│   ├── ProviderDashboard.jsx
│   ├── ProviderSetup.jsx
│   ├── AdminDashboard.jsx
│   └── Chat.jsx
├── context/         # React Context providers
│   ├── AuthContext.jsx
│   └── NotificationsContext.jsx
├── config/          # Configuration files
│   ├── firebase.js
│   ├── supabase.js
│   └── constants.js
└── utils/           # Helper functions
    ├── uploadHelper.js
    └── cancellationHelper.js
```

## 👥 Team

**Full Stack Four Eyes** - Web Hackathon 2025

## 📄 License

MIT License
