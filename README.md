# StockSense 📦
### AI-Augmented Modular Inventory Management System

StockSense is a modular Inventory Management System (IMS) that digitizes stock operations—receipts, deliveries, internal transfers, and adjustments—replacing manual registers and spreadsheets with a centralized, real-time application. 

Beyond standard inventory features, StockSense integrates an AI/ML layer that adds predictive and conversational capabilities on top of standard transactional inventory tracking.

---

## 🚀 Key Differentiators

*   **Warehouse Map View:** A spatial floor-plan grid of racks/bins, color-coded by stock level, replacing standard flat tables for physical inventory tracking.
*   **Ledger Timeline:** A vertical, git-log style activity feed of move history, replacing standard row-based logs.
*   **AI Demand Forecasting:** Predictive reorder point suggestions trained on historical ledger data to prevent stockouts.
*   **AI Anomaly Detection:** Automated flagging of unusual stock adjustment patterns to detect potential shrinkage, damage, or process failures.
*   **Natural-Language Query Assistant:** An AI chat panel allowing managers to ask plain-English questions about live inventory state.
*   **Command Palette:** Keyboard-driven navigation (Cmd/Ctrl+K) for lightning-fast jumps to SKUs or quick actions.

---

## 🏗️ Architecture & Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Recharts
*   **Backend:** FastAPI (Python)
*   **Database:** PostgreSQL (using SQLite for local dev/demo)
*   **Cache & Queue:** Redis
*   **AI/ML Runtime:** Python (scikit-learn, Prophet, pandas)
*   **LLM Layer:** Google Gemini API (Gemini 3.8 Flash)
*   **Infrastructure:** Docker & Docker Compose

### System Design
The system is built on a layered architecture: 
1. **API Gateway (FastAPI):** Single entry point handling AuthN, RBAC, and routing.
2. **Domain Services:** Independent services for Products, Documents (Receipts/Deliveries), Stock, and Ledger.
3. **AI/ML Service:** An asynchronous plane (queued via Redis/BackgroundTasks) that augments core transactions without ever blocking them.

---

## 🛠️ Local Setup Instructions

**Prerequisites:**
*   [Docker & Docker Compose](https://www.docker.com/) (Optional for full stack)
*   Python 3.10+
*   Node.js 18+

**1. Clone the repository:**
```bash
git clone https://github.com/aarthi04115/StockSense.git
cd StockSense
```

**2. Start the Backend (FastAPI):**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*API Documentation (Swagger UI) is available at [http://localhost:8000/docs](http://localhost:8000/docs).*

**3. Seed the Database:**
```bash
# From the root directory
python seed.py
```

**4. Start the Frontend (React/Vite):**
```bash
cd frontend
npm install
npm run dev
```
*The application is available at [http://localhost:5173](http://localhost:5173).*

---

## 🗺️ Roadmap

*   ✅ **Phase 1:** Foundations (Docker, DB schema, Auth)
*   ✅ **Phase 2:** Product & Warehouse Core
*   ✅ **Phase 3:** Receipts & Deliveries
*   ✅ **Phase 4:** Transfers & Adjustments
*   ✅ **Phase 5:** Dashboard & Differentiated UI
*   ✅ **Phase 6:** AI/ML Phase 1 (Forecasting)
*   ✅ **Phase 7:** AI/ML Phase 2 (Anomalies & NL Queries)
*   ✅ **Phase 8:** Polish & Submission

---
*Prepared as a technical design document for build & GitHub submission v1.0*
