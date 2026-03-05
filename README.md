# Pokémon Stadium Lite

Welcome to Pokémon Stadium Lite. This is a multiplayer, turn-based battle game where two players can face off using assigned Pokémon teams. 

This repository contains both the frontend (`apps/web`) and backend (`apps/server`) projects.

---

## 🚀 Running the project with Docker

You can easily run both the Server and the Web application locally using Docker.

### Prerequisites
- Docker installed on your machine.
- Note about **`.dockerignore`**: This project includes a `.dockerignore` file in the root directory. This ensures that unused or sensitive files (like `node_modules`, `dist`, local `.env` files, `.git`, etc.) are excluded during the Docker build process, keeping your image size small and avoiding local environment conflicts.

---

### 1. Environment Variables (`.env`)

Before building the Docker images, you need to configure the environment variables for both projects. 

**A. Server Environment (`apps/server/.env`)**
Create a `.env` file inside the `apps/server/` directory. Here is an example:
```env
PORT=8080
HOST=0.0.0.0
SERVER_NAME="pokemon-stadium-lite-local"
REGION="local"
# Important: If you want the Docker container to connect to a MongoDB running on your local machine, use host.docker.internal
MONGO_URI="mongodb://host.docker.internal:27017/pokemon_stadium" 
```

**B. Web Environment (`apps/web/.env`)**
Create a `.env` file inside the `apps/web/` directory. Here is an example:
```env
VITE_API_BACKEND=http://localhost:8080
```

---

### 2. Building and Running the Backend (Server)

The Dockerfile requires the build context to be the **root** of the monorepo to access shared configurations.

```bash
# 1. Be sure you are in the root of the project
cd pokemon-stadium-lite

# 2. Build the server image
docker build -t pokemon-server -f apps/server/Dockerfile .

# 3. Run the server container (passing the .env file)
docker run -p 8080:8080 --env-file apps/server/.env pokemon-server
```

---

### 3. Building and Running the Frontend (Web)

Similarly, the frontend Dockerfile is also built from the root of the project.

```bash
# 1. Be sure you are in the root of the project
cd pokemon-stadium-lite

# 2. Build the web image
docker build -t pokemon-web -f apps/web/Dockerfile .

# 3. Run the web container
docker run -p 80:80 --env-file apps/web/.env pokemon-web
```

Once running, you can access the game by opening `http://localhost` in your browser. Ensure the backend server is concurrently running so the Web App can connect to it properly.