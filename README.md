# Cross-Domain Software Orchestration Layer

**Adaptive compute orchestration for shared vehicle compute platforms** — dynamically allocates **CPU / GPU / NPU** across mixed-criticality automotive applications based on **priority, functional-safety level (ASIL vs QM), and real-time load**.

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`
