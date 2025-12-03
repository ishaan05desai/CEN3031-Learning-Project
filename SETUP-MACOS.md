# FlashLearn - macOS Setup Instructions

Complete guide to set up and run FlashLearn on macOS.

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js and npm** (v14 or higher recommended)

   - Check if installed: `node --version` and `npm --version`
   - If not installed, download from: https://nodejs.org/

2. **Homebrew** (recommended for MongoDB installation)
   - Check if installed: `brew --version`
   - If not installed, install from: https://brew.sh/
   - Installation command: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

---

## Step 1: Install MongoDB

You have two options for installing MongoDB on macOS:

### Option A: Install MongoDB using Homebrew (Recommended)

1. **Tap the MongoDB Homebrew repository:**

   ```bash
   brew tap mongodb/brew
   ```

2. **Install MongoDB Community Edition:**

   ```bash
   brew install mongodb-community
   ```

3. **Start MongoDB service:**

   ```bash
   brew services start mongodb-community
   ```

4. **Verify MongoDB is running:**

   ```bash
   brew services list
   ```

   You should see `mongodb-community` with status `started`.

5. **To stop MongoDB (if needed):**
   ```bash
   brew services stop mongodb-community
   ```

**MongoDB will automatically start on system boot when installed via Homebrew. After this you can move to step 2**

---

### Option B: Install MongoDB via Direct Download

1. **Download MongoDB:**

   - Visit: https://www.mongodb.com/try/download/community
   - Select: macOS, macOS 13.0+, Community Server
   - Download the `.tgz` file

2. **Extract and install:**

   ```bash
   # Extract the downloaded file
   tar -zxvf mongodb-macos-x86_64-*.tgz

   # Move MongoDB to a system directory
   sudo mv mongodb-macos-x86_64-* /usr/local/mongodb

   # Create data directory
   sudo mkdir -p /usr/local/var/mongodb

   # Create log directory
   sudo mkdir -p /usr/local/var/log/mongodb

   # Set permissions
   sudo chown $(whoami) /usr/local/var/mongodb
   sudo chown $(whoami) /usr/local/var/log/mongodb
   ```

3. **Add MongoDB to your PATH:**

   ```bash
   # Add to ~/.zshrc (or ~/.bash_profile if using bash)
   echo 'export PATH="/usr/local/mongodb/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

4. **Start MongoDB:**

   ```bash
   mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
   ```

5. **Verify MongoDB is running:**

   ```bash
   ps aux | grep mongod
   ```

6. **To stop MongoDB:**
   ```bash
   pkill mongod
   ```

---

### Option C: Use MongoDB Atlas (Cloud - No Local Installation)

1. **Create a free account:**

   - Visit: https://www.mongodb.com/atlas
   - Sign up for a free account

2. **Create a cluster:**

   - Create a free M0 cluster
   - Choose a cloud provider and region

3. **Set up database access:**

   - Go to "Database Access"
   - Create a database user (username and password)

4. **Set up network access:**

   - Go to "Network Access"
   - Add your IP address (or `0.0.0.0/0` for development)

5. **Get connection string:**

   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (replace `<password>` with your password)

6. **Update backend/.env:**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env and set MONGODB_URI to your Atlas connection string
   ```

---

## Step 2: Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

4. **Edit the .env file. (for local nothing needs to be done server just needs to be started):**

   ```bash
   # For local MongoDB (default):
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/flashlearn

   # For MongoDB Atlas, use your connection string:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flashlearn
   ```

---

## Step 3: Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Fix permissions (if needed):**
   ```bash
   chmod +x node_modules/.bin/*
   ```

---

## Step 4: Run the Application

### Start MongoDB (if using local MongoDB)

**If you installed via Homebrew:**

```bash
brew services start mongodb-community
```

**If you installed via direct download:**

```bash
mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
```

---

### Start the Backend Server

Open a terminal window and run:

```bash
cd backend
npm start
```

You should see:

```
Connected to MongoDB
Server running on port 5001
Environment: development
```

---

### Start the Frontend Server

Open a **new terminal window** and run:

```bash
cd frontend
npm start
```

The React development server will start and automatically open your browser to `http://localhost:3000`

---

## Step 5: Access the Application

1. **Open your browser** and navigate to: `http://localhost:3000`

2. **Register a new account:**

   - Click "Switch to Register"
   - Enter your username, email, and password
   - Password requirements: at least 8 characters with uppercase, lowercase, number, and special character

3. **Log in** with your credentials

4. **Start using FlashLearn:**
   - Create your first deck
   - Add flashcards to your deck
   - Start studying!

---

## Troubleshooting

### MongoDB Connection Issues

**Problem:** Backend shows "MongoDB connection error"

**Solutions:**

1. **Check if MongoDB is running:**

   ```bash
   # For Homebrew installation:
   brew services list

   # For direct installation:
   ps aux | grep mongod
   ```

2. **Start MongoDB if not running:**

   ```bash
   # Homebrew:
   brew services start mongodb-community

   # Direct installation:
   mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
   ```

3. **Check MongoDB port:**

   ```bash
   lsof -i :27017
   ```

   Should show mongod process

4. **Verify connection string in backend/.env:**
   - For local: `mongodb://localhost:27017/flashlearn`
   - For Atlas: Check your connection string format

---

### Port Already in Use

**Problem:** "Error: listen EADDRINUSE: address already in use :::5001"

**Solution:**

1. **Find the process using port 5001:**

   ```bash
   lsof -i :5001
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```
   Replace `<PID>` with the process ID from step 1

---

### Permission Denied Errors

**Problem:** "Permission denied" when running npm scripts

**Solution:**

```bash
# Fix permissions for all binaries
cd frontend
chmod +x node_modules/.bin/*
```

---

### Node Modules Issues

**Problem:** Dependencies not installing or errors

**Solution:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Useful Commands

### MongoDB Commands

```bash
# Start MongoDB (Homebrew)
brew services start mongodb-community

# Stop MongoDB (Homebrew)
brew services stop mongodb-community

# Restart MongoDB (Homebrew)
brew services restart mongodb-community

# Check MongoDB status (Homebrew)
brew services list

# Connect to MongoDB shell
mongosh

# View databases
show dbs

# Use flashlearn database
use flashlearn

# View collections
show collections
```

### Development Commands

```bash
# Run backend (from backend directory)
npm start

# Run backend in development mode with auto-reload (requires nodemon)
npm run dev

# Run frontend (from frontend directory)
npm start

# Build frontend for production
npm run build
```

---

## Next Steps

- Check out the API documentation in `docs/API.md`
- Review deployment instructions in `docs/DEPLOYMENT.md`
- Customize the application to your needs!

---

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MongoDB is running before starting the backend
4. Check terminal output for specific error messages

Happy learning with FlashLearn! 🎓✨
