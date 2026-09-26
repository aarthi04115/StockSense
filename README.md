<div align="center">

# StockSense

### Enterprise-Grade AI-Augmented Modular Inventory Intelligence Engine

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19_•_TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![SQLite / Postgres](https://img.shields.io/badge/Storage-SQLAlchemy_ORM-CC292B?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlalchemy.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<p align="center">
  <b>A real-time, event-sourced warehouse operating system integrating spatial digital twin mapping, strict double-entry stock ledgering, and asynchronous predictive intelligence.</b>
</p>

</div>

---

## 📌 Executive Summary

**StockSense** replaces archaic spreadsheets and disjointed ERP modules with a cohesive, high-throughput inventory operating system. Built on principled software engineering practices—including strict transaction isolation, immutable audit trails, and decoupled ML execution pipelines—StockSense delivers zero-latency operational control alongside real-time predictive analytics.

---

## 🌟 Key Capabilities & System Highlights

```
                       ┌─────────────────────────────────────────┐
                       │          StockSense Web Engine          │
                       │   React 19 • TypeScript • Tailwind v4   │
                       └────────────────────┬────────────────────┘
                                            │ REST / SSE
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │       FastAPI Gateway & Auth Layer      │
                       │    Idempotent Requests • RBAC • CORS    │
                       └───────────┬─────────────────┬───────────┘
                                   │                 │
                ┌──────────────────▼──┐           ┌──▼──────────────────┐
                │ Transaction Engine  │           │ Asynchronous AI Bus │
                │ • Stock Movements   │           │ • Gemini 3.8 Flash  │
                │ • Immutable Ledger  │           │ • Demand Forecasts  │
                │ • Row-Level Locks   │           │ • Anomaly Detection │
                └──────────┬──────────┘           └──┬──────────────────┘
                           │                         │
                           └────────────► ◄──────────┘
                                         │
                                ┌────────▼────────┐
                                │ Storage Engine  │
                                │ SQLAlchemy ORM  │
                                └─────────────────┘
```

### 1. 🗺️ Spatial Digital Twin (Warehouse Map)
- Interactive 2D matrix mapping real-world physical rack and bin layouts (`Rack A1` $\rightarrow$ `Rack D4`).
- Live heatmaps reflecting bin utilization, capacity thresholds, and stock concentration.
- Direct drill-down to bin contents, batch IDs, and unit quantities with one click.

### 2. 📑 Immutable Double-Entry Stock Ledger
- Every inventory modification (Receipt, Delivery, Transfer, Adjustment) writes an immutable record to the `stock_ledger` table.
- Row-level locking (`with_for_update`) prevents race conditions, deadlocks, and negative quantity drift during concurrent warehouse operations.
- Git-like auditability: Inspect exact point-in-time balance trajectories for any SKU across all global locations.

### 3. 🧠 Asynchronous AI & Predictive Intelligence
- **Demand Forecasting Engine:** Analyzes historical velocity to project stockout horizons and calculate optimal Economic Order Quantities (EOQ).
- **Statistical Anomaly Detector:** Flags suspicious shrinkage, excessive count variances, or unauthorized adjustments using Z-score outlier detection.
- **Conversational Ops Copilot:** Powered by Google Gemini to process complex natural-language queries (e.g., *"Which electronics in West Coast Hub are under safety stock?"*).

### 4. 🚚 Distinct Logistics Pipelines
- **Outbound Customer Deliveries:** Dedicated sales fulfillment pipeline (`Draft` $\rightarrow$ `Picking` $\rightarrow$ `Dispatched/Done`), complete with destination tracking, carrier integration, and packing manifests.
- **Internal Transfers:** Multi-facility rebalancing and picking-bay replenishment (`Draft` $\rightarrow$ `In Transit` $\rightarrow$ `Received & Stocked`) with two-sided atomic ledger reconciliation.
- **Inbound Supplier Receipts:** Automated PO intake, line-item verification, and staging allocation.

---

## 🏛️ Architecture & Technology Stack

| Layer | Technologies | Architectural Rationale |
| :--- | :--- | :--- |
| **Client Application** | **React 19, TypeScript, Vite, Tailwind CSS v4** | Sub-millisecond UI state transitions, responsive glassmorphic aesthetic, strict static typing. |
| **Visuals & Charts** | **Recharts, Framer Motion, Lucide Icons** | Hardware-accelerated transitions and real-time telemetry rendering. |
| **Application Server** | **FastAPI, Pydantic v2, Uvicorn, Python 3.11+** | High-concurrency async ASGI server with automated OpenAPI (Swagger) contract generation. |
| **Data Persistence** | **SQLAlchemy ORM, SQLite / PostgreSQL** | ACID compliance, transactional integrity, foreign key constraints, check constraints (`quantity >= 0`). |
| **Generative Intelligence** | **Google Gemini API, scikit-learn, NumPy** | Low-latency inference, context-aware RAG querying, and deterministic statistical fallbacks. |

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js** $\ge$ 18.x
- **Python** $\ge$ 3.10
- **Git**

```bash
# 1. Clone the repository
git clone https://github.com/aarthi04115/StockSense.git
cd StockSense
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate virtual environment
python -m venv .venv
# On Windows: .venv\Scripts\activate | On macOS/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app.main:app --reload --port 8000
```
> 📍 **API Gateway:** `http://localhost:8000`  
> 📖 **Interactive API Documentation:** `http://localhost:8000/docs`

### Database Seeding *(Optional but Recommended)*

In a separate terminal from the root folder:
```bash
python seed.py
```
*Populates warehouses, storage locations, product catalog, sample shipments, transfers, and inventory levels.*

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install package dependencies
npm install

# Launch Vite development server
npm run dev
```
> 💻 **Web Application:** `http://localhost:5173`

---

## 🔍 Core Domain API Specifications

| Method | Endpoint | Description | Lifecycle / Return |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/products/` | Retrieve catalog with live stock aggregations | `200 OK [Product]` |
| `POST` | `/v1/products/` | Create SKU with UOM and reorder thresholds | `201 Created Product` |
| `GET` | `/v1/warehouses/locations` | List physical storage racks and picking bays | `200 OK [Location]` |
| `GET` | `/v1/deliveries/` | List customer outbound orders & fulfillment lines | `200 OK [Delivery]` |
| `POST` | `/v1/deliveries/` | Create customer delivery order with line items | `200 OK Delivery` |
| `POST` | `/v1/deliveries/{id}/pick` | Stage & pick items for outbound shipment | `200 OK {"status": "Picked"}` |
| `POST` | `/v1/deliveries/{id}/validate` | Dispatch order, deduct inventory, record ledger | `200 OK {"status": "Done"}` |
| `GET` | `/v1/transfers/` | List internal movements & routing paths | `200 OK [Transfer]` |
| `POST` | `/v1/transfers/` | Initiate inter-location transfer request | `200 OK Transfer` |
| `POST` | `/v1/transfers/{id}/transit` | Mark stock as departed and In-Transit | `200 OK {"status": "In Transit"}` |
| `POST` | `/v1/transfers/{id}/validate` | Receive goods and balance source/target stocks | `200 OK {"status": "Done"}` |
| `GET` | `/v1/ai/forecasts` | Retrieve ML stockout horizon predictions | `200 OK [AIForecast]` |
| `GET` | `/v1/ai/anomalies` | Audit log scan for abnormal inventory variances | `200 OK [AIAnomalyFlag]` |
| `POST` | `/v1/ai/chat` | Natural language inventory intelligence query | `200 OK {"response": "..."}` |

---

## 🔒 Reliability, Security & Data Integrity

1. **Deterministic Idempotency:** Critical mutation endpoints support `Idempotency-Key` headers to protect against network retries or duplicate warehouse barcode scans.
2. **Concurrency Safety:** Stock mutations execute under transactional row-level locks, eliminating race conditions when multiple warehouse pickers draw from the same bin simultaneously.
3. **Fail-Safe AI Isolation:** Predictive routines and external LLM calls are strictly non-blocking; core inventory operations remain operational even during third-party API interruptions.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
