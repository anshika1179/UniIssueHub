# UniIssueHub — AI Intelligence Architecture

## Overview

Phase 5 adds AI-assisted intelligence to the complaint management workflow. AI provides **recommendations only** — it never directly modifies complaint state, priority, ownership, or assignments.

## Architecture

```
Complaint Controller (createComplaint)
        ↓ (fire & forget)
AI Service (aiService.js)
        ↓
Local Provider (localProvider.js)
        ↓
AIAnalysis Model (stored in MongoDB)
        ↓
AI Controller (aiController.js)
        ↓
Frontend (AIInsights.jsx)
```

## Provider Abstraction

The AI system uses a provider pattern controlled by the `AI_PROVIDER` environment variable.

| Provider | Status | Description |
|----------|--------|-------------|
| `local` | ✅ Active | Rule-based keyword matching. No external dependencies. |
| `ollama` | 🔜 Future | Local LLM via Ollama API. |
| `openai` | 🔜 Future | OpenAI GPT API. |

The provider is selected in `server/services/ai/aiService.js` via `getProvider()`. Adding a new provider requires implementing the same interface as `localProvider.js`.

### Provider Interface

Each provider must export:

- `categorize(title, description)` → `{ category, confidence, source }`
- `recommendPriority(title, description, category)` → `{ priority, confidence, reason }`
- `analyzeSentiment(title, description)` → `{ sentiment, urgency, confidence }`
- `detectDuplicates(title, description, category, location)` → `{ isDuplicate, confidence, matchedComplaints }`
- `estimateEta(category, priority)` → `{ estimatedHours, confidence, basis }`
- `generateSuggestions(category, priority)` → `{ suggestions: string[] }`

## Features

### 1. Complaint Categorization

- **Method:** Keyword matching against category-specific word lists.
- **Categories:** Uses the existing Complaint model enum (`electricity`, `water`, `internet`, `cleanliness`, `maintenance`, `security`, `food`, `hostel`, `academic`, `other`).
- **Confidence threshold:** Keywords found → 0.85 confidence. Fallback to `other` → 0.50 confidence.
- **Output:** `{ category, confidence, source }`

### 2. Priority Recommendation

- **Method:** Scans text for critical/high-urgency keywords.
- **Priorities:** Uses existing enum (`low`, `medium`, `high`, `critical`).
- **Logic:**
  - Critical words (fire, flood, theft, emergency) → `critical` (0.90)
  - High words (outage, urgent, broken pipe) → `high` (0.80)
  - Default → `medium` (0.70)
- **Output includes reason string** for explainability.

### 3. Sentiment / Urgency Analysis

- **Sentiment:** `positive`, `neutral`, `negative` based on emotional keywords.
- **Urgency:** `low`, `medium`, `high`, `critical` based on urgency indicators.
- **Purpose:** Operational signal for faster triage — not a personal assessment.

### 4. Duplicate Detection

- **Strategy:**
  1. Filter recent complaints by same category (excludes `closed`/`rejected`).
  2. Limit candidates to 10 most recent.
  3. Extract significant words (>4 chars) from the new complaint title.
  4. Count word overlap against each candidate's title + description.
  5. Similarity = matchCount / totalWords.
  6. Threshold: similarity > 0.6 counts as a potential duplicate.
- **Output:** Top 3 matched complaints with similarity scores.
- **Important:** Duplicates are flagged, never auto-rejected.

### 5. ETA / Resolution Estimation

- **Method:** Category-based base hours, adjusted by priority multiplier.
- **Base hours:** electricity=4, water=6, internet=12, security=2, etc.
- **Priority multipliers:** critical=÷4, high=÷2, low=×2, medium=×1.
- **Confidence:** 0.60 (acknowledges this is an estimate, not a guarantee).

### 6. Technical Suggestions

- **Method:** Category-to-suggestions mapping.
- **Safety:** Suggestions are maintenance-appropriate. No hazardous instructions.
- **Purpose:** Guidance for technicians — never auto-executed.

## Data Storage

AI results are stored in a separate `AIAnalysis` model (not embedded in `Complaint`).

This keeps AI recommendations isolated from the authoritative complaint data.

## Fallback Strategy

| Failure | Behavior |
|---------|----------|
| AI service unavailable | Complaint creation succeeds; AI analysis absent. |
| AI timeout | Fire-and-forget; no blocking. |
| Invalid AI output | Mongoose schema validation rejects bad data. |
| Missing API key | Local provider has no key requirement. |
| Unknown provider | Falls back to local provider. |

## Security

- All AI endpoints require authentication (`protect` middleware).
- Students can only access AI analysis for their own complaints.
- Technicians can only access AI analysis for complaints assigned to them.
- Admin/Warden can access any complaint's AI analysis.
- No API keys are committed to source control.
- AI cannot modify complaint status, priority, ownership, or assignments.
- AI-generated content is treated as display-only recommendations.

## Limitations

- The local rule-based provider uses keyword matching, not ML/NLP.
- Duplicate detection uses crude word overlap, not semantic similarity or embeddings.
- ETA estimates are static category/priority lookups, not trained on historical data.
- Suggestions are pre-written templates, not dynamically generated.

## Future Improvements

- Integrate Ollama or OpenAI for natural language understanding.
- Use text embeddings (e.g., sentence-transformers) for semantic duplicate detection.
- Train ETA model on actual historical resolution times.
- Add feedback loop: staff can rate AI recommendations to improve accuracy.
- Cache embeddings for performance.
