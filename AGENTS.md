# AGENTS.md – Contributor Guide for Matobo Vet PMS

Welcome to the Matobo Vet Centre Practice Management System (PMS). This is a Django-based veterinary records and billing system with Docker-based setup and manual integration to Palladium accounting.

---

## 🔧 Dev Environment

- Use `docker-compose up --build` to run the app locally.
- All code lives in the `/vet` app directory.
- Core logic is in `models.py`, `views.py`, `admin.py`, `forms.py`, and custom templates in `/templates/admin` or `/templates/`.
- Static JS (e.g., visit_charge.js, tinymce_init.js) is in `/vet/static/js/`.

If Docker is not running, use:
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
