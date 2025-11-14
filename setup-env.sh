#!/bin/bash
echo "Generating .env file..."

cat > .env << EOF
# === OPENAI ===
OPENAI_API_KEY=sk-__________________________

# === RAILWAY ===
DATABASE_URL=postgresql://user:pass@ep-______.neon.tech/db?sslmode=require

# === PINECONE ===
PINECONE_API_KEY=pcsk_____________________
PINECONE_ENV=us-east1-gcp

# === REDIS ===
REDIS_URL=rediss://:pass@us1-______.upstash.io:6379

# === STRIPE ===
STRIPE_SECRET_KEY=sk_test_________________
STRIPE_WEBHOOK_SECRET=whsec________

# === FORGE ===
FORGE_APP_ID=ari:cloud:forge::app/____-____-____-____
EOF

echo ".env created! Now fill in your keys."