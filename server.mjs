import express from 'express';
import cors from 'cors';
import {
    createAgentSession,
    AuthStorage,
    ModelRegistry,
    SessionManager,
    DefaultResourceLoader,
} from '@mariozechner/pi-coding-agent';
import { getModel } from '@mariozechner/pi-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.AGENT_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const authStorage = new AuthStorage();
const modelRegistry = new ModelRegistry(authStorage);

// Set API keys from environment
if (process.env.ANTHROPIC_API_KEY) {
    authStorage.setRuntimeApiKey('anthropic', process.env.ANTHROPIC_API_KEY);
}
if (process.env.OPENAI_API_KEY) {
    authStorage.setRuntimeApiKey('openai', process.env.OPENAI_API_KEY);
}

// Store active sessions per user (in production, use Redis or similar)
const userSessions = new Map();

// Get or create a user-specific session
async function getOrCreateSession(userId, model, loader, authStorage, modelRegistry) {
    if (userSessions.has(userId)) {
        return userSessions.get(userId);
    }

    const { session } = await createAgentSession({
        model,
        resourceLoader: loader,
        sessionManager: SessionManager.inMemory(),
        cwd: process.cwd() + '/chat-knowledge',
        authStorage,
        modelRegistry,
    });

    userSessions.set(userId, session);
    return session;
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/chat', async (req, res) => {
    try {
        const { prompt, streaming = true, userId = 'default' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get available model
        let model = getModel('openai', 'gpt-4o');

        if (!model) {
            const available = await modelRegistry.getAvailable();
            if (available.length > 0) {
                model = available[0];
            }
        }

        if (!model) {
            // Try to use environment variables directly
            if (process.env.OPENAI_API_KEY) {
                model = getModel('openai', 'gpt-4o');
            } else if (process.env.ANTHROPIC_API_KEY) {
                model = getModel('anthropic', 'claude-3-5-sonnet-20240620');
            }
        }

        if (!model) {
            return res.status(500).json({
                error: 'No model available. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.'
            });
        }

        const loader = new DefaultResourceLoader({
            systemPromptOverride: () => `# 🎨 You are FlashBuild AI - A Data-Driven Concept to UI/UX Creator

## Your Core Identity
You are FlashBuild AI, a specialized agent that transforms raw data into stunning, interactive UI concepts. Your superpower is analyzing the user's private data (CSV files) to propose creative application concepts and immediately bringing them to life through beautiful web interfaces.

## 🔒 CRITICAL: Data Privacy & File Handling
- **Access**: You have access to the user's data in the \`chat-knowledge\` folder.
- **Internal Use**: You MUST read the CSV file names and contents to understand what data is available (e.g., "Customer Support.csv" tells you there is support data).
- **User Communication**: You must **NEVER** disclose the specific file names or raw folder structure to the user.
  - ✅ Say: "I have access to your customer support and sales data."
  - ✅ Say: "I see you have user research data available."
  - ❌ Don't say: "I see a file called 'Customer Support (Intercom Zendesk).csv'."
  - ❌ Don't say: "I am reading from the chat-knowledge folder."

## Your Workflow: Concept -> Discussion -> FlashBuild

### Step 1: Analyze & Propose (The "Concept" Phase)
- **Action**: silently run \`ls\` to see available CSVs.
- **Action**: silently run \`read\` on relevant CSVs to understand the *nature* of the data (columns, types of records).
- **Goal**: Generate creative app ideas based on this data.
- **Interaction**: "I see you have data regarding [Data Type]. We could build:
  1. A [Concept A] to visualize trends...
  2. A [Concept B] to manage tickets...
  Which one would you like to see?"

### Step 2: FlashBuild (The "UI" Phase)
- **Constraint**: You must create a **STUNNING** single-file HTML preview.
- **Action**: Write the complete HTML/CSS/JS code to \`preview_\${userId}.html\`.
- **Design Ops**:
  - Use **modern CSS** (Glassmorphism, Gradients, Tailwind-like utility classes in <style>).
  - Make it **interactive** (hover states, clickable elements, mock charts).
  - Use **animation** (entry animations, smooth interactions).

## Your Personality
- **Insightful**: You don't just read data; you understand its potential for product features.
- **Visual Thinker**: You describe ideas in terms of UI components ("a sweeping timeline," "interactive cards").
- **Discreet**: You handle data references naturally ("your sales figures") rather than technically ("rows in the csv").
- **Enthusiastic builder**: You love going from "raw csv" to "beautiful dashboard" in seconds.

## Working with Tools
- **Files**: All data is in CSV format. All UIs are HTML.
- **Output**: ALWAYS write your UI code to \`preview_\${userId}.html\`.
- **Process**:
  1. \`ls\` (to find data)
  2. \`read\` (to understand data)
  3. **Think** (come up with a concept)
  4. **Chat** (pitch the concept)
  5. \`write\` (build the UI)

## HTML Template Structure
Every preview.html should follow this structure:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlashBuild Concept</title>
    <style>
        /* Modern CSS here */
        :root { --primary: #6366f1; --surface: #ffffff; }
        body { font-family: 'Inter', sans-serif; background: #f8fafc; }
    </style>
</head>
<body>
    <div id="app"></div>
    <script>
        // Interactive Logic here
    </script>
</body>
</html>
\`\`\`

Start every session by checking what data you have, but remember: **Talk about the *insights* and *concepts*, not the *files*.**`,
        });

        await loader.reload();

        // Get or create persistent session for this user
        const session = await getOrCreateSession(userId, model, loader, authStorage, modelRegistry);

        if (streaming) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');

            session.subscribe((event) => {
                try {
                    res.write(JSON.stringify(event) + '\n');
                } catch (e) {
                    console.error('Error writing event:', e);
                }
            });

            try {
                await session.prompt(prompt);
                res.end();
            } catch (error) {
                console.error('Agent Session Error:', error);
                res.write(JSON.stringify({
                    type: 'error',
                    error: error.message
                }) + '\n');
                res.end();
            }
        } else {
            await session.prompt(prompt);
            res.json({ messages: session.state.messages });
        }
    } catch (error) {
        console.error('API Route Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reset session endpoint
app.post('/reset', (req, res) => {
    const { userId = 'default' } = req.body;
    userSessions.delete(userId);
    res.json({ message: `Session reset successfully for user: ${userId}` });
});

app.listen(PORT, () => {
    console.log(`🤖 AI Agent Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
