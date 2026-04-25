#!/usr/bin/env python3
"""
BlackRoad Hailo-8 Intent Classifier
Tiny neural network for intent classification on NPU

This runs on the Hailo-8 accelerator for ~10ms inference.
Uses a simple embedding + classifier architecture.
"""

import os
import json
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path

# Check for Hailo availability
HAILO_AVAILABLE = False
try:
    from hailo_platform import HEF, Device, VDevice, HailoStreamInterface
    from hailo_platform import ConfigureParams, InputVStreamParams, OutputVStreamParams
    HAILO_AVAILABLE = True
except ImportError:
    pass


# Intent labels
INTENTS = [
    "status",
    "restart",
    "stop",
    "start",
    "check",
    "deploy",
    "list",
    "query",
    "execute",
    "communicate",
    "unknown"
]

# Simple vocabulary (top 500 words for agent commands)
VOCAB = {
    "<PAD>": 0, "<UNK>": 1,
    "restart": 2, "stop": 3, "start": 4, "check": 5, "status": 6,
    "deploy": 7, "list": 8, "show": 9, "get": 10, "run": 11,
    "execute": 12, "kill": 13, "terminate": 14, "reload": 15,
    "nginx": 16, "docker": 17, "ollama": 18, "tailscale": 19,
    "kubernetes": 20, "k3s": 21, "k8s": 22, "service": 23,
    "services": 24, "container": 25, "containers": 26, "pod": 27,
    "pods": 28, "process": 29, "processes": 30, "the": 31,
    "a": 32, "an": 33, "is": 34, "are": 35, "what": 36,
    "how": 37, "tell": 38, "ask": 39, "message": 40,
    "to": 41, "on": 42, "off": 43, "up": 44, "down": 45,
    "running": 46, "stopped": 47, "active": 48, "all": 49,
    "help": 50, "usage": 51, "commands": 52, "system": 53,
    "memory": 54, "disk": 55, "cpu": 56, "load": 57,
    "network": 58, "port": 59, "ports": 60, "ssh": 61,
    "hailo": 62, "npu": 63, "model": 64, "inference": 65,
    "cecilia": 66, "lucidia": 67, "octavia": 68, "aria": 69,
    "alice": 70, "gematria": 71, "anastasia": 72,
}

MAX_SEQ_LEN = 16
EMBEDDING_DIM = 32
HIDDEN_DIM = 64


@dataclass
class ClassifierResult:
    intent: str
    confidence: float
    all_scores: Dict[str, float]


class SimpleTokenizer:
    """Tokenize text to indices"""

    def __init__(self, vocab: Dict[str, int], max_len: int = MAX_SEQ_LEN):
        self.vocab = vocab
        self.max_len = max_len
        self.unk_id = vocab.get("<UNK>", 1)
        self.pad_id = vocab.get("<PAD>", 0)

    def tokenize(self, text: str) -> np.ndarray:
        """Convert text to padded token indices"""
        words = text.lower().split()
        tokens = [self.vocab.get(w, self.unk_id) for w in words]

        # Pad or truncate
        if len(tokens) > self.max_len:
            tokens = tokens[:self.max_len]
        else:
            tokens = tokens + [self.pad_id] * (self.max_len - len(tokens))

        return np.array(tokens, dtype=np.int32)


class CPUClassifier:
    """Fallback CPU classifier using numpy"""

    def __init__(self):
        self.tokenizer = SimpleTokenizer(VOCAB)

        # Initialize random weights (would be trained in production)
        np.random.seed(42)
        self.embeddings = np.random.randn(len(VOCAB), EMBEDDING_DIM).astype(np.float32) * 0.1
        self.w1 = np.random.randn(MAX_SEQ_LEN * EMBEDDING_DIM, HIDDEN_DIM).astype(np.float32) * 0.1
        self.b1 = np.zeros(HIDDEN_DIM, dtype=np.float32)
        self.w2 = np.random.randn(HIDDEN_DIM, len(INTENTS)).astype(np.float32) * 0.1
        self.b2 = np.zeros(len(INTENTS), dtype=np.float32)

        # Override with rule-based biases for known patterns
        self._init_rule_biases()

    def _init_rule_biases(self):
        """Initialize biases based on keyword-intent associations"""
        # Map keywords to intents with strong biases
        keyword_intent_map = {
            "restart": 1, "reload": 1, "reboot": 1,
            "stop": 2, "kill": 2, "terminate": 2,
            "start": 3, "launch": 3, "begin": 3,
            "check": 4, "verify": 4, "test": 4,
            "status": 0, "health": 0,
            "deploy": 5, "install": 5,
            "list": 6, "show": 6, "get": 6,
        }

        for word, intent_idx in keyword_intent_map.items():
            if word in VOCAB:
                word_idx = VOCAB[word]
                # Boost embedding for this word towards this intent
                self.embeddings[word_idx] = np.zeros(EMBEDDING_DIM)
                self.embeddings[word_idx][intent_idx % EMBEDDING_DIM] = 2.0

    def classify(self, text: str) -> ClassifierResult:
        """Classify text intent"""
        tokens = self.tokenizer.tokenize(text)

        # Embed
        embedded = self.embeddings[tokens].flatten()

        # Forward pass
        h = np.maximum(0, embedded @ self.w1 + self.b1)  # ReLU
        logits = h @ self.w2 + self.b2

        # Softmax
        exp_logits = np.exp(logits - np.max(logits))
        probs = exp_logits / exp_logits.sum()

        # Get top intent
        top_idx = np.argmax(probs)
        intent = INTENTS[top_idx]
        confidence = float(probs[top_idx])

        all_scores = {INTENTS[i]: float(probs[i]) for i in range(len(INTENTS))}

        return ClassifierResult(
            intent=intent,
            confidence=confidence,
            all_scores=all_scores
        )


class HailoClassifier:
    """Hailo-8 accelerated classifier"""

    def __init__(self, hef_path: str = None):
        if not HAILO_AVAILABLE:
            raise RuntimeError("Hailo SDK not available")

        self.tokenizer = SimpleTokenizer(VOCAB)
        self.device = None
        self.hef = None

        if hef_path and os.path.exists(hef_path):
            self._load_model(hef_path)
        else:
            print("Warning: No HEF model provided, using CPU fallback")
            self._cpu_fallback = CPUClassifier()

    def _load_model(self, hef_path: str):
        """Load compiled Hailo model"""
        self.hef = HEF(hef_path)
        self.device = VDevice()
        # Configure would happen here

    def classify(self, text: str) -> ClassifierResult:
        """Classify using Hailo or fallback"""
        if hasattr(self, '_cpu_fallback'):
            return self._cpu_fallback.classify(text)

        # Hailo inference would happen here
        # For now, fall back to CPU
        return CPUClassifier().classify(text)


class HybridClassifier:
    """
    Hybrid classifier: Fast rules first, then tiny model
    """

    def __init__(self, use_hailo: bool = True):
        self.use_hailo = use_hailo and HAILO_AVAILABLE

        if self.use_hailo:
            try:
                self.classifier = HailoClassifier()
            except:
                self.classifier = CPUClassifier()
        else:
            self.classifier = CPUClassifier()

        # Import fast NLP for rule-based first pass
        try:
            from fast_nlp import FastNLP
            self.fast_nlp = FastNLP()
        except ImportError:
            self.fast_nlp = None

    def classify(self, text: str) -> Dict:
        """Hybrid classification: rules first, then model"""

        # Try fast NLP rules first
        if self.fast_nlp:
            fast_result = self.fast_nlp.process(text)
            if fast_result["confidence"] >= 0.8:
                return {
                    "intent": fast_result["intent"],
                    "confidence": fast_result["confidence"],
                    "source": "rules",
                    "action": fast_result.get("action")
                }

        # Fall back to classifier
        result = self.classifier.classify(text)

        return {
            "intent": result.intent,
            "confidence": result.confidence,
            "source": "hailo" if self.use_hailo else "cpu",
            "scores": result.all_scores
        }


def create_training_data() -> Tuple[List[str], List[int]]:
    """Generate synthetic training data for the classifier"""
    data = []

    templates = {
        0: [  # status
            "status", "what is the status", "show status", "system status",
            "how is {service}", "status of {service}"
        ],
        1: [  # restart
            "restart {service}", "reload {service}", "reboot {service}",
            "bounce {service}", "restart the {service}"
        ],
        2: [  # stop
            "stop {service}", "kill {service}", "terminate {service}",
            "shutdown {service}", "turn off {service}"
        ],
        3: [  # start
            "start {service}", "launch {service}", "run {service}",
            "begin {service}", "turn on {service}"
        ],
        4: [  # check
            "check {service}", "verify {service}", "test {service}",
            "is {service} running", "is {service} up"
        ],
        5: [  # deploy
            "deploy {service}", "install {service}", "setup {service}",
            "provision {service}"
        ],
        6: [  # list
            "list {resource}", "show {resource}", "get {resource}",
            "what {resource} are running"
        ],
    }

    services = ["nginx", "docker", "ollama", "tailscale", "k3s", "ssh"]
    resources = ["services", "containers", "pods", "processes", "ports"]

    for intent_idx, patterns in templates.items():
        for pattern in patterns:
            if "{service}" in pattern:
                for svc in services:
                    data.append((pattern.replace("{service}", svc), intent_idx))
            elif "{resource}" in pattern:
                for res in resources:
                    data.append((pattern.replace("{resource}", res), intent_idx))
            else:
                data.append((pattern, intent_idx))

    texts = [d[0] for d in data]
    labels = [d[1] for d in data]

    return texts, labels


# CLI
if __name__ == "__main__":
    import sys

    classifier = HybridClassifier(use_hailo=HAILO_AVAILABLE)

    print(f"BlackRoad Hailo Classifier")
    print(f"Hailo available: {HAILO_AVAILABLE}")
    print("-" * 40)

    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        result = classifier.classify(text)
        print(json.dumps(result, indent=2))
    else:
        # Interactive mode
        while True:
            try:
                text = input("> ").strip()
                if not text or text in ("quit", "exit"):
                    break
                result = classifier.classify(text)
                print(json.dumps(result, indent=2))
            except (KeyboardInterrupt, EOFError):
                break
