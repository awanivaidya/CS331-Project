# NLP Service Module

This module analyzes customer communications (emails, meeting notes) to:

1. **Sentiment Scoring** - Converts customer sentiment into a signed numeric score (-1 to +1) and categorizes it into 5 business-friendly levels:
   - `VERY_POSITIVE` (≥0.75)
   - `POSITIVE` (≥0.50)
   - `NEUTRAL` (-0.50 to 0.50)
   - `BAD` (-0.75 to -0.50)
   - `VERY_BAD` (<-0.75)

2. **Task Extraction** - Intelligently extracts staff-actionable tasks from mixed content (long emails containing both feedback/opinions and work requirements). The module:
   - Identifies obligation signals (`must`, `should`, `required`, `please ensure`)
   - Detects action verbs (`provide`, `escalate`, `maintain`, `submit`)
   - Filters out pure feedback/praise ("we are satisfied", "excellent work")
   - Deduplicates similar tasks
   - Flags high-priority/urgent items
   - Extracts deadlines when present

Designed for offline execution after the first model download. Can be called manually via CLI now, or integrated into the Node/Express backend later.

## 1. Environment setup

1. Install Python 3.10+.
2. (Optional but recommended) create a virtual environment.
3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

The first run downloads the transformer models once and caches them locally so
subsequent executions work offline.

## 2. Running the analyzer interactively

```bash
python analyzer.py
```

Paste the email text (mixed feedback + requirements), then press `Ctrl+Z` (Windows) or `Ctrl+D` (macOS/Linux) to finish. The script outputs:
- Sentiment score (numeric, signed)
- Sentiment category (business label)
- High priority task count (if any urgent items)
- Staff tasks (actionable bullet list)

## 3. Running with inline text or JSON output

- Inline text:
  ```bash
  python analyzer.py --text "Customer expects weekly status reports and a 4 hour response window for P1 issues."
  ```
- JSON response for automated tests:

  ```bash
  python analyzer.py --text "..." --json
  ```

Returns structured JSON with `sentiment_score`, `sentiment_category`, `staff_tasks`, and `high_priority_count`.

## 4. Backend Integration

When the Node/Express backend is ready:

```python
from nlpservice.analyzer import NLPService

service = NLPService(offline=True) 
result = service.analyze(customer_email_text)

# result.sentiment_score: float
# result.sentiment_category: str (VERY_POSITIVE | POSITIVE | NEUTRAL | BAD | VERY_BAD)
# result.staff_tasks: List[str]
# result.high_priority_count: int
```

