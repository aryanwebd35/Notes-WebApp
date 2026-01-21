# Notes App - Digital Notebook
## Link-https://notes35-app.vercel.app

A modern, feature-rich notes application built with the MERN stack (MongoDB, Express.js, React, Node.js). This application offers a seamless experience for creating, organizing, and sharing notes with advanced rich-text capabilities and secure authentication.

## 🚀 Key Features

### 📝 Core Note Management
- **Rich Text Editor**: Powered by **TipTap**, supporting bold, italics, lists, code blocks, and more.
- **CRUD Operations**: Create, read, update, and delete notes instantly.
- **Organization**: Filter notes by "All", "Starred", and "Archived".
- **Pinning**: Keep important notes at the top.
- **Tags**: Add tags to notes for easy categorization (visualized in UI).

### 🔒 Authentication & Security
- **Secure Login/Signup**: Email/Password authentication using **BCrypt** and **JWT**.
- **Google OAuth**: One-click login with Google using **Passport JS**.
- **Guest Access**: "Continue as Guest" feature to try the app without registration (ephemeral accounts).
- **Security Best Practices**: Helmet headers, Rate limiting, XSS protection, and Mongo sanitization.

### 🤝 Sharing & Collaboration
- **Share via Email**: Grant "View" or "Edit" permissions to other registered users.
- **Public Links**: Generate time-limited public links for sharing notes externally.
- **Share Requests**: In-app inbox to accept or reject incoming share invitations.
- **Real-time Updates**: Visual indicators for shared status and permissions.

### 🔔 Functionality & UX
- **Reminders**: Set date/time reminders for notes with visual countdowns and overdue alerts.
- **File Attachments**: Upload and attach images/files to notes (stored securely via **Cloudinary API**).
- **Version History**: Track changes and restore previous versions of your notes.
- **Global Search**: Instantly filter notes by title or content.
- **Dark/Light Mode**: Fully responsive theme with a premium aesthetic (Slate Blue Light Mode / Deep Gray Dark Mode).
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile workflows.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Editor**: [TipTap](https://tiptap.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Date Handling**: [date-fns](https://date-fns.org/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: JWT, Passport.js (Google OAuth)
- **File Storage**: [Cloudinary](https://cloudinary.com/) (via Multer)
- **Security**: Helmet, Express-Rate-Limit, HPP, XSS-Clean
- **Email**: Nodemailer (configured for verification/notifications)

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas Account (or local instance)
- Cloudinary Account
- Google Cloud Console Project (for OAuth)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd notes-app
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend:
```bash
npm run dev
```

---

## 📂 Project Structure

```
root
├── backend/
│   ├── config/         # Database & Passport config
│   ├── controllers/    # Request handlers (Auth, Note, Share)
│   ├── middlewares/    # Auth, Error, & Security middlewares
│   ├── models/         # Mongoose User & Note schemas
│   ├── routes/         # API Route definitions
│   ├── services/       # Email & File upload services
│   └── server.js       # Entry point
│
└── frontend/
    ├── public/         # Static assets (pencil.png, etc.)
    ├── src/
    │   ├── components/ # Reusable UI components (Sidebar, Editor, Modals)
    │   ├── context/    # Theme Context
    │   ├── pages/      # Page views (Dashboard, Login, Signup)
    │   ├── redux/      # Global state management (Slices)
    │   ├── services/   # Axios API setup
    │   └── utils/      # Helpers (Date formatting, Validation)
    └── main.jsx        # App entry point
```

