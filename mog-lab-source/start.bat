@echo off
cd /d "%~dp0"
echo Starting MOG LAB at http://localhost:8000  (close this window to stop)
start "" http://localhost:8000/
python -m http.server 8000 || py -m http.server 8000 || (echo Python not found. Install it from python.org, then run this again. & pause)
