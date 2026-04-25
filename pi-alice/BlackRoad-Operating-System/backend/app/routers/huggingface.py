"""
Hugging Face Integration API Router

Provides integration with Hugging Face:
- Model browsing and search
- Inference API
- Dataset exploration
- Spaces discovery
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import httpx
import os

from ..database import get_db
from ..auth import get_current_user
from ..models import User
from pydantic import BaseModel

router = APIRouter(prefix="/api/huggingface", tags=["huggingface"])

# Hugging Face API configuration
HF_API_URL = "https://huggingface.co/api"
HF_INFERENCE_URL = "https://api-inference.huggingface.co"
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")


class InferenceRequest(BaseModel):
    model: str
    inputs: str
    parameters: Optional[Dict[str, Any]] = None


@router.get("/models")
async def list_models(
    search: Optional[str] = Query(None),
    filter_task: Optional[str] = Query(None, alias="task"),
    sort: str = Query("downloads", pattern="^(downloads|likes|trending)$"),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    List and search Hugging Face models

    Tasks: text-generation, text-classification, question-answering,
           image-classification, text-to-image, automatic-speech-recognition, etc.
    """
    async with httpx.AsyncClient() as client:
        params = {
            "limit": limit,
            "sort": sort
        }
        if search:
            params["search"] = search
        if filter_task:
            params["filter"] = filter_task

        response = await client.get(
            f"{HF_API_URL}/models",
            params=params
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch models")

        models = response.json()
        return {
            "models": models,
            "total": len(models),
            "filters": {
                "search": search,
                "task": filter_task,
                "sort": sort
            }
        }


@router.get("/models/{model_id}")
async def get_model_info(
    model_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific model"""
    # Model ID format: "username/model-name" or "organization/model-name"
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{HF_API_URL}/models/{model_id}"
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Model not found")

        return response.json()


@router.post("/inference")
async def run_inference(
    inference_data: InferenceRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Run inference using Hugging Face's Inference API

    Supports various tasks like text generation, classification, translation, etc.
    """
    if not HF_TOKEN:
        raise HTTPException(status_code=400, detail="Hugging Face API token not configured")

    async with httpx.AsyncClient(timeout=30.0) as client:
        headers = {
            "Authorization": f"Bearer {HF_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {"inputs": inference_data.inputs}
        if inference_data.parameters:
            payload["parameters"] = inference_data.parameters

        response = await client.post(
            f"{HF_INFERENCE_URL}/models/{inference_data.model}",
            headers=headers,
            json=payload
        )

        if response.status_code == 503:
            return {
                "error": "Model is loading",
                "message": "The model is currently loading. Please try again in a few moments.",
                "estimated_time": response.json().get("estimated_time")
            }

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Inference failed: {response.text}"
            )

        return {
            "model": inference_data.model,
            "result": response.json()
        }


@router.get("/datasets")
async def list_datasets(
    search: Optional[str] = Query(None),
    sort: str = Query("downloads", pattern="^(downloads|likes|trending)$"),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """List and search Hugging Face datasets"""
    async with httpx.AsyncClient() as client:
        params = {
            "limit": limit,
            "sort": sort
        }
        if search:
            params["search"] = search

        response = await client.get(
            f"{HF_API_URL}/datasets",
            params=params
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch datasets")

        datasets = response.json()
        return {
            "datasets": datasets,
            "total": len(datasets)
        }


@router.get("/datasets/{dataset_id}")
async def get_dataset_info(
    dataset_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific dataset"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{HF_API_URL}/datasets/{dataset_id}"
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Dataset not found")

        return response.json()


@router.get("/spaces")
async def list_spaces(
    search: Optional[str] = Query(None),
    sort: str = Query("likes", pattern="^(likes|trending)$"),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """List and search Hugging Face Spaces (ML demos/apps)"""
    async with httpx.AsyncClient() as client:
        params = {
            "limit": limit,
            "sort": sort
        }
        if search:
            params["search"] = search

        response = await client.get(
            f"{HF_API_URL}/spaces",
            params=params
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch spaces")

        spaces = response.json()
        return {
            "spaces": spaces,
            "total": len(spaces)
        }


@router.get("/tasks")
async def list_tasks(
    current_user: User = Depends(get_current_user)
):
    """List all available ML tasks supported by Hugging Face"""
    # Common tasks categorized
    tasks = {
        "nlp": [
            {"id": "text-generation", "name": "Text Generation", "description": "Generate text continuations"},
            {"id": "text-classification", "name": "Text Classification", "description": "Classify text into categories"},
            {"id": "token-classification", "name": "Token Classification", "description": "NER, POS tagging"},
            {"id": "question-answering", "name": "Question Answering", "description": "Answer questions from context"},
            {"id": "translation", "name": "Translation", "description": "Translate between languages"},
            {"id": "summarization", "name": "Summarization", "description": "Generate text summaries"},
            {"id": "fill-mask", "name": "Fill Mask", "description": "Fill in masked words"},
            {"id": "sentiment-analysis", "name": "Sentiment Analysis", "description": "Detect sentiment"}
        ],
        "audio": [
            {"id": "automatic-speech-recognition", "name": "Speech Recognition", "description": "Transcribe audio to text"},
            {"id": "audio-classification", "name": "Audio Classification", "description": "Classify audio"},
            {"id": "text-to-speech", "name": "Text to Speech", "description": "Generate speech from text"}
        ],
        "computer_vision": [
            {"id": "image-classification", "name": "Image Classification", "description": "Classify images"},
            {"id": "object-detection", "name": "Object Detection", "description": "Detect objects in images"},
            {"id": "image-segmentation", "name": "Image Segmentation", "description": "Segment image regions"},
            {"id": "text-to-image", "name": "Text to Image", "description": "Generate images from text"},
            {"id": "image-to-text", "name": "Image to Text", "description": "Generate captions"}
        ],
        "multimodal": [
            {"id": "visual-question-answering", "name": "Visual QA", "description": "Answer questions about images"},
            {"id": "document-question-answering", "name": "Document QA", "description": "Answer questions from documents"}
        ]
    }

    return {"tasks": tasks}


@router.get("/trending")
async def get_trending(
    current_user: User = Depends(get_current_user)
):
    """Get trending models, datasets, and spaces"""
    async with httpx.AsyncClient() as client:
        # Fetch trending models
        models_response = await client.get(
            f"{HF_API_URL}/models",
            params={"sort": "trending", "limit": 10}
        )

        # Fetch trending datasets
        datasets_response = await client.get(
            f"{HF_API_URL}/datasets",
            params={"sort": "trending", "limit": 10}
        )

        # Fetch trending spaces
        spaces_response = await client.get(
            f"{HF_API_URL}/spaces",
            params={"sort": "trending", "limit": 10}
        )

        return {
            "trending_models": models_response.json() if models_response.status_code == 200 else [],
            "trending_datasets": datasets_response.json() if datasets_response.status_code == 200 else [],
            "trending_spaces": spaces_response.json() if spaces_response.status_code == 200 else []
        }


@router.post("/inference/text-generation")
async def text_generation(
    model: str = "gpt2",
    prompt: str = Query(..., min_length=1),
    max_length: int = Query(100, ge=1, le=1000),
    temperature: float = Query(0.7, ge=0.1, le=2.0),
    current_user: User = Depends(get_current_user)
):
    """Quick text generation endpoint"""
    inference_data = InferenceRequest(
        model=model,
        inputs=prompt,
        parameters={
            "max_length": max_length,
            "temperature": temperature
        }
    )
    return await run_inference(inference_data, current_user)


@router.post("/inference/sentiment")
async def sentiment_analysis(
    text: str = Query(..., min_length=1),
    model: str = "distilbert-base-uncased-finetuned-sst-2-english",
    current_user: User = Depends(get_current_user)
):
    """Quick sentiment analysis endpoint"""
    inference_data = InferenceRequest(
        model=model,
        inputs=text
    )
    return await run_inference(inference_data, current_user)


@router.post("/inference/image-caption")
async def image_caption(
    image_url: str = Query(...),
    model: str = "nlpconnect/vit-gpt2-image-captioning",
    current_user: User = Depends(get_current_user)
):
    """Generate image captions"""
    inference_data = InferenceRequest(
        model=model,
        inputs=image_url
    )
    return await run_inference(inference_data, current_user)
