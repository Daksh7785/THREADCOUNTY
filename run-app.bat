@echo off
title ThreadCounty Launcher
echo ==============================================
echo 🚀 Launching ThreadCounty Full-Stack Platform...
echo ==============================================

echo 📦 Starting Backend API Server (Port 5000)...
start "ThreadCounty Backend" cmd /k "cd backend && npm run dev"

echo 💻 Starting Frontend React App (Vite dev server)...
start "ThreadCounty Frontend" cmd /k "cd frontend && npm run dev"

echo ==============================================
echo ✅ Both processes are launching in separate windows!
echo ❤️ Backend: http://localhost:5000/health
echo 🌐 Frontend: http://localhost:5173
echo ==============================================
pause
