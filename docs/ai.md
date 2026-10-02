# AI & NLP Architecture

## Overview
The AI/NLP module provides intelligent complaint processing using JavaScript-based NLP libraries. The system uses a combination of rule-based and statistical approaches, all running on the Node.js backend without external AI APIs.

---

## Components

### 1. Auto-Categorization Engine
- **Purpose**: Automatically suggest the complaint category based on title and description text.
- **Approach**:
  - Keyword-based rule engine as the primary method
  - NLP library (`natural` npm package) for tokenization, stemming, and TF-IDF
  - Category keyword dictionaries mapping terms to categories
  - Confidence scoring to determine suggestion reliability
- **Categories**:
  - `infrastructure`
  - `academic`
  - `hostel`
  - `mess/canteen`
  - `library`
  - `IT services`
  - `transport`
  - `administrative`
  - `ragging/harassment`
  - `other`
- **Fallback**: If confidence is below threshold, mark as `other` and flag for manual review.

### 2. Priority Detection via Sentiment Analysis
- **Purpose**: Detect urgency and severity from complaint text.
- **Approach**:
  - Sentiment analysis using `natural` SentimentAnalyzer or `sentiment` npm package
  - Urgency keyword detection (e.g., `emergency`, `urgent`, `dangerous`, `immediately`)
  - Safety-related keyword boosting for higher priority
  - Combined scoring: sentiment score + urgency keywords + safety keywords → suggested priority
- **Priority Mapping**:
  - **Critical**: Safety-related keywords + very negative sentiment
  - **High**: Urgency keywords + negative sentiment
  - **Medium**: Moderate negativity or neutral sentiment
  - **Low**: General feedback, suggestions, or positive/neutral inquiries

### 3. Duplicate Detection
- **Purpose**: Identify potentially duplicate or similar complaints.
- **Approach**:
  - TF-IDF vectorization of complaint text using `natural`
  - Cosine similarity comparison against recent complaints (last 30 days)
  - Threshold-based matching (e.g., similarity > 0.7 = potential duplicate)
  - Same-category and same-department filtering to narrow search
- **Output**: List of similar complaint IDs with corresponding similarity scores.

### 4. Smart Suggestions
- **Purpose**: Show previously resolved similar complaints as reference.
- **Approach**:
  - When a user submits a complaint, search resolved complaints with similar keywords
  - Use TF-IDF similarity matching
  - Return top 3–5 similar resolved complaints with their resolution notes
  - Helps users find existing solutions before submitting
- **Output**: Ranked list of relevant resolved complaints with summaries and resolution steps.

### 5. Trend Analysis
- **Purpose**: Identify patterns, recurring bottlenecks, and anomalies in complaint data.
- **Approach**:
  - Time-series analysis of complaint volume grouped by category and department
  - Moving average calculations to detect spikes over defined time windows
  - Anomaly detection rule: if complaints in a category exceed 2x the moving average, flag as an anomaly
  - Weekly and monthly trend reports generated for administrator dashboards

---

## NLP Libraries

| Library | Purpose |
|---|---|
| `natural` | Tokenization, stemming, TF-IDF, Naive Bayes classifier, sentiment analysis |
| `compromise` | Part-of-speech tagging, entity extraction |
| `sentiment` | Lexicon-based sentiment analysis (alternative/complement to `natural`) |
| `stopword` | Stop word removal for text preprocessing |

---

## AI Service Architecture

```
Complaint Input (title + description)
         ↓
   Text Preprocessing
   (tokenize, lowercase, remove stopwords, stem)
         ↓
   ┌─────────────────────────────────┐
   │         Parallel Processing     │
   │                                 │
   │  ┌─────────────┐  ┌──────────┐ │
   │  │Categorization│  │Sentiment │ │
   │  │  Engine      │  │Analysis  │ │
   │  └──────┬──────┘  └─────┬────┘ │
   │         │               │      │
   │  ┌──────┴──────┐  ┌─────┴────┐ │
   │  │  Duplicate   │  │Priority  │ │
   │  │  Detection   │  │Detection │ │
   │  └──────┬──────┘  └─────┬────┘ │
   │         │               │      │
   │  ┌──────┴──────┐        │      │
   │  │   Smart     │        │      │
   │  │ Suggestions │        │      │
   │  └─────────────┘        │      │
   └─────────────────────────┘      │
         ↓                          │
   AI Metadata Object               │
   (stored with complaint)          ↓
```

---

## Processing Flow

1. **Submission**: User submits a complaint with title and description.
2. **Handoff**: Backend receives complaint data and passes raw text to the AI service.
3. **Preprocessing**: AI service tokenizes text, converts to lowercase, eliminates stop words, and applies stemming.
4. **Categorization**: Categorization engine calculates category scores and suggests a category with a confidence metric.
5. **Sentiment & Priority**: Sentiment analyzer evaluates emotional valence and urgency keywords to suggest a priority level (`Critical`, `High`, `Medium`, `Low`).
6. **Duplicate Check**: Duplicate detector computes cosine similarity against recent active issues to locate duplicates.
7. **Smart Suggestions**: Suggestion engine searches resolved issues for matches to provide self-help reference answers.
8. **Metadata Storage**: All analysis results are consolidated and saved in the complaint's `aiMetadata` field.
9. **Auto-Assignment**: If auto-categorization confidence exceeds the defined threshold, category is automatically assigned.
10. **Duplicate Notification**: If a potential duplicate is detected above threshold, the user and admins are alerted with links to the existing complaint.

---

## Configuration

| Setting | Default Value | Description |
|---|---|---|
| `CATEGORIZATION_CONFIDENCE_THRESHOLD` | `0.6` | Minimum confidence score required to auto-assign category |
| `DUPLICATE_SIMILARITY_THRESHOLD` | `0.7` | Cosine similarity cutoff to flag complaints as duplicates |
| `SIMILAR_SEARCH_WINDOW_DAYS` | `30` | Time horizon (in days) to check for duplicate complaints |
| `MAX_SUGGESTIONS_COUNT` | `5` | Maximum number of similar resolved complaints to return |

---

## Limitations & Future Enhancements

- **Current Limitations**:
  - Current implementation relies primarily on keyword matching and dictionary lookups, which may struggle with misspellings or campus-specific colloquialisms.
  - TF-IDF and keyword-based approaches do not fully capture semantic context compared to transformer models.
- **Future Enhancements**:
  - **Trained Classifiers**: Train a Naive Bayes or SVM classifier on historical campus complaint datasets for higher classification accuracy.
  - **External NLP Integration**: Optional integration with cloud NLP APIs (e.g., Google Cloud Natural Language, OpenAI) for complex multilingual complaints and advanced semantic matching.
  - **Adaptive Feedback Loop**: Track administrator category and priority reassignments to dynamically refine keyword weights and improve model accuracy over time.
