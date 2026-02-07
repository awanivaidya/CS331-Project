from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from typing import List, Tuple
from difflib import SequenceMatcher

from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

# ================= CONFIG =================

SENTIMENT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"
MAX_TOKENS = 512

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z])")
SIMILARITY_THRESHOLD = 0.85 

HARD_OBLIGATIONS = {
    "must", "should", "shall", "required", "need to",
    "needs to", "have to", "has to", "expected", "expect",
    "obligated to", "mandated to", "responsible for", "accountable for",
    "cannot", "do not delay", "ensure that", "make sure to",
    "continue to", "continue providing", "keep", "maintain",
    "going forward", "moving forward", "from now on",
}

SOFT_OBLIGATIONS = {
    "it is important that",
    "it is essential that",
    "it would be helpful to",
    "it would be beneficial to",
    "we would like",
    "we ask that",
    "we recommend",
    "please ensure",
    "please make sure",
    "please confirm",
    "please verify",
    "please continue to",
    "please proceed to",
    "please coordinate",
    "kindly ensure",
    "kindly provide",
    "kindly confirm",
    "we expect that",
    "it is expected that",
    "it would support",
    "this would allow us to",
}

PROCESS_INDICATORS = {
    "within",
    "weekly",
    "daily",
    "monthly",
    "quarterly",
    "regular",
    "every",
    "each",
    "before",
    "after",
    "no later than",
    "by end of",
    "by eod",
    "in advance",
    "ahead of",
    "prior to",
    "as needed",
    "as soon as",
    "whenever",
    "when issues",
    "when risks",
    "if delays",
    "if blockers",
    "in case of",
    "during",
    "per week",
    "per month",
}


URGENCY_KEYWORDS = {
    "urgent", "asap", "immediately", "critical", "high priority",
    "time-sensitive", "deadline", "overdue", "past due",
    "emergency", "expedite", "rush", "pressing", "as soon as possible",
}


NEGATIVE_ACTIONS = {
    "do not", "don't", "avoid", "stop", "cease", "refrain from",
    "no longer", "discontinue", "prevent", "never", "must not",
}


FEEDBACK_PHRASES = {
    "we are happy", "we are satisfied", "we are pleased",
    "we are disappointed", "we are unhappy", "we are not satisfied",
    "we are extremely satisfied", "we are very pleased",
    "thank you for", "appreciate", "appreciation", "looking forward",
    "grateful for", "pleased with", "impressed by", "commend",
    "concerned about", "worried about", "frustrated with",
    "the service has been", "the team has been", "your team",
    "collaboration has been", "communication has been",
    "the work delivered", "the level of", "has exceeded",
    "has been consistently", "has been exceptionally",
    "overall", "in general", "so far", "to date",
    "handled promptly", "well-documented", "making it easy",
    "particularly appreciated", "significantly contributed",
}

FILLER_PHRASES = {
    "as you know", "as mentioned", "as discussed", "as per",
    "for your information", "fyi", "just to clarify", "to reiterate",
    "it should be noted that", "please note that", "i wanted to",
    "we wanted to", "personally",
}


ACTION_VERBS = {
    "acknowledge",
    "respond",
    "reply",
    "provide",
    "share",
    "send",
    "update",
    "deliver",
    "submit",
    "escalate",
    "prioritize",
    "resolve",
    "fix",
    "address",
    "communicate",
    "inform",
    "notify",
    "report",
    "clarify",
    "review",
    "analyze",
    "document",
    "record",
    "log",
    "capture",
    "prepare",
    "draft",
    "coordinate",
    "schedule",
    "arrange",
    "facilitate",
    "complete",
    "finish",
    "implement",
    "deploy",
    "execute",
    "monitor",
    "track",
    "maintain",
    "support",
    "verify",
    "validate",
    "confirm",
    "test",
    "triage",
    "investigate",
    "mitigate",
    "follow up",
}


PROFESSIONAL_TONE_PHRASES = {
    "hope this message finds you well",
    "hope you are doing well",
    "hope all is well",
    "we look forward",
    "we value the partnership",
    "appreciate the effort",
    "appreciate your support",
    "pleased with",
    "happy with",
    "satisfied with",
    "collaboration has been",
    "working relationship",
    "thank you for",
    "we recognize",
    "we acknowledge",
    "commend",
    "outstanding work",
    "exceeded our expectations",
}


TIMELINE_PATTERNS = [
    r"by ([A-Z][a-z]+ \d+)",
    r"within (\d+) (hours?|days?|weeks?|months?)",
    r"no later than ([A-Z][a-z]+ \d+)",
    r"deadline[:\s]+([A-Z][a-z]+ \d+)",
    r"by (\d{1,2}/\d{1,2})",
    r"by eod",
    r"by end of (day|week|month)",
]


REPHRASE_PATTERNS = [
    (r"it is important that (.*)", r"\1"),
    (r"it is essential that (.*)", r"\1"),
    (r"it would be helpful to (.*)", r"\1"),
    (r"it would be beneficial to (.*)", r"\1"),
    (r"it would support (.*)", r"\1"),
    (r"this would allow us to (.*)", r"\1"),
    (r"we would like (.*)", r"\1"),
    (r"we ask that (.*)", r"\1"),
    (r"we expect (.*)", r"\1"),
    (r"we recommend (.*)", r"\1"),
    (r"please ensure (.*)", r"Ensure \1"),
    (r"please make sure (.*)", r"Make sure \1"),
    (r"kindly ensure (.*)", r"Ensure \1"),
]

# ================= DATA MODEL =================

@dataclass
class AnalysisResult:
    sentiment_score: float
    sentiment_category: str
    staff_tasks: List[str]
    high_priority_count: int = 0

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2)

# ================= SENTIMENT =================

def signed_sentiment(label: str, score: float) -> float:
    return score if label == "POSITIVE" else -score


def neutralize_professional_tone(text: str, score: float) -> float:
    lowered = text.lower()
    tone_count = sum(1 for p in PROFESSIONAL_TONE_PHRASES if p in lowered)
    if tone_count >= 3:
        return score * 0.45
    elif tone_count >= 1:
        return score * 0.7
    return score


def categorize_sentiment(score: float) -> str:
    if score >= 0.75:
        return "VERY_POSITIVE"
    if score >= 0.50:
        return "POSITIVE"
    if score > -0.50:
        return "NEUTRAL"
    if score > -0.75:
        return "BAD"
    return "VERY_BAD"

# ================= TASK EXTRACTION =================

def is_similar(a: str, b: str) -> float:
    """Calculate similarity ratio for deduplication."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def is_feedback_sentence(sentence: str) -> bool:
    """Check if sentence is pure feedback/opinion (not actionable)."""
    s = sentence.lower()
    
    # If it contains feedback phrases without forward-looking obligations
    feedback_count = sum(1 for phrase in FEEDBACK_PHRASES if phrase in s)
    
    # Strong feedback indicators
    if feedback_count >= 2:
        return True
    
    # Single feedback phrase with no future obligation
    if feedback_count >= 1:
        has_forward = any(fwd in s for fwd in ["continue", "maintain", "keep", "going forward", "moving forward", "as we"])
        if not has_forward:
            return True
    
    return False


def detect_urgency(sentence: str) -> bool:
    """Check if sentence contains urgency markers."""
    return any(kw in sentence.lower() for kw in URGENCY_KEYWORDS)


def extract_deadline(sentence: str) -> str:
    """Extract deadline/timeline from sentence."""
    for pattern in TIMELINE_PATTERNS:
        match = re.search(pattern, sentence, re.IGNORECASE)
        if match:
            return f" [Due: {match.group(0)}]"
    return ""


def clean_filler(sentence: str) -> str:
    """Remove filler phrases that bloat tasks."""
    s = sentence
    for filler in FILLER_PHRASES:
        s = re.sub(re.escape(filler), "", s, flags=re.IGNORECASE)
    return s.strip()


def is_valid_task_sentence(sentence: str) -> bool:
    """Check if sentence contains actionable work obligations."""
    s = sentence.lower()
    
    # REJECT pure feedback sentences
    if is_feedback_sentence(sentence):
        return False
    
    # Check for obligation signals
    has_action = any(v in s for v in ACTION_VERBS)
    has_hard = any(o in s for o in HARD_OBLIGATIONS)
    has_soft = any(o in s for o in SOFT_OBLIGATIONS)
    has_process = any(p in s for p in PROCESS_INDICATORS)
    has_negative = any(n in s for n in NEGATIVE_ACTIONS)

    # Must have action verb and some obligation/process indicator
    return (has_action or has_negative) and (has_hard or has_soft or has_process)


def rephrase_task(sentence: str) -> str:
    """Clean and normalize task sentence."""
    # Remove filler first
    s = clean_filler(sentence)
    s = s.lower().strip()

    # Apply rephrasing patterns
    for pattern, repl in REPHRASE_PATTERNS:
        s = re.sub(pattern, repl, s, flags=re.IGNORECASE)

    s = s.capitalize()
    s = re.sub(r"\s+", " ", s)  # Normalize whitespace
    s = s.rstrip(".,;:")  # Remove trailing punctuation
    return s


def deduplicate_tasks(tasks: List[Tuple[str, bool]]) -> List[Tuple[str, bool]]:
    """Remove near-duplicate tasks based on similarity."""
    if not tasks:
        return []
    
    unique_tasks = [tasks[0]]
    
    for task, is_urgent in tasks[1:]:
        is_duplicate = False
        for existing_task, _ in unique_tasks:
            if is_similar(task, existing_task) > SIMILARITY_THRESHOLD:
                is_duplicate = True
                break
        
        if not is_duplicate:
            unique_tasks.append((task, is_urgent))
    
    return unique_tasks


def extract_staff_tasks(text: str) -> Tuple[List[str], int]:
    """Extract actionable staff tasks with priority detection.
    
    Returns:
        (task_list, high_priority_count)
    """
    sentences = SENTENCE_SPLIT.split(text)
    raw_tasks: List[Tuple[str, bool]] = []

    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 12:
            continue

        if is_valid_task_sentence(sentence):
            clean = rephrase_task(sentence)
            
            if len(clean) < 5:  # Skip if too short after cleaning
                continue
            
            is_urgent = detect_urgency(sentence)
            deadline = extract_deadline(sentence)
            
            task_text = f"{clean}{deadline}"
            raw_tasks.append((task_text, is_urgent))

    # Deduplicate similar tasks
    unique_tasks = deduplicate_tasks(raw_tasks)
    
    # Sort: urgent first, then alphabetically
    unique_tasks.sort(key=lambda x: (not x[1], x[0]))
    
    # Count high priority items
    priority_count = sum(1 for _, is_urgent in unique_tasks if is_urgent)
    
    # Format output
    formatted_tasks = []
    for task, is_urgent in unique_tasks:
        prefix = "[HIGH PRIORITY] " if is_urgent else ""
        formatted_tasks.append(f"- {prefix}{task}.")
    
    # Add default tasks if none found
    if not formatted_tasks:
        formatted_tasks.append("- Follow standard project responsibilities as defined.")
    
    formatted_tasks.append("- Review any additional requirements or constraints if applicable.")

    return formatted_tasks, priority_count

# ================= NLP SERVICE =================

class NLPService:
    def __init__(self, offline: bool = False):
        self.tokenizer = AutoTokenizer.from_pretrained(
            SENTIMENT_MODEL, local_files_only=offline
        )
        self.pipeline = pipeline(
            "sentiment-analysis",
            model=AutoModelForSequenceClassification.from_pretrained(
                SENTIMENT_MODEL, local_files_only=offline
            ),
            tokenizer=self.tokenizer,
        )

    def truncate(self, text: str) -> str:
        tokens = self.tokenizer.encode(text, add_special_tokens=False)
        if len(tokens) <= MAX_TOKENS - 2:
            return text
        return self.tokenizer.decode(tokens[: MAX_TOKENS - 2])

    def analyze(self, text: str) -> AnalysisResult:
        if not text.strip():
            raise ValueError("Input text is empty")

        truncated = self.truncate(text)
        raw = self.pipeline(truncated)[0]

        score = signed_sentiment(raw["label"], float(raw["score"]))
        score = neutralize_professional_tone(text, score)
        category = categorize_sentiment(score)

        tasks, priority_count = extract_staff_tasks(text)

        return AnalysisResult(
            sentiment_score=round(score, 4),
            sentiment_category=category,
            staff_tasks=tasks,
            high_priority_count=priority_count,
        )

# ================= CLI =================

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--text", type=str)
    p.add_argument("--json", action="store_true")
    p.add_argument("--offline", action="store_true")
    return p.parse_args()


def read_stdin() -> str:
    print("Paste email text. End with Ctrl+D / Ctrl+Z:")
    lines = []
    try:
        while True:
            lines.append(input())
    except EOFError:
        pass
    return "\n".join(lines)


def main():
    args = parse_args()
    text = args.text if args.text else read_stdin()

    service = NLPService(offline=args.offline)
    result = service.analyze(text)

    if args.json:
        print(result.to_json())
        return

    print("Sentiment score:", result.sentiment_score)
    print("Sentiment category:", result.sentiment_category)
    if result.high_priority_count > 0:
        print(f"High priority tasks: {result.high_priority_count}")
    print("\nStaff tasks:")
    for t in result.staff_tasks:
        print(t)


if __name__ == "__main__":
    main()

