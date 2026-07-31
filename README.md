# ChinesApp Backend

Backend API for ChinesApp - Chinese Learning Application

## Tech Stack

- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose**
- **Socket.io** for real-time features
- **OpenAI** for AI Voice & Chat
- **MSG91** for OTP
- **Razorpay/Stripe** for payments
- **Firebase Remote Config** for feature flags

## Project Structure

```
src/
├── config/
│   └── database.ts          # MongoDB connection
├── controllers/
│   ├── auth.controller.ts   # Authentication APIs
│   ├── user.controller.ts   # User profile, progress, gems
│   ├── ai.controller.ts     # AI Voice & Chat
│   ├── course.controller.ts # Courses & Scenarios
│   ├── payment.controller.ts# Payment handling
│   └── config.controller.ts # App config
├── middleware/
│   ├── auth.ts              # JWT authentication
│   └── error.ts             # Error handling
├── models/
│   └── index.ts             # MongoDB models
├── routes/
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── ai.routes.ts
│   ├── course.routes.ts
│   ├── payment.routes.ts
│   └── config.routes.ts
├── services/
│   ├── ai.service.ts        # OpenAI integration
│   ├── payment.service.ts   # Razorpay/Stripe
│   └── config.service.ts    # Firebase Remote Config
├── sockets/
│   └── voice.socket.ts      # Real-time voice
├── types/
│   └── index.ts             # TypeScript types
├── utils/
│   ├── otp.ts               # OTP generation & MSG91
│   ├── jwt.ts               # JWT utilities
│   └── seed.ts              # Database seeding
└── index.ts                 # App entry point
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP via MSG91 |
| POST | `/api/auth/verify-otp` | Verify OTP & login |
| POST | `/api/auth/google` | Google Sign-In |
| POST | `/api/auth/guest` | Guest login |
| GET | `/api/auth/me` | Get current user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/progress` | Get progress |
| POST | `/api/user/xp` | Add XP |
| POST | `/api/user/streak` | Update streak |
| GET | `/api/user/gems` | Get gems |
| POST | `/api/user/gems/add` | Add gems |
| POST | `/api/user/gems/spend` | Spend gems |

### AI Voice & Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/voice/start` | Start voice call |
| POST | `/api/ai/voice/audio` | Process audio (Whisper) |
| POST | `/api/ai/voice/text` | Process text |
| POST | `/api/ai/voice/end` | End call & save |
| GET | `/api/ai/chat` | Get chat history |
| POST | `/api/ai/chat` | Send message |
| DELETE | `/api/ai/chat` | Clear chat |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get course |
| GET | `/api/courses/:id/lessons` | Get lessons |
| GET | `/api/scenarios` | Get all scenarios |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment/plans` | Get subscription plans |
| POST | `/api/payment/premium/order` | Create premium order |
| POST | `/api/payment/verify` | Verify payment |
| POST | `/api/payment/webhook/razorpay` | Razorpay webhook |
| POST | `/api/payment/webhook/stripe` | Stripe webhook |

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Start MongoDB locally or use MongoDB Atlas

4. Seed the database:
```bash
npm run seed
```

5. Start development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `MSG91_AUTH_KEY` | MSG91 API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `STRIPE_SECRET_KEY` | Stripe API key |

## Deployment (Railway)

1. Create Railway account
2. Create new project
3. Add MongoDB (or use existing)
4. Deploy from GitHub
5. Set environment variables in Railway dashboard

## License

MIT