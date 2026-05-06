from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import services
import sys
import traceback as tb

def safe_print(msg):
    """Print that won't crash on Windows cp1252"""
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode())

app = FastAPI(title="AI Contradiction Pipeline", debug=True)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = str(exc)
    safe_print(f"[GLOBAL ERROR] {error_detail}")
    safe_print(tb.format_exc())
    return JSONResponse(status_code=500, content={"detail": error_detail})

class Claim(BaseModel):
    text: str
    source: Optional[str] = None
    date: Optional[str] = None
    domain: Optional[str] = None

class ProcessingRequest(BaseModel):
    topic: str
    claims: List[Claim]

class ClaimResult(BaseModel):
    final_conclusion: str
    confidence: float
    reasoning: str
    source_ranking: List[dict]

@app.post("/process-claims", response_model=ClaimResult)
async def process_claims(request: ProcessingRequest):
    import traceback
    try:
        safe_print(f"[process-claims] Received {len(request.claims)} claims for topic: '{request.topic}'")

        # Phase 2 & 3: Semantic Similarity + Clustering
        safe_print("[process-claims] Phase 2: Clustering claims...")
        similarity_pairs = services.cluster_claims(request.claims)

        contradictions_found = []

        # Phase 4: Check top similar pairs for contradictions
        safe_print("[process-claims] Phase 4: Running NLI contradiction detection...")
        for pair in similarity_pairs:
            if pair['similarity_score'] > 0.4:
                claim_a = request.claims[pair['claim_a_idx']]
                claim_b = request.claims[pair['claim_b_idx']]
                nli_result = services.detect_contradiction(claim_a.text, claim_b.text)
                if nli_result['label'].lower() == 'contradiction':
                    contradictions_found.append({
                        "claim_1": claim_a.text,
                        "claim_2": claim_b.text,
                        "confidence": nli_result['score']
                    })

        safe_print(f"[process-claims] Found {len(contradictions_found)} contradictions")

        # Phase 5: Credibility
        safe_print("[process-claims] Phase 5: Scoring credibility...")
        source_ranking = []
        for c in request.claims:
            score = services.calculate_credibility(c)
            source_ranking.append({"source": c.source or "Unknown", "score": score})

        # Deduplicate source_ranking by source name
        seen = set()
        deduped = []
        for item in source_ranking:
            if item["source"] not in seen:
                seen.add(item["source"])
                deduped.append(item)
        source_ranking = deduped

        # Phase 6: NVIDIA Reasoning
        safe_print("[process-claims] Phase 6: Calling NVIDIA NIM for reasoning...")
        reasoning_text = services.generate_conclusion(
            topic=request.topic,
            claims=request.claims,
            contradictions=contradictions_found,
            source_rankings=source_ranking
        )
        safe_print("[process-claims] Done - OK")

        return ClaimResult(
            final_conclusion=f"Resolved {len(request.claims)} claims regarding '{request.topic}'.",
            confidence=0.85,
            reasoning=reasoning_text,
            source_ranking=source_ranking
        )

    except Exception as e:
        print(f"[process-claims] ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-contradictions")
async def detect_contradictions():
    pass

class RelevanceRequest(BaseModel):
    texts_a: List[str]   # sentences/chunks from document A
    texts_b: List[str]   # sentences/chunks from document B

@app.post("/check-relevance")
async def check_relevance(request: RelevanceRequest):
    """
    Compute mean cosine similarity between the two document sets.
    Returns relevant=True if avg similarity > 0.20 (documents share a domain),
    or if any cross-pair similarity > 0.35 (at least one related sentence pair).
    Off-topic docs (e.g. recipe vs cricket) score < 0.10.
    """
    try:
        model = services.get_sentence_model()
        emb_a = model.encode(request.texts_a[:6])   # cap at 6 chunks each
        emb_b = model.encode(request.texts_b[:6])

        from sentence_transformers import util as st_util
        scores = st_util.cos_sim(emb_a, emb_b)      # shape (len_a, len_b)

        all_scores = scores.flatten().tolist()
        mean_score = sum(all_scores) / len(all_scores)
        max_score  = max(all_scores)

        # Accept if: mean > 0.20 OR at least one pair is somewhat similar
        relevant = mean_score > 0.20 or max_score > 0.35

        return {
            "relevant":   relevant,
            "mean_score": round(mean_score, 4),
            "max_score":  round(max_score, 4),
            "message":    (
                "Documents share a common domain — proceeding with analysis."
                if relevant else
                f"Documents appear unrelated (similarity: {round(mean_score*100)}%). "
                "Please upload two documents on the same topic for meaningful contradiction detection."
            )
        }
    except Exception as e:
        # If model unavailable, allow through (don't block user)
        return {"relevant": True, "mean_score": 0, "max_score": 0, "message": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
