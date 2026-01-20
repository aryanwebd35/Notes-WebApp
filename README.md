# 🚀 Notes App - Production-Ready MERN Application

[![CI/CD](https://github.com/yourusername/notes-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/notes-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack, production-ready notes application with AI-powered features, real-time reminders, secure sharing, and version control.

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - JWT + Google OAuth + Email Verification
- 📝 **Rich Text Editor** - TipTap with auto-save
- 📎 **File Uploads** - Images & documents via Cloudinary
- 🤝 **Note Sharing** - User-to-user + shareable links with permissions
- ⏰ **Reminders** - Automated email notifications with cron scheduler
- 🤖 **AI Features** - Title generation, summarization, tags (Google Gemini)
- 📜 **Version History** - Restore previous versions (20 versions/note)
- 🔄 **Refresh Tokens** - Automatic token rotation for security

### Security
- ✅ Helmet (HTTP headers)
- ✅ CORS (strict origin control)
- ✅ Rate limiting (auth, AI, sharing)
- ✅ Input validation & sanitization
- ✅ XSS & NoSQL injection prevention
- ✅ Password hashing (bcrypt)

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Redux Toolkit
- Tailwind CSS
- TipTap Editor
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Google Gemini AI
- Nodemailer/Resend
- node-cron

**DevOps:**
- GitHub Actions (CI/CD)
- Vercel (Frontend)
- Render/Railway (Backend)
- MongoDB Atlas

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Cloud Console account (OAuth)
- Cloudinary account (file uploads)
- Resend/Gmail account (emails)
- Google AI Studio account (Gemini API)

## 🚀 Quick Start

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/yourusername/notes-app.git
cd notes-app
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
npm install
\`\`\`

**Configure Environment:**
\`\`\`bash
cp .env.example .env
# Edit .env with your credentials
\`\`\`

**Required Variables:**
- \`MONGO_URI\` - MongoDB connection string
- \`JWT_SECRET\` - Random secret for JWT
- \`REFRESH_TOKEN_SECRET\` - Different random secret
- \`RESEND_API_KEY\` - Resend API key
- \`GEMINI_API_KEY\` - Google Gemini API key
- \`GOOGLE_CLIENT_ID\` - Google OAuth client ID
- \`GOOGLE_CLIENT_SECRET\` - Google OAuth secret
- \`CLOUDINARY_*\` - Cloudinary credentials

**Start Backend:**
\`\`\`bash
npm run dev
\`\`\`

Server runs on http://localhost:5000

### 3. Frontend Setup

\`\`\`bash
cd frontend
npm install
\`\`\`

**Configure Environment:**
\`\`\`bash
# Create .env
echo "VITE_API_URL=http://localhost:5000" > .env
\`\`\`

**Start Frontend:**
\`\`\`bash
npm run dev
\`\`\`

App runs on http://localhost:5173

## 🧪 Testing

\`\`\`bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
\`\`\`

**Test Coverage:**
- Auth integration tests
- Notes CRUD tests
- Mock external services

## 📦 Deployment

### Backend (Render/Railway)

1. **Create New Web Service**
2. **Connect GitHub Repository**
3. **Configure:**
   - Build Command: \`npm install\`
   - Start Command: \`npm start\`
   - Environment: Add all variables from \`.env.production\`
4. **Deploy**

Health check: \`https://your-api.onrender.com/health\`

### Frontend (Vercel)

1. **Import Project from GitHub**
2. **Configure:**
   - Framework: Vite
   - Build Command: \`npm run build\`
   - Output Directory: \`dist\`
   - Environment Variable: \`VITE_API_URL=https://your-api.onrender.com\`
3. **Deploy**

### MongoDB Atlas

1. **Create Cluster**
2. **Create Database User**
3. **Whitelist IP** (0.0.0.0/0 for cloud deployment)
4. **Get Connection String**
5. **Add to Backend Environment**

## 🔒 Security Checklist

- [x] Environment variables secured
- [x] HTTPS enabled (Vercel/Render)
- [x] CORS configured
- [x] Rate limiting active
- [x] Input validation
- [x] XSS protection
- [x] NoSQL injection prevention
- [x] Secure password hashing
- [x] JWT token rotation
- [x] Error messages sanitized

## 📊 API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register user
- \`POST /api/auth/login\` - Login
- \`GET /api/auth/me\` - Get current user
- \`POST /api/auth/refresh\` - Refresh token
- \`POST /api/auth/logout\` - Logout
- \`GET /api/auth/google\` - Google OAuth
- \`POST /api/auth/verify-email\` - Verify email

### Notes
- \`GET /api/notes\` - Get all notes
- \`POST /api/notes\` - Create note
- \`GET /api/notes/:id\` - Get note
- \`PUT /api/notes/:id\` - Update note
- \`DELETE /api/notes/:id\` - Delete note
- \`POST /api/notes/:id/upload\` - Upload file

### Sharing
- \`POST /api/notes/:id/share\` - Share with user
- \`POST /api/notes/:id/share-link\` - Generate link
- \`GET /api/notes/shared/:token\` - Access shared note

### AI (Rate Limited: 10/hour)
- \`POST /api/ai/generate-title\` - Generate title
- \`POST /api/ai/summarize\` - Summarize note
- \`POST /api/ai/suggest-tags\` - Suggest tags
- \`POST /api/ai/improve\` - Improve writing

### Version History
- \`POST /api/notes/:id/versions\` - Create version
- \`GET /api/notes/:id/versions\` - Get versions
- \`POST /api/notes/:id/versions/:versionId/restore\` - Restore

## 🔄 CI/CD Pipeline

**GitHub Actions Workflow:**
1. **Test** - Run Jest tests on push
2. **Lint** - ESLint code quality check
3. **Build** - Build frontend
4. **Deploy** - Auto-deploy on main branch

**Triggers:**
- Push to \`main\` or \`develop\`
- Pull requests to \`main\`

## 📈 Monitoring

**Health Check:**
\`\`\`bash
curl https://your-api.onrender.com/health
\`\`\`

**Logs:**
- Render Dashboard → Logs
- Vercel Dashboard → Deployments → Logs

**Metrics to Monitor:**
- API response times
- Error rates
- Auth failures
- AI usage
- Database performance

## 🐛 Troubleshooting

**Backend won't start:**
- Check all environment variables are set
- Verify MongoDB connection string
- Check port 5000 is available

**Frontend can't connect:**
- Verify \`VITE_API_URL\` is correct
- Check CORS configuration
- Ensure backend is running

**Email not sending:**
- Verify Resend API key
- Check email service configuration
- Review rate limits

**AI features failing:**
- Verify Gemini API key
- Check rate limits (10/hour)
- Ensure API credits available

## 📝 Environment Variables Guide

### Development
Use \`.env.example\` as template

### Production
Use \`.env.production\` as template

**Critical:**
- Generate strong random secrets for JWT
- Use MongoDB Atlas (not local)
- Enable HTTPS
- Set \`NODE_ENV=production\`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 👨‍💻 Author

Your Name - [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- TipTap for rich text editor
- Google Gemini for AI features
- Cloudinary for file storage
- Resend for email service

---

**⭐ Star this repo if you find it helpful!**

**🐛 Found a bug? [Open an issue](https://github.com/yourusername/notes-app/issues)**

**💬 Questions? [Start a discussion](https://github.com/yourusername/notes-app/discussions)**
