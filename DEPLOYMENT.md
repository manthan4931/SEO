# 🚀 Production Deployment Guide: SERP Intelligence & SEO Engine

This guide provides a comprehensive, step-by-step path to deploy the **SERP Intelligence & SEO Engine** in a secure, high-performance, and cost-free (or low-cost) cloud environment:
- **Frontend**: Vite + React + TypeScript deployed on **Vercel**.
- **Backend**: Django (REST Framework) deployed on **Render** (Web Service).
- **Database**: PostgreSQL (with vector search support) hosted on **Neon**.

---

## 📐 Architecture Overview

```mermaid
graph TD
    User([User Browser]) -->|HTTPS / UI| Vercel[Vercel: Vite/React Frontend]
    User -->|HTTPS / API Requests| Render[Render: Django Backend]
    Render -->|SQL / pgvector| Neon[(Neon: Serverless PostgreSQL)]
    Render -->|External API Calls| SerpApi[SerpApi]
    Render -->|Vector Embeddings| Pinecone[(Pinecone Vector DB)]
    Render -->|AI Queries / LLM| Groq[Groq AI / LLM]
    
    style Vercel fill:#000,stroke:#333,stroke-width:2px,color:#fff
    style Render fill:#46a394,stroke:#333,stroke-width:2px,color:#fff
    style Neon fill:#00e599,stroke:#333,stroke-width:2px,color:#000
    style Pinecone fill:#121826,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🛠️ Step 1: Database Setup on Neon

Neon provides a fully-managed, serverless PostgreSQL database with native `pgvector` support, which is ideal for this application.

1. **Sign Up / Sign In**:
   - Go to [Neon.tech](https://neon.tech/) and create a free account.
2. **Create a Project**:
   - Click **Create Project**.
   - Name: `serp-intelligence`
   - Postgres Version: `15` or `16` (either works, but 16 is recommended).
   - Region: Select a region closest to your Render server (e.g., `us-east-1` or `eu-central-1`) to minimize latency.
3. **Retrieve the Connection String**:
   - Once the project is created, copy the connection string from the dashboard.
   - It will look like this:
     ```env
     postgresql://neondb_owner:PASSWORD@ep-random-subdomain.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```
   - Keep this connection string secure! You will use it as the `DATABASE_URL` environment variable.

---

## 🐍 Step 2: Prepare Django Backend for Render

To make the Django application ready for a stateless cloud environment like Render, we need to adjust Django settings to support production databases, static files, and environment configurations.

### 2.1 Update `backend/requirements.txt`
Render requires a production WSGI server (`gunicorn`), static file serving middleware (`whitenoise`), and an easy database URL parser (`dj-database-url`).

Add these dependencies to your `backend/requirements.txt`:

```diff
 django
 djangorestframework
 django-cors-headers
 psycopg2-binary
+ gunicorn
+ whitenoise
+ dj-database-url
 celery
 redis
 openai
 langchain
 langchain-groq
 langgraph
 sentence-transformers
 pgvector
 beautifulsoup4
 trafilatura
 playwright
 newspaper3k
 tiktoken
 pydantic
 python-dotenv
 requests
 scikit-learn
```

### 2.2 Update `backend/core/core/settings.py`

Modify the settings file to pull variables dynamically from the environment and handle production constraints.

#### 1. Import necessary libraries at the top:
```python
import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv

# Load local .env file in development
load_dotenv()
```

#### 2. Configure security settings dynamically:
```python
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-for-dev-use-only')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Allow local addresses and the future Render backend subdomain
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')
```

#### 3. Update Database Configuration:
Set it up to read `DATABASE_URL` provided by Neon, falling back to local PostgreSQL in development:

```python
# Database Settings
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'serp_db',
            'USER': 'postgres',
            'PASSWORD': 'manthan1',
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }
```

#### 4. Configure Static Files & WhiteNoise Middleware:
Insert the WhiteNoise middleware directly after the `SecurityMiddleware` to compress and serve static files efficiently:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # <-- Add here!
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...
]
```

At the bottom of the file, specify static files configurations:
```python
# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Enable WhiteNoise compression and caching support
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
```

#### 5. Configure CORS dynamically:
```python
# CORS Settings
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True'

# Alternatively, specify safe domains:
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
```

### 2.3 Create a Render Build Script (`backend/build.sh`)
Create a bash script in `backend/build.sh` that Render will run to install dependencies, run migrations, and collect static files automatically on every push.

> [!NOTE]
> Ensure this file has Unix-style line endings (`LF`) and is executable.

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python core/manage.py collectstatic --no-input

echo "Running migrations..."
python core/manage.py migrate
```

---

## 🎨 Step 3: Deploy Backend on Render

1. **Sign Up**: Create an account on [Render.com](https://render.com/).
2. **Link GitHub**: Connect your GitHub repository containing the full-stack project.
3. **Create a Web Service**:
   - Click **New +** -> **Web Service**.
   - Select your repository.
   - Configure the following settings:
     - **Name**: `serp-intelligence-backend`
     - **Root Directory**: `backend` *(CRITICAL: This tells Render to look in the backend subfolder!)*
     - **Language / Runtime**: `Python 3`
     - **Build Command**: `chmod +x build.sh && ./build.sh`
     - **Start Command**: `gunicorn core.wsgi:application --chdir core` *(Forces directory context to core)*
4. **Configure Environment Variables**:
   Click the **Environment** tab in Render and add the following keys:
   
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `SECRET_KEY` | *[Generate a long random secure string]* | Production security key |
   | `DEBUG` | `False` | Ensures safety in production |
   | `ALLOWED_HOSTS` | `localhost,127.0.0.1,serp-intelligence-backend.onrender.com` | Replace with your actual Render domain |
   | `CORS_ALLOW_ALL_ORIGINS` | `True` | Allows the Vercel frontend to query the API |
   | `DATABASE_URL` | *[Paste your Neon PostgreSQL connection string]* | Neon database URI |
   | `SERP_API_KEY` | *[Paste your SerpApi Key]* | For organic SERP scraping |
   | `PINECONE_API_KEY` | *[Paste your Pinecone API Key]* | For RAG Vector storage |
   | `PINECONE_INDEX` | `serp-intelligence` | Your Pinecone index name |
   | `GROQ_API_KEY` | *[Paste your Groq API Key]* | For LLM generation |
   | `KEYWORD_EVERYWHERE_API_KEY` | *[Optional]* | Keywords Everywhere integration |
   | `SE_RANKING` | *[Optional]* | SE Ranking Integration |
5. **Deploy**:
   - Click **Deploy Web Service**.
   - Render will build the virtual environment, compile static files, migrate the Neon Database, and start the Gunicorn server.
   - Note down the generated Render URL (e.g. `https://serp-intelligence-backend.onrender.com`). Your API root endpoint will be `https://serp-intelligence-backend.onrender.com/api`.

---

## ⚡ Step 4: Deploy Frontend on Vercel

Vercel is the optimal host for React + Vite projects due to global CDN hosting and instant cold starts.

1. **Sign Up**: Register on [Vercel](https://vercel.com/) and connect your GitHub account.
2. **Import Project**:
   - Click **Add New** -> **Project**.
   - Select your Serp Intelligence repository.
3. **Configure Build & Development Settings**:
   - **Framework Preset**: `Vite` *(Vercel will auto-detect this)*
   - **Root Directory**: `frontend` *(CRITICAL: Choose the `frontend` folder!)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Configure Environment Variables**:
   In the **Environment Variables** section, add the following variables:
   
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://serp-intelligence-backend.onrender.com/api` | **CRITICAL**: Point this to your Render backend backend URL + `/api` |
   | `GEMINI_API_KEY` | *[Your Gemini Key]* | If client-side Gemini requests are made |
5. **Deploy**:
   - Click **Deploy**.
   - Vercel will install dependencies, bundle the static frontend assets via Vite, and deploy them on a fast, global edge network.
   - You will be given a secure `.vercel.app` domain!

---

## 🔍 Step 5: Verification & Post-Deployment Checklist

Once both builds have succeeded, execute these checks to confirm a fully-functional full-stack deployment:

### 1. CORS Verification
- Load your Vercel frontend in your browser.
- Open Chrome DevTools (`F12` -> `Network`).
- Trigger an API call (e.g., add a keyword or brainstorm a topic).
- Ensure no CORS errors are thrown and you receive successful responses (`200 OK` or `201 Created`).

### 2. Database Migrations Check
- Go to your **Neon Dashboard**.
- Open the **SQL Editor** tab.
- Run a quick query:
  ```sql
  SELECT * FROM pg_catalog.pg_tables WHERE schemaname = 'public';
  ```
- Verify that your Django tables (such as `keywords_keyword`, `analysis_analysisreport`, etc.) were successfully generated by the Render build script!

### 3. Production Environment Checklist

- [ ] **DEBUG mode is disabled (`False`)** in Render's environment.
- [ ] Django's **Secret Key** is unique and stored outside the repository.
- [ ] Render API endpoints return HTTPS-only traffic.
- [ ] Vercel assets are loaded over HTTPS and successfully query the Render URL.
- [ ] All mandatory API Keys (`SerpApi`, `Groq`, `Pinecone`) are configured as secure secrets in Render's environment.

---

### 🎉 Congratulations!
Your **SERP Intelligence & SEO Engine** is now running completely in the cloud, utilizing serverless resources that automatically scale and fit within the cloud providers' generous free tiers.
