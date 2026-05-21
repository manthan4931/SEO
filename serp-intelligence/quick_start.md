# SERP Intelligence & Competitor Analysis Engine - Quick Start

This guide will help you get the project up and running in minutes.

## 🚀 Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **SerpApi Key** (Get it from [serpapi.com](https://serpapi.com))
- **Groq API Key** (Get it from [console.groq.com](https://console.groq.com))

## 🛠️ Backend Setup
1. **Navigate to backend**:
   ```bash
   cd serp-intelligence/backend
   ```
2. **Setup Virtual Environment**:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   python -m playwright install chromium
   ```
4. **Environment Variables**:
   Create a `.env` file in `backend/core/` (or check existing one):
   ```env
   SERP_API_KEY=your_serp_api_key
   GROQ_API_KEY=your_groq_api_key
   ```
5. **Run Migrations & Start Server**:
   ```bash
   cd core
   python manage.py migrate
   python manage.py runserver
   ```

## 🎨 Frontend Setup
1. **Navigate to frontend**:
   ```bash
   cd serp-intelligence/frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🔍 First Run
1. Open the dashboard in your browser.
2. Go to **Keyword Explorer**.
3. Enter a keyword (e.g., "best seo tools") and click **Start Scrape**.
4. The AI Agent will scrape the SERP, analyze competitor content, and generate a brief.
5. View results in **Competitor Lab** and **Brief Engine**.
