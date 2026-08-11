# Learn Chines Backend

Backend API for Learn Chines - Chinese Learning Application

## Tech Stack

- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose**
- **Socket.io** for real-time features
- **OpenAI** for multilingual AI tutoring, transcription and AI-generated speech
- **Resend** for email verification codes
- **Razorpay/Stripe** for payments
- **MongoDB app settings** for feature flags, AI models and pricing

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
│   ├── otp.ts               # Legacy phone normalization helper
│   ├── jwt.ts               # JWT utilities
│   └── seed.ts              # Database seeding
└── index.ts                 # App entry point
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/email/register` | Register with email/password and send verification code |
| POST | `/api/auth/email/resend` | Resend email verification code |
| POST | `/api/auth/email/verify` | Verify email code and login |
| POST | `/api/auth/email/login` | Login with verified email/password |
| POST | `/api/auth/google` | Google Sign-In |
| GET | `/api/auth/me` | Get current authenticated user |

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
| POST | `/api/ai/voice/audio` | Transcribe learner audio and generate a tutor reply |
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
| POST | `/api/payment/google-play/verify` | Verify Android subscription or one-time purchase |

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

4. Seed the curated curriculum (idempotent by default):
```bash
npm run seed
```

The default seed upserts 8 courses, 24 lessons and 12 scenarios by stable slug. It does not delete existing content. `SEED_RESET=true` is destructive and must only be used intentionally.

5. Start development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `MONGO_URL` | Railway MongoDB URL fallback (optional) |
| `JWT_SECRET` | JWT signing secret |
| `OTP_SECRET` | Email verification-code hashing secret |
| `RESEND_API_KEY` | Resend API key used to send verification emails |
| `EMAIL_FROM` | Verified sender, for example `Learn Chines <noreply@example.com>` |
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID used to verify ID tokens |
| `GOOGLE_PLAY_PACKAGE_NAME` | Play Console Android package (`com.chinesapp.learn`) |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Service-account JSON with Play Console API access |
| `ADMIN_CONFIG_ENCRYPTION_KEY` | Master key used to encrypt integration secrets saved from admin |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD_HASH` | Preferred bcrypt admin password hash |

## Deployment (Railway)

1. Create a Railway project and deploy the backend from GitHub.
2. Add a MongoDB service to the same Railway project, or create a MongoDB Atlas cluster.
3. In the backend service's **Variables**, set `MONGODB_URI`:
   - Railway MongoDB: use a reference variable such as `${{MongoDB.MONGO_URL}}` (replace `MongoDB` if the service has a different name).
   - MongoDB Atlas: paste the Atlas `mongodb+srv://...` connection string.
4. Set `JWT_SECRET`, `OTP_SECRET`, `OPENAI_API_KEY`, admin credentials, `FRONTEND_URL`, and any enabled auth/payment provider variables, then redeploy.

After `ADMIN_CONFIG_ENCRYPTION_KEY` is configured, OpenAI, Google, Resend and Razorpay credentials can be added or rotated from the admin panel's **API Keys** page. `EMAIL_FROM` remains a backend environment variable because it is not secret. The browser only receives configured/masked status; raw saved secrets are never returned. Do not change the encryption key after saving secrets, otherwise the stored values cannot be decrypted.

Do not use `localhost` in `MONGODB_URI` on Railway. `localhost` points to the backend container itself, where MongoDB is not running.

Rotate any database password or API key that has ever been pasted into chat, logs, screenshots, or committed files. The mobile UI discloses that Ling's generated voice is AI-generated, as required for synthetic speech.

## License

MIT
