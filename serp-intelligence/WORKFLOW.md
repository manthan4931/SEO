# Project Workflow & Architecture

This document explains the internal mechanics of the SERP Intelligence & Competitor Analysis Engine.

## 🏗️ System Architecture
The system follows a classic decoupled architecture:
- **Frontend**: React (Vite) + Tailwind CSS (Styling) + Recharts (Visualization).
- **Backend**: Django Rest Framework (API) + Playwright (Scraping) + Groq (LLM).

## 🔄 Core Workflow (8 Steps)

### 01. Keyword Definition
- **Entry Point**: `frontend/src/components/KeywordExplorer.tsx`
- **Function**: `handleStartScrape` calls `createKeyword` API.
- **Backend**: `backend/core/keywords/views.py` → `KeywordListCreateAPIView`.

### 02. SERP Scraping (SerpApi)
- **Function**: `runAnalysis` in frontend triggers the backend endpoint.
- **Backend Orchestrator**: `backend/core/services/seo_service/full_analysis.py` → `run_full_analysis`.
- **Pipeline**: If data is missing, it calls `process_keyword` in `backend/core/serp/full_serp_pipeline.py`.
- **Serp Service**: `backend/core/services/serp_service/serp_service.py` → `fetch_google_results`.

### 03. Competitor Content Extraction (Playwright)
- **Function**: `process_competitor_page` in `serp/full_serp_pipeline.py`.
- **Scraper**: `backend/core/services/scraper_service/scraper_service.py` → `scrape_page`.
- **Data Saved**: `CompetitorPage` model (page title, headings, word count, full text).

### 04. Keyword Gap & Difficulty Analysis (AI)
- **Service**: `backend/core/services/seo_service/keyword_gap.py`.
- **Logic**: Uses `langchain_groq` to compare competitor contents and find missing semantic angles.

### 05. Title Pattern Analysis (AI)
- **Service**: `backend/core/services/seo_service/title_analysis.py`.
- **Logic**: Extracts emotional triggers, power words, and suggests 5 optimized titles.

### 06. PAA (People Also Ask) Extraction
- **Function**: `extract_paa` in `backend/core/services/scraper_service/parser.py`.
- **Storage**: Saved in the `faq_data` field of the `CompetitorPage` model.

### 07. Content Clustering
- **Service**: `backend/core/services/seo_service/cluster_analysis.py`.
- **Logic**: Uses KMeans or AI to group keywords into topic clusters (displayed in Semantic Map).

### 08. Content Brief Generation (AI)
- **Service**: `backend/core/services/seo_service/brief_generator.py`.
- **Logic**: Synthesizes all analysis data into a structured content brief (Recommended title, H1, H2s, Snippet strategy).

## 🛠️ Detailed Function Reference

### Backend Services
| File Path | Function Name | Description |
|-----------|---------------|-------------|
| `services/seo_service/full_analysis.py` | `run_full_analysis` | The main orchestrator. Checks DB for data, triggers scraper if needed, then runs all AI services. |
| `serp/full_serp_pipeline.py` | `process_keyword` | Manages the full scraping cycle (SerpApi -> Playwright -> DB Save). |
| `services/serp_service/serp_service.py` | `fetch_google_results` | Wrapper for SerpApi. Returns top 10 results with snippets and PAA. |
| `services/scraper_service/scraper_service.py` | `scrape_page` | Uses Playwright to navigate to a URL and extract the full HTML/Text. |
| `services/seo_service/title_analysis.py` | `analyze_titles` | AI Service. Takes SERP titles and returns a JSON with patterns and suggestions. |
| `services/seo_service/keyword_gap.py` | `keyword_gap_analysis` | AI Service. Compares competitor texts to find missing semantic topics. |
| `services/seo_service/brief_generator.py` | `generate_content_brief` | AI Service. Final synthesizer that creates the full content outline. |

### Frontend Components
| File Path | Component Name | Responsibility |
|-----------|----------------|----------------|
| `lib/api.ts` | `runAnalysis` | Triggers the backend orchestration for a specific keyword. |
| `KeywordExplorer.tsx` | `handleAnalyze` | UI trigger for starting the AI analysis pipeline. |
| `CompetitorLab.tsx` | `loadCompetitors` | Fetches and displays parsed competitor page data (Word count, Headings). |
| `BriefEngine.tsx` | `loadReports` | Fetches the latest AI-generated JSON reports and displays the brief. |

## 📂 Key File Locations
...

### Backend
- `/backend/core/analysis/`: API endpoints for analysis results.
- `/backend/core/competitors/`: Storage and logic for competitor page data.
- `/backend/core/serp/`: Main orchestration pipeline for scraping.
- `/backend/core/services/seo_service/`: AI-powered analysis logic (Titles, Gaps, Briefs).
- `/backend/core/services/llm_service/`: Groq client configuration.

### Frontend
- `/frontend/src/lib/api.ts`: Central API wrapper for backend communication.
- `/frontend/src/components/KeywordExplorer.tsx`: UI for keyword entry and queue management.
- `/frontend/src/components/CompetitorLab.tsx`: Deep-dive UI for competitor metrics.
- `/frontend/src/components/BriefEngine.tsx`: Displays the final AI content brief.
- `/frontend/src/components/Dashboard.tsx`: High-level executive overview.

## 🔗 Data Flow Example
1. User enters keyword in `KeywordExplorer`.
2. Backend `run_full_analysis` checks for existing `SERPResult`.
3. If none, `fetch_google_results` (SerpApi) gets organic results.
4. `process_competitor_page` (Playwright) crawls each top-ranking URL.
5. `analyze_titles`, `keyword_gap_analysis`, and `generate_content_brief` run in sequence using LLM.
6. Frontend polls or refreshes to display the `AnalysisReport`.
