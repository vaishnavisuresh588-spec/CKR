import os
from pathlib import Path
import torch
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
from openai import OpenAI
from dotenv import load_dotenv

# Always load .env from the ai-pipeline directory, regardless of where the process is launched from
load_dotenv(dotenv_path=Path(__file__).parent / ".env")



# Initialize models (singleton pattern for the service)
contradiction_pipeline = None
sentence_model = None

def get_contradiction_pipeline():
    global contradiction_pipeline
    if contradiction_pipeline is None:
        print("[LOADING] DeBERTa-v3 NLI model...")
        contradiction_pipeline = pipeline("text-classification", model="cross-encoder/nli-deberta-v3-small")
        print("[OK] DeBERTa-v3 loaded")
    return contradiction_pipeline

def get_sentence_model():
    global sentence_model
    if sentence_model is None:
        print("[LOADING] MiniLM sentence model...")
        sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("[OK] MiniLM loaded")
    return sentence_model

def detect_contradiction(claim_a: str, claim_b: str):
    """
    Returns entailment, contradiction, or neutral.
    Truncates inputs to stay within model's 512 token limit.
    """
    # DeBERTa-v3-small has a 512 token limit; ~200 words each keeps it safe
    max_words = 200
    a_trunc = ' '.join(claim_a.split()[:max_words])
    b_trunc = ' '.join(claim_b.split()[:max_words])
    classifier = get_contradiction_pipeline()
    result = classifier(f"{a_trunc} [SEP] {b_trunc}")
    return result[0]

def cluster_claims(claims: list):
    """
    Cluster claims using semantic similarity (cosine similarity)
    """
    if not claims:
        return []
    
    model = get_sentence_model()
    texts = [c.text for c in claims]
    embeddings = model.encode(texts)
    
    # Compute cosine similarities
    cosine_scores = util.cos_sim(embeddings, embeddings)
    
    # Basic grouping: just return the pairwise scores for now
    pairs = []
    for i in range(len(claims)):
        for j in range(i+1, len(claims)):
            pairs.append({
                "claim_a_idx": i,
                "claim_b_idx": j,
                "similarity_score": float(cosine_scores[i][j])
            })
            
    # Sort by highest similarity
    pairs = sorted(pairs, key=lambda x: x['similarity_score'], reverse=True)
    return pairs

def calculate_credibility(claim):
    """
    Multi-rule credibility scorer. Returns a score between 0.1 and 1.0.
    Rules are applied additively with a base score of 0.3.
    """
    source = (claim.source or "").lower().strip()
    domain = (claim.domain or "").lower().strip()

    score = 0.3  # base

    # ── Text content analysis: scan for cited sources within the claim body
    text_lower = (getattr(claim, 'text', '') or '').lower()

    # High-credibility citations found in text body → boost score
    high_cred_signals = [
        "meta-analysis", "systematic review", "randomized controlled",
        "peer-reviewed", "clinical trial", "cohort study",
        "nature", "lancet", "nejm", "jama", "bmj", "pubmed",
        "harvard", "stanford", "oxford", "cambridge", "mit",
        "who", "world health organization", "cdc", "nih",
        "university", "institute", "journal", "proceedings"
    ]
    low_cred_signals = [
        "blog", "unnamed studies", "some experts say",
        "according to sources", "many people believe",
        "wellness blog", "social media", "anecdotal",
        "reportedly", "unverified"
    ]

    high_hits = sum(1 for s in high_cred_signals if s in text_lower)
    low_hits = sum(1 for s in low_cred_signals if s in text_lower)

    score += min(high_hits * 0.05, 0.3)   # up to +0.30 from citations
    score -= min(low_hits * 0.07, 0.2)    # up to -0.20 from red flags

    # ── Tier 1: Peer-reviewed academic journals (+0.55)
    top_journals = [
        "nature", "science", "pubmed", "lancet", "nejm",
        "cell", "jama", "bmj", "ieee", "acm", "springer",
        "elsevier", "wiley", "oxford", "cambridge"
    ]
    if any(j in source for j in top_journals):
        score += 0.55

    # ── Tier 2: Government / educational institutions (+0.45)
    elif any(tld in source for tld in [".gov", ".edu", ".ac.", "who.int", "cdc.gov", "nih.gov"]):
        score += 0.45

    # ── Tier 3: Established news organisations (+0.35)
    elif any(outlet in source for outlet in [
        "reuters", "bbc", "apnews", "associated press", "nytimes",
        "theguardian", "wsj", "washington post", "economist",
        "bloomberg", "ft.com", "financial times", "npr"
    ]):
        score += 0.35

    # ── Tier 4: General / encyclopedic sources (+0.2)
    elif any(s in source for s in ["wikipedia", "britannica", "encyclopedia"]):
        score += 0.2

    # ── Tier 5: Generic news / unknown web (+0.1)
    elif any(tld in source for tld in [".com", ".org", ".net", ".io"]):
        score += 0.1

    # ── Tier 6: Blog / social / file upload — no bonus (stays at base)
    # (blog, medium, substack, reddit, twitter, facebook, file uploads)

    # ── Domain field bonus (+0.05 each, max +0.1)
    if domain in ["research", "journal", "academic", "science"]:
        score += 0.1
    elif domain in ["news", "media"]:
        score += 0.05

    return round(min(1.0, score), 2)

def generate_conclusion(topic: str, claims: list, contradictions: list, source_rankings: list):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return "NVIDIA API Key not found. Please provide NVIDIA_API_KEY in the .env file."

    # Use OpenAI SDK pointed at NVIDIA NIM API (OpenAI-compatible endpoint)
    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key
    )

    # Group claims by source so the prompt reflects real sources, not individual chunks
    from collections import defaultdict
    source_texts: dict = defaultdict(list)
    for c in claims:
        source_texts[c.source or "Unknown"].append(c.text)

    sources_summary = ""
    for i, (src, texts) in enumerate(source_texts.items(), 1):
        combined = " ".join(texts[:3])  # use up to 3 chunks per source
        if len(combined) > 600:
            combined = combined[:600] + "..."
        sources_summary += f"\nSource {i} [{src}]:\n{combined}\n"

    contradictions_text = ""
    if contradictions:
        contradictions_text = "\nDetected contradictions:\n"
        for con in contradictions[:3]:
            contradictions_text += f'- "{con["claim_1"][:120]}..." vs "{con["claim_2"][:120]}..."\n'
    else:
        contradictions_text = "\nNo direct contradictions detected between sources."

    prompt = f"""You are a fact-checking engine analysing multiple sources on a topic. Be concise and precise.

Topic: {topic}

Sources:
{sources_summary}
{contradictions_text}

Credibility Scores: {source_rankings}

Based on the source content above, respond ONLY in this exact format — no extra text, no headers, no bullet points:

1: [one sentence summarising what Source 1 claims about the topic]
2: [one sentence summarising what Source 2 claims about the topic]
Winner: [1 or 2]
Why: [exactly 2 sentences explaining which source is more credible or accurate and why]
Confidence: [0.0–1.0]
"""

    try:
        completion = client.chat.completions.create(
            # OpenAI GPT open-source 20B — hosted on NVIDIA NIM
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error calling NVIDIA NIM API: {str(e)}"
