# FlashLearn - CEN3031 Learning Project

A modern flashcard learning application built with React, Node.js, Express, and MongoDB.

## Quick Start

### For macOS Users

See **[SETUP-MACOS.md](./SETUP-MACOS.md)** for detailed macOS setup instructions including MongoDB installation via Homebrew or direct download.

### For Windows Users

See **setup-instructions.bat** for Windows setup instructions.

## Overview

FlashLearn is a full-stack web application that allows users to:

- Create and manage flashcard decks
- Study with interactive flashcard sessions
- Track study progress and statistics
- User authentication and profile management

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express, JWT Authentication
- **Database**: MongoDB with Mongoose
- **Port Configuration**: Backend runs on port 5001, Frontend on port 3000

## Getting Started

1. Install MongoDB (see setup instructions above)
2. Clone the repository
3. Install dependencies:

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

4. Configure environment variables (see `backend/env.example`)
5. Start the servers:

   ```bash
   # Backend (in one terminal)
   cd backend
   npm start

   # Frontend (in another terminal)
   cd frontend
   npm start
   ```

6. Open http://localhost:3000 in your browser

