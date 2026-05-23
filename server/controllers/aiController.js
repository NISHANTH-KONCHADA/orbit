const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Issue = require('../models/Issue');
const Project = require('../models/Project');

// ── Multi-key rotation setup ──────────────────────────────────────────────────
// Collects all GEMINI_KEY_* from .env, falls back to GEMINI_API_KEY
const API_KEYS = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3,
  process.env.GEMINI_API_KEY, // legacy fallback
].filter(Boolean); // remove undefined/empty

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

let currentKeyIndex = 0; // tracks which key is active

const getNextKeyIndex = (from) => (from + 1) % API_KEYS.length;

// isQuotaError — returns true for 429 / quota / not-found errors worth retrying
const isRetryableError = (err) => {
  const msg = (err.message || '').toLowerCase();
  return msg.includes('429') || msg.includes('quota') || msg.includes('rate') ||
         msg.includes('404') || msg.includes('not found');
};

/**
 * generateWithRotation
 * Tries every (key × model) combination until one succeeds.
 * On a quota/rate-limit error it rotates to the next key immediately.
 * Logs which key+model is being used to the console.
 */
const generateWithRotation = async (buildRequest) => {
  const totalKeys = API_KEYS.length;
  let attempts = 0;
  let keyIdx = currentKeyIndex;

  while (attempts < totalKeys * MODELS.length) {
    const key = API_KEYS[keyIdx];
    for (const modelName of MODELS) {
      attempts++;
      try {
        console.log(`🤖 AI: trying key #${keyIdx + 1} / model ${modelName}`);
        const genAI = new GoogleGenerativeAI(key);
        const result = await buildRequest(genAI, modelName);
        // Success — remember this key as the current good one
        currentKeyIndex = keyIdx;
        console.log(`✅ AI: success with key #${keyIdx + 1} / ${modelName}`);
        return result;
      } catch (err) {
        console.warn(`⚠️  AI key #${keyIdx + 1} / ${modelName} failed: ${err.message?.slice(0, 80)}`);
        if (!isRetryableError(err)) throw err; // non-quota errors bubble up immediately
        // Otherwise try next model, then next key
      }
    }
    // All models on this key exhausted — rotate key
    keyIdx = getNextKeyIndex(keyIdx);
  }

  throw new Error('All Gemini API keys have exceeded their quota. Please try again in a few minutes.');
};

// ── Helper: safe JSON parse ───────────────────────────────────────────────────
const parseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

// ── @POST /api/ai/generate-task ───────────────────────────────────────────────
const generateTask = asyncHandler(async (req, res) => {
  const { title, projectId } = req.body;
  if (!title) { res.status(400); throw new Error('Task title is required'); }

  let projectContext = '';
  if (projectId) {
    const proj = await Project.findById(projectId).select('name description');
    if (proj) projectContext = `Project: ${proj.name}. ${proj.description}`;
  }

  const prompt = `Generate a professional task description for a software project.

Task title: "${title}"
Project type: Web application (MERN Stack)
${projectContext ? `Project context: ${projectContext}` : ''}

Return a JSON object with exactly these fields:
{
  "description": "2-3 sentence clear description of what needs to be done",
  "acceptanceCriteria": ["criterion 1", "criterion 2", "criterion 3"],
  "suggestedPriority": "low|medium|high|critical",
  "suggestedLabels": ["label1", "label2"],
  "estimatedHours": number
}

Only return valid JSON. No extra text. No markdown code fences.`;

  const text = await generateWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });

  const parsed = parseJSON(text);
  if (!parsed) { res.status(500); throw new Error('AI returned invalid JSON — please try again'); }
  res.json({ success: true, data: parsed });
});

// ── @POST /api/ai/chat ────────────────────────────────────────────────────────
const chat = asyncHandler(async (req, res) => {
  const { message, projectId, history = [] } = req.body;
  if (!message) { res.status(400); throw new Error('Message is required'); }

  let projectContext = '';
  if (projectId) {
    const proj = await Project.findById(projectId).populate('members.user', 'name role');
    const issues = await Issue.find({ project: projectId })
      .select('title status priority assignee type')
      .populate('assignee', 'name')
      .limit(50);

    const stats = {
      total: issues.length,
      done: issues.filter((i) => i.status === 'done').length,
      inProgress: issues.filter((i) => i.status === 'in-progress').length,
      backlog: issues.filter((i) => i.status === 'backlog').length,
      critical: issues.filter((i) => i.priority === 'critical').length,
    };

    const memberNames = proj.members.map((m) => `${m.user?.name} (${m.role})`).join(', ');
    projectContext = `
Current project: ${proj.name} | Sprint: ${proj.currentSprint?.name}
Issues: ${stats.total} total | ${stats.done} done | ${stats.inProgress} in-progress | ${stats.backlog} backlog | ${stats.critical} critical
Team: ${memberNames}
Recent: ${issues.slice(0, 10).map((i) => `${i.title} [${i.status}/${i.priority}]`).join(', ')}`;
  }

  const systemPrompt = `You are Orbit AI, a project management assistant for a Jira-like tool called Orbit.
You help developers manage tasks, write descriptions, summarize sprints, and identify blockers.
${projectContext}
Rules: Be concise. Use bullet points. Keep responses under 200 words unless writing a detailed report.`;

  const reply = await generateWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });
    const chatSession = model.startChat({
      history: history.map((h) => ({ role: h.role, parts: [{ text: h.content }] })),
    });
    const result = await chatSession.sendMessage(message);
    return result.response.text();
  });

  res.json({ success: true, reply });
});

// ── @POST /api/ai/sprint-summary ─────────────────────────────────────────────
const sprintSummary = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) { res.status(400); throw new Error('projectId is required'); }

  const project = await Project.findById(projectId).select('name currentSprint');
  if (!project) { res.status(404); throw new Error('Project not found'); }

  const issues = await Issue.find({ project: projectId })
    .select('title status priority type assignee dueDate')
    .populate('assignee', 'name');

  const issueData = issues.map((i) => ({
    title: i.title,
    status: i.status,
    priority: i.priority,
    type: i.type,
    assignee: i.assignee?.name || 'Unassigned',
    overdue: i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'done',
  }));

  const prompt = `Analyze this sprint data and write a concise summary report.

Project: ${project.name}
Sprint: ${project.currentSprint?.name}
Issues: ${JSON.stringify(issueData)}

Write a report with:
1. Overall progress (1 sentence with percentages)
2. Key completions (bullet list, max 3)
3. Blockers identified (critical or overdue issues)
4. Recommendation for next sprint (1 sentence)

Keep it under 200 words. Be direct. Use markdown formatting.`;

  const summary = await generateWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });

  res.json({ success: true, summary });
});

// ── @POST /api/ai/auto-label ──────────────────────────────────────────────────
const autoLabel = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description) { res.status(400); throw new Error('Description is required'); }

  const prompt = `Given this bug/feature description, suggest 2-4 labels.
Description: "${description}"
Return JSON: { "labels": ["label1", "label2"] }
Label examples: bug, frontend, backend, api, auth, ui, performance, database, critical, design, testing
Only return valid JSON.`;

  const text = await generateWithRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });

  const parsed = parseJSON(text);
  res.json({ success: true, labels: parsed?.labels || [] });
});

// ── @GET /api/ai/status ───────────────────────────────────────────────────────
// Shows which key is currently active (useful for debugging)
const keyStatus = asyncHandler(async (req, res) => {
  res.json({
    totalKeys: API_KEYS.length,
    activeKeyIndex: currentKeyIndex + 1,
    models: MODELS,
  });
});

module.exports = { generateTask, chat, sprintSummary, autoLabel, keyStatus };
