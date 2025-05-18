#!/bin/zsh

echo "Checking if n8n is running..."
if ! curl -s --head http://localhost:5678 > /dev/null; then
  echo "n8n not running. Starting n8n in the background..."
  n8n start > /dev/null 2>&1 &
  N8N_PID=$!
  echo "n8n started with PID $N8N_PID"
else
  echo "n8n is already running."
fi

echo "Checking if cloudflared tunnel is running..."
if ! pgrep -f "cloudflared tunnel --protocol http2 run 7bc7c098-18b0-4705-b108-1899d7d2a494" > /dev/null; then
  echo "Cloudflared tunnel not running. Starting tunnel in the background..."
  cloudflared tunnel --protocol http2 run 7bc7c098-18b0-4705-b108-1899d7d2a494 > /dev/null 2>&1 &
  CLOUDFLARED_PID=$!
  echo "Cloudflared tunnel started with PID $CLOUDFLARED_PID"
else
  echo "Cloudflared tunnel is already running."
fi

echo "Setup complete. n8n should be accessible via https://n8n.confersolutions.ai"
