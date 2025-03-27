# Letter Writer Web Application

A modern web application for creating, editing, and managing letters with Google authentication, live editing capabilities, and Google Drive integration.

## 📋 Table of Contents

- [Features](#features)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)
  - [Authentication](#authentication)
  - [Creating and Editing Letters](#creating-and-editing-letters)
  - [Live Editing](#live-editing)
  - [Google Drive Integration](#google-drive-integration)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🌟 Features

- **Google Authentication**: Secure login with Google credentials
- **Create and Edit Letters**: User-friendly interface for writing letters
- **Live Editing**: Collaborative real-time editing functionality
- **Google Drive Integration**: Save letters directly to Google Drive
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Secure Environment**: Configuration via environment variables

## 🔗 Live Demo

Visit the live application: [Letter Writer App](https://letter-frontend-kb.vercel.app/)

## 🛠️ Tech Stack

- **React**: Frontend library 
- **Firebase**: Authentication
- **Vite**: Build tool and development server
- **React Router**: Routing and navigation
- **Socket.io**: Real-time communication for live editing
- **Vercel**: Deployment and hosting

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn
- Firebase account for authentication
- Google Cloud Platform account for Google Drive integration

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/warranty-frontend.git
   cd warranty-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Firebase credentials and backend URL.

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_API_BASE_URL=your_backend_url
```

You can obtain Firebase credentials by creating a new project on the [Firebase Console](https://console.firebase.google.com/).

## 📖 Usage Guide

### Authentication

1. Navigate to the home page
2. Click "Sign in with Google"
3. Select your Google account
4. After successful authentication, you'll be redirected to the dashboard

### Creating and Editing Letters

1. From the dashboard, click "Create New Letter"
2. Enter a title and content for your letter
3. Click "Save" to store your letter
4. To edit an existing letter, find it on the dashboard and click "Edit"

### Live Editing

The application features real-time collaborative editing:

1. From the dashboard, find a letter and click "Live Edit"
2. Share the generated URL with collaborators
3. All connected users can see and make changes in real-time
4. **Important**: Only share live edit links with trusted individuals as they can edit your content

### Google Drive Integration

Save your letters to Google Drive for easy access:

1. From the dashboard, find a letter
2. Click "Copy to Drive" to save it to your Google Drive
3. Once saved, you can click "View in Drive" to open the file directly

## 🚢 Deployment

The application is configured for easy deployment to Vercel:

1. Create an account on [Vercel](https://vercel.com)
2. Connect your repository
3. Set up the environment variables in Vercel's dashboard
4. Deploy the application

The `vercel.json` file in the project root ensures proper routing for client-side navigation.

## 📁 Project Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── Components/     # React components
│   ├── Firebase/       # Firebase configuration
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Entry point
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore file
├── index.html          # HTML template
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── vercel.json         # Vercel deployment configuration
```

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Developed with ❤️ by Khadeer Basha Shaik
