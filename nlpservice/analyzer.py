
from __future__ import annotations

import argparse
import json
import os
import re
from collections import Counter
from dataclasses import dataclass, asdict
from typing import List

import torch
from transformers import (
    AutoModelForSequenceClassification,
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
    pipeline,
)

try:  # transformers 4.x
    from transformers import SummarizationPipeline  # type: ignore
except ImportError:
    SummarizationPipeline = None

SENTIMENT_MODEL = os.environ.get(
    "SENTIMENT_MODEL", "distilbert-base-uncased-finetuned-sst-2-english"
)
SUMMARY_MODEL = os.environ.get("SUMMARY_MODEL", "facebook/bart-large-cnn")
STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "for",
    "in",
    "on",
    "with",
    "by",
    "is",
    "are",
    "be",
    "that",
    "this",
    "as",
    "at",
    "it",
    "from",
    "their",
    "our",
    "we",
    "will",
    "must",
}
WORD_REGEX = re.compile(r"[A-Za-z']+")


@dataclass
class AnalysisResult:
    """Structured response returned to callers."""

    sentiment_label: str
    sentiment_score: float
    summary_bullets: List[str]

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2)


class ExtractiveSummarizer:
    """Simple frequency-based summarizer used for demos/tests."""

    def __call__(self, text: str, **_) -> List[dict]:
        selected = extractive_summary(text)
        return [{"summary_text": " ".join(selected)}]


class Seq2SeqGenerator:
    """Minimal wrapper that calls model.generate directly (transformers>=5)."""

    def __init__(self, model, tokenizer) -> None:
        self._model = model
        self._tokenizer = tokenizer

    def __call__(self, text: str, min_length: int = 45, max_length: int = 160, **_) -> List[dict]:
        inputs = self._tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=1024,
        )
        with torch.no_grad():
            generated = self._model.generate(
                **inputs,
                min_length=min_length,
                max_length=max_length,
                num_beams=4,
                no_repeat_ngram_size=3,
            )
        decoded = self._tokenizer.batch_decode(generated, skip_special_tokens=True)
        return [{"summary_text": decoded[0]}]


class PipelineLoader:
    """Lazily loads and caches huggingface pipelines."""

    def __init__(self, offline: bool = False, force_extractive: bool = False) -> None:
        self._sentiment = None
        self._summarizer = None
        self._offline = offline
        self._force_extractive = force_extractive

    def _load_with_cache(self, factory):
        try:
            return factory()
        except OSError as err:
            if self._offline:
                raise RuntimeError(
                    "Models not available offline. Run once while online to cache weights."
                ) from err
            raise

    def sentiment(self):
        if self._sentiment is None:
            def factory():
                tokenizer = AutoTokenizer.from_pretrained(
                    SENTIMENT_MODEL, local_files_only=self._offline
                )
                model = AutoModelForSequenceClassification.from_pretrained(
                    SENTIMENT_MODEL, local_files_only=self._offline
                )
                return pipeline(
                    "sentiment-analysis",
                    model=model,
                    tokenizer=tokenizer,
                )

            self._sentiment = self._load_with_cache(factory)
        return self._sentiment

    def summarizer(self):
        if self._summarizer is None:
            if self._force_extractive:
                self._summarizer = ExtractiveSummarizer()
            else:
                def factory():
                    tokenizer = AutoTokenizer.from_pretrained(
                        SUMMARY_MODEL, local_files_only=self._offline
                    )
                    model = AutoModelForSeq2SeqLM.from_pretrained(
                        SUMMARY_MODEL, local_files_only=self._offline
                    )
                    if SummarizationPipeline is not None:
                        return SummarizationPipeline(
                            model=model,
                            tokenizer=tokenizer,
                            framework="pt",
                            device=-1,
                        )
                    # transformers>=5 removed the registered task, so call generate directly.
                    return Seq2SeqGenerator(model=model, tokenizer=tokenizer)

                self._summarizer = self._load_with_cache(factory)
        return self._summarizer


def bulletize(text: str) -> List[str]:
    """Split summary text into quick bullet points."""

    cleaned = text.strip().replace("\n", " ")
    if not cleaned:
        return []
    # Split on sentence boundaries to keep bullets readable.
    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    bullets = [f"- {segment.strip()}" for segment in sentences if segment.strip()]
    return bullets


def extractive_summary(text: str, max_sentences: int = 3) -> List[str]:
    """Frequency-based extractive summary for quick offline demos."""

    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    if not sentences:
        return []

    tokens = [WORD_REGEX.findall(sentence.lower()) for sentence in sentences]
    # Build word frequency table ignoring stopwords.
    freq = Counter(
        token
        for token_list in tokens
        for token in token_list
        if token not in STOPWORDS
    )
    if not freq:
        return sentences[: max_sentences or len(sentences)]

    scores = []
    for sentence, token_list in zip(sentences, tokens):
        score = sum(freq[token] for token in token_list if token not in STOPWORDS)
        scores.append((score, sentence))

    top_sentences = [sentence for _, sentence in sorted(scores, key=lambda item: item[0], reverse=True)]
    return top_sentences[: max_sentences]


def analyze_text(
    text: str,
    loader: PipelineLoader,
    min_summary_len: int = 45,
    max_summary_len: int = 160,
) -> AnalysisResult:
    """Run sentiment analysis and summarization on the supplied text."""

    if not text or not text.strip():
        raise ValueError("Input text must be non-empty.")

    sentiment_raw = loader.sentiment()(text)[0]
    summary_raw = loader.summarizer()(text, min_length=min_summary_len, max_length=max_summary_len)[
        0
    ]["summary_text"]

    return AnalysisResult(
        sentiment_label=sentiment_raw["label"],
        sentiment_score=float(sentiment_raw["score"]),
        summary_bullets=bulletize(summary_raw),
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Analyze requirement/SLA text and print sentiment plus bullet summaries. "
            "If --text is omitted the script reads from stdin until EOF."
        )
    )
    parser.add_argument(
        "--text",
        type=str,
        help="Optional inline text. Use quotes. Overrides stdin input when provided.",
    )
    parser.add_argument(
        "--min-summary-len",
        type=int,
        default=45,
        help="Minimum tokens for summarization model (default 45).",
    )
    parser.add_argument(
        "--max-summary-len",
        type=int,
        default=160,
        help="Maximum tokens for summarization model (default 160).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Return machine-readable JSON instead of human text output.",
    )
    parser.add_argument(
        "--offline",
        action="store_true",
        help=(
            "Force transformers to run in offline mode. Requires the models to be "
            "cached locally (run once online first)."
        ),
    )
    parser.add_argument(
        "--extractive",
        action="store_true",
        help=(
            "Use a lightweight extractive summarizer instead of downloading a "
            "transformer model (useful for quick demos)."
        ),
    )
    return parser.parse_args()


def read_text_from_stdin() -> str:
    print("Enter requirement/SLA text. Finish with Ctrl+Z (Windows) or Ctrl+D (Unix):")
    collected = []
    try:
        while True:
            line = input()
            collected.append(line)
    except EOFError:
        pass
    return "\n".join(collected)


def main() -> None:
    args = parse_args()
    raw_text = args.text if args.text else read_text_from_stdin()
    offline_env = os.environ.get("TRANSFORMERS_OFFLINE", "0") == "1"
    loader = PipelineLoader(
        offline=args.offline or offline_env,
        force_extractive=args.extractive,
    )
    result = analyze_text(
        raw_text,
        loader,
        min_summary_len=args.min_summary_len,
        max_summary_len=args.max_summary_len,
    )

    if args.json:
        print(result.to_json())
        return

    print("Sentiment label:", result.sentiment_label)
    print("Confidence score:", f"{result.sentiment_score:.4f}")
    print("Summary bullets:")
    for bullet in result.summary_bullets:
        print(" ", bullet)

if __name__ == "__main__":
    main()
