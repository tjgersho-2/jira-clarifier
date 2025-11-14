# Jira Ticket Clarifier – README.md

AI-powered Micro-SaaS that turns vague Jira tickets into crystal-clear acceptance criteria, edge cases, and success metrics.
Built with Grok-generated data → fine-tuned OpenAI model → production stack in <4 hours.Status: MVP Live in 30 Minutesbash

git clone https://github.com/yourname/jira-clarifier.git
cd jira-clarifier
# Follow steps below → $15/user/mo SaaS

What You’ll Build (In 7 Days)Day
Outcome
1
Backend API live on Railway
2
Fine-tuned model + RAG (Pinecone)
3
Jira “Clarify” button (Atlassian Forge)
4
Stripe billing + user dashboard
5
First 10 beta users
6
$1k MRR path
7
Moat locked (data flywheel)

Prerequisites (Manual Human Steps)You must do these manually — no automation yet.
#
Action
Link
Notes
1
Create OpenAI account + API key
platform.openai.com
Add $5 credit → fine-tuning enabled
2
Create Railway account
railway.app
Connect GitHub
3
Create Neon (Postgres)
neon.tech
Free tier → copy connection string
4
Create Pinecone account
pinecone.io
Free → create index jira-vectors (1536 dim)
5
Create Upstash Redis
upstash.com
Serverless → copy URL
6
Create Stripe account
dashboard.stripe.com
Test mode → get sk_test_...
7
Create Atlassian Developer account
developer.atlassian.com
For Forge app
8
Create Vercel account
vercel.com
For dashboard
9
Create Clerk account (optional)
clerk.com
For SSO later

One-Click Setup ScriptsRun these in order after signing up for accounts.
1. setup-env.sh – Generate .envbash

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

Run:bash

chmod +x setup-env.sh
./setup-env.sh
# → Edit .env with your real keys

2. init-pinecone.sh – Create Index + Upload 50 Ticketsbash

#!/bin/bash
echo "Initializing Pinecone index..."

pip install pinecone-client sentence-transformers openai python-dotenv

python -c '
import os, json, dotenv, openai
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
dotenv.load_dotenv()

# Init
openai.api_key = os.getenv("OPENAI_API_KEY")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("jira-vectors")

# Embed model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load 50 tickets
with open("jira_clarify_50.jsonl") as f:
    tickets = [json.loads(line) for line in f]

vectors = []
for i, t in enumerate(tickets):
    text = f"{t["raw_title"]} {t["raw_description"]}"
    emb = model.encode(text).tolist()
    vectors.append({
        "id": f"ticket-{i}",
        "values": emb,
        "metadata": {"title": t["raw_title"], "desc": t["raw_description"]}
    })

# Upsert
index.upsert(vectors=vectors)
print(f"Uploaded {len(vectors)} vectors to Pinecone")
'
echo "Pinecone ready!"

Run:bash

chmod +x init-pinecone.sh
./init-pinecone.sh

3. fine-tune.sh – Train Your Moat Modelbash

#!/bin/bash
echo "Fine-tuning gpt-4o-mini on your 50 Jira tickets..."

python -c '
import openai, os, json, dotenv, time
dotenv.load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Upload
with open("jira_fine_tune.jsonl", "rb") as f:
    file = openai.files.create(file=f, purpose="fine-tune")

# Train
job = openai.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-4o-mini-2024-07-18",
    suffix="jira-clarify-v1",
    hyperparameters={"n_epochs": 3}
)

print(f"Training started: {job.id}")
print("Check: https://platform.openai.com/fine-tuning")
'

Run:bash

chmod +x fine-tune.sh
./fine-tune.sh
# → Wait 10–20 min → model: `ft:gpt-4o-mini:...:jira-clarify-v1`

4. deploy-railway.sh – Deploy APIbash

#!/bin/bash
echo "Deploying to Railway..."

# Ensure requirements
cat > requirements.txt << EOF
fastapi
uvicorn[standard]
openai
pinecone-client
psycopg2-binary
redis
stripe
pydantic
python-dotenv
sentence-transformers
EOF

# Deploy
railway up

Run:bash

chmod +x deploy-railway.sh
./deploy-railway.sh
# → Get URL: https://jira-clarifier.up.railway.app

5. setup-forge.sh – Create Jira Appbash

#!/bin/bash
echo "Setting up Atlassian Forge app..."

npm install -g @forge/cli
forge create
# → Name: "Jira Clarifier"
# → Template: "Jira issue panel"

echo "Now edit modules/clarify-button.jsx → see code below"

Then paste this into modules/clarify-button.jsx:jsx

import ForgeUI, { Button, useProductContext, useState } from '@forge/ui';
import api, { route } from "@forge/api";

export const ClarifyButton = () => {
  const { issueKey } = useProductContext();
  const [isLoading, setLoading] = useState(false);

  const clarify = async () => {
    setLoading(true);
    const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`);
    const issue = await res.json();
    const title = issue.fields.summary;
    const desc = issue.fields.description?.content?.[0]?.content?.[0]?.text || "";

    const response = await fetch("https://jira-clarifier.up.railway.app/clarify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc })
    });
    const data = await response.json();

    // Show in panel
    await api.asApp().invoke("showResult", data);
    setLoading(false);
  };

  return <Button text={isLoading ? "Clarifying..." : "Clarify Ticket"} onClick={clarify} />;
};

Deploy Forge:bash

forge deploy
forge install

Project Structure

jira-clarifier/
├── .env                    # ← Fill this
├── main.py                 # FastAPI backend
├── jira_clarify_50.jsonl   # 50 training tickets
├── jira_fine_tune.jsonl    # Chat format for OpenAI
├── requirements.txt
├── forge/                  # Atlassian app
├── web/                    # Vercel dashboard
└── scripts/
    ├── setup-env.sh
    ├── init-pinecone.sh
    ├── fine-tune.sh
    ├── deploy-railway.sh
    └── setup-forge.sh

Manual Post-Deploy TasksTask
How
Add Stripe webhook
Dashboard → Webhooks → Add endpoint: https://your-api.up.railway.app/webhook
Set up billing page
Copy web/pricing.html → deploy to Vercel
Get first users
Post in: r/jira, IndieHackers, your team Slack
Collect real tickets
Log every /clarify call → append to jira_fine_tune.jsonl → retrain weekly

Moat Flywheel (Your $1M Edge)mermaid

graph LR
  A[User clicks "Clarify"] --> B[API calls fine-tuned model]
  B --> C[Result shown in Jira]
  C --> D[User upvotes clarity]
  D --> E[Log ticket + score]
  E --> F[Retrain model weekly]
  F --> B

Run Everything (Full Sequence)bash

# 1. Setup
./scripts/setup-env.sh
# → Fill .env with real keys

# 2. Init vector DB
./scripts/init-pinecone.sh

# 3. Train model
./scripts/fine-tune.sh
# → Wait for ft:gpt-4o-mini:...:jira-clarify-v1

# 4. Deploy API
./scripts/deploy-railway.sh

# 5. Launch Jira app
./scripts/setup-forge.sh
forge deploy && forge install

# 6. Go live
echo "LIVE: https://your-app.up.railway.app"
echo "Jira App: Installed in your workspace"

Next Steps (After Launch)Goal
Action
$1k MRR
67 Pro users @ $15/mo
$10k MRR
Add Enterprise SSO + SOC2
$100k MRR
Vertical: FinServ, Healthcare, Gov

