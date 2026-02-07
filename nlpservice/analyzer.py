from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import dataclass, asdict
from typing import List, Set, Tuple
from difflib import SequenceMatcher

from transformers import (
    pipeline,
    AutoTokenizer,
    AutoModelForSequenceClassification,
)

# -------------------- CONFIG --------------------

SENTIMENT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"
MAX_SENTIMENT_TOKENS = 512 

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z])")

ACTION_KEYWORDS = {
    "must", "should", "shall", "need to", "have to", "needs to", "required to",
    "required", "expected", "expect", "expecting", "anticipate",
    "ensure", "provide", "deliver", "submit", "send", "share",
    "respond", "reply", "resolve", "fix", "address", "handle",
    "update", "inform", "notify", "communicate", "report",
    "escalate", "prioritize", "complete", "finish", "implement",
    "monitor", "track", "review", "check", "verify", "confirm",
    "acknowledge", "maintain", "follow up", "followup",
    "schedule", "plan", "prepare", "arrange", "coordinate",
    "document", "record", "log", "note",
}

PRIORITY_KEYWORDS = {
    "urgent", "asap", "immediately", "critical", "high priority",
    "as soon as possible", "priority", "important", "essential",
}

FILLER_PREFIXES = (
    "it is important that",
    "it is essential that",
    "it is critical that",
    "we expect that",
    "we expect",
    "please ensure that",
    "please make sure that",
    "it would be beneficial to",
    "it would be helpful to",
    "we would like to",
    "we would appreciate if",
    "kindly",
    "please",
)

SIMILARITY_THRESHOLD = 0.85  
# -------------------- DATA MODEL --------------------

@dataclass
class AnalysisResult:
    sentiment_score: float
    sentiment_category: str
    staff_tasks: List[str]
    high_priority_count: int = 0

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2)


# -------------------- SENTIMENT --------------------

def signed_sentiment(label: str, score: float) -> float:
    """
    Convert POSITIVE / NEGATIVE into signed numeric score.
    """
    return score if label == "POSITIVE" else -score


def categorize_sentiment(score: float) -> str:
    """
    Map numeric score to 5 business categories.
    """
    if score >= 0.75:
        return "VERY_POSITIVE"
    if score >= 0.35:
        return "POSITIVE"
    if score > -0.35:
        return "NEUTRAL"
    if score > -0.75:
        return "BAD"
    return "VERY_BAD"


# -------------------- TASK EXTRACTION --------------------

def text_similarity(a: str, b: str) -> float:
    """Calculate similarity ratio between two strings."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def normalize_sentence(sentence: str) -> str:
    """
    Light rephrasing: remove filler phrases, extra whitespace, and normalize punctuation.
    """
    # Remove filler prefixes
    lowered = sentence.lower().strip()
    for prefix in FILLER_PREFIXES:
        if lowered.startswith(prefix):
            sentence = sentence[len(prefix):].strip()
            lowered = sentence.lower()
    
    # Capitalize first letter
    if sentence:
        sentence = sentence[0].upper() + sentence[1:]
    
    # Normalize whitespace
    sentence = re.sub(r"\s+", " ", sentence)
    
    # Remove trailing period (we'll add it back consistently)
    sentence = sentence.rstrip(".,;:")
    
    return sentence


def is_action_sentence(sentence: str) -> bool:
    """Check if sentence contains action keywords."""
    lowered = sentence.lower()
    return any(keyword in lowered for keyword in ACTION_KEYWORDS)


def has_priority_marker(sentence: str) -> bool:
    """Check if sentence contains urgency/priority indicators."""
    lowered = sentence.lower()
    return any(keyword in lowered for keyword in PRIORITY_KEYWORDS)


def deduplicate_tasks(tasks: List[Tuple[str, bool]]) -> List[Tuple[str, bool]]:
    """Remove near-duplicate tasks based on semantic similarity."""
    if not tasks:
        return []
    
    unique_tasks = [tasks[0]]
    
    for task, priority in tasks[1:]:
        is_duplicate = False
        for existing_task, _ in unique_tasks:
            if text_similarity(task, existing_task) > SIMILARITY_THRESHOLD:
                is_duplicate = True
                break
        
        if not is_duplicate:
            unique_tasks.append((task, priority))
    
    return unique_tasks


def extract_staff_tasks(text: str) -> Tuple[List[str], int]:
    """
    Extract ONLY staff-actionable tasks from mixed content.
    Returns: (task_list, high_priority_count)
    """
    if not text or not text.strip():
        return (["- Follow standard project responsibilities as defined.",
                 "- Review any additional requirements or constraints if applicable."], 0)
    
    # Split into sentences more carefully
    sentences = SENTENCE_SPLIT.split(text)
    raw_tasks: List[Tuple[str, bool]] = []

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence or len(sentence) < 10:  # Skip very short fragments
            continue

        if is_action_sentence(sentence):
            clean = normalize_sentence(sentence)
            
            # Skip if too short after normalization
            if len(clean) < 5:
                continue
            
            is_priority = has_priority_marker(sentence)
            raw_tasks.append((clean, is_priority))

    # Deduplicate similar tasks
    unique_tasks = deduplicate_tasks(raw_tasks)
    
    # Sort: priority tasks first, then regular tasks
    unique_tasks.sort(key=lambda x: (not x[1], x[0]))
    
    # Count high priority items
    priority_count = sum(1 for _, is_priority in unique_tasks if is_priority)
    
    # Format output
    formatted_tasks = []
    for task, is_priority in unique_tasks:
        prefix = "- [HIGH PRIORITY] " if is_priority else "- "
        formatted_tasks.append(f"{prefix}{task}.")
    
    # Add default tasks if none found
    if not formatted_tasks:
        formatted_tasks.append("- Follow standard project responsibilities as defined.")
    
    formatted_tasks.append("- Review any additional requirements or constraints if applicable.")

    return formatted_tasks, priority_count


# -------------------- NLP SERVICE --------------------

class NLPService:
    def __init__(self, offline: bool = False):
        self.tokenizer = AutoTokenizer.from_pretrained(
            SENTIMENT_MODEL,
            local_files_only=offline,
        )
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model=AutoModelForSequenceClassification.from_pretrained(
                SENTIMENT_MODEL,
                local_files_only=offline,
            ),
            tokenizer=self.tokenizer,
        )

    def _truncate_for_sentiment(self, text: str) -> str:
        """Truncate text to fit model's token limit, preserving beginning and end."""
        tokens = self.tokenizer.encode(text, add_special_tokens=False)
        
        if len(tokens) <= MAX_SENTIMENT_TOKENS - 2:  # Account for special tokens
            return text
        
        # Keep first 60% and last 40% to capture both intro and conclusions
        first_part_len = int((MAX_SENTIMENT_TOKENS - 2) * 0.6)
        last_part_len = (MAX_SENTIMENT_TOKENS - 2) - first_part_len
        
        truncated_tokens = tokens[:first_part_len] + tokens[-last_part_len:]
        return self.tokenizer.decode(truncated_tokens, skip_special_tokens=True)

    def analyze(self, text: str) -> AnalysisResult:
        """
        Analyze email text for sentiment and actionable tasks.
        
        Args:
            text: Raw email content (mixed feedback + requirements)
            
        Returns:
            AnalysisResult with sentiment score, category, tasks, and priority count
            
        Raises:
            ValueError: If text is empty or invalid
        """
        if not text or not text.strip():
            raise ValueError("Input text must not be empty.")

        # Truncate for sentiment analysis if needed
        truncated_text = self._truncate_for_sentiment(text)
        
        try:
            raw = self.sentiment_pipeline(truncated_text)[0]
        except Exception as e:
            raise RuntimeError(f"Sentiment analysis failed: {e}") from e

        numeric_score = signed_sentiment(
            raw["label"],
            float(raw["score"]),
        )

        category = categorize_sentiment(numeric_score)
        
        # Task extraction uses full text (no truncation)
        tasks, priority_count = extract_staff_tasks(text)

        return AnalysisResult(
            sentiment_score=round(numeric_score, 4),
            sentiment_category=category,
            staff_tasks=tasks,
            high_priority_count=priority_count,
        )


# -------------------- CLI --------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Analyze long mixed emails to extract staff tasks and sentiment."
    )
    parser.add_argument(
        "--text",
        type=str,
        help="Inline email text. If omitted, input is read from stdin.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output JSON instead of formatted text.",
    )
    parser.add_argument(
        "--offline",
        action="store_true",
        help="Run offline (models must be cached locally).",
    )
    return parser.parse_args()


def read_from_stdin() -> str:
    print("Paste email text. End with Ctrl+D (Linux/macOS) or Ctrl+Z (Windows):")
    lines = []
    try:
        while True:
            lines.append(input())
    except EOFError:
        pass
    return "\n".join(lines)


def main() -> None:
    args = parse_args()
    text = args.text if args.text else read_from_stdin()

    try:
        service = NLPService(offline=args.offline)
        result = service.analyze(text)
    except ValueError as e:
        print(f"Error: {e}", file=__import__('sys').stderr)
        __import__('sys').exit(1)
    except RuntimeError as e:
        print(f"Runtime error: {e}", file=__import__('sys').stderr)
        __import__('sys').exit(2)
    except Exception as e:
        print(f"Unexpected error: {e}", file=__import__('sys').stderr)
        __import__('sys').exit(3)

    if args.json:
        print(result.to_json())
        return

    print("Sentiment score:", result.sentiment_score)
    print("Sentiment category:", result.sentiment_category)
    if result.high_priority_count > 0:
        print(f"High priority tasks: {result.high_priority_count}")
    print("\nStaff tasks:")
    for task in result.staff_tasks:
        print(task)


if __name__ == "__main__":
    main()

