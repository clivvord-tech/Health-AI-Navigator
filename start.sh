#!/bin/bash

export DATABASE_URL=postgresql://postgres.nduidpybsctartsnlace:Ji8fF6fGk2vDa6gp@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
export GEMINI_API_KEY=AIzaSyBzuzoT3pN4qQqWVWkhRZINdWO4aYopY8I
export BASE_PATH=/

echo "🚀 Starting RADapp..."

# Start API server in background
PORT=8080 pnpm --filter @workspace/api-server run dev &
API_PID=$!

# Start frontend
PORT=24122 pnpm --filter @workspace/radapp run dev &
FRONTEND_PID=$!

echo "✅ API server running on port 8080"
echo "✅ Frontend running on port 24122"
echo ""
echo "Press Ctrl+C to stop both servers"

# Stop both on exit
trap "kill $API_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
