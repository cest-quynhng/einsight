.PHONY: install dev backend frontend scraper clean

install:
	npm install
	npm --prefix scraper install
	npm --prefix frontend install
	cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

dev:
	npm run dev

backend:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

frontend:
	npm --prefix frontend run dev

scraper:
	npm --prefix scraper run dev

clean:
	rm -rf backend/.venv backend/__pycache__ backend/app/__pycache__
	rm -rf frontend/node_modules frontend/dist
	rm -rf scraper/node_modules
	rm -rf node_modules
