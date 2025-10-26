from fastapi import APIRouter, HTTPException
from app.services.chat_service import ChatService
from app.schemas import ChatRequest, ChatResponse
from app.config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    """Send a message to the chat assistant"""
    try:
        chat_service = ChatService()
        
        # Use OpenAI if API key is available, otherwise use rule-based responses
        if settings.openai_api_key:
            response = chat_service.process_message_with_openai(request)
        else:
            response = chat_service.process_message(request)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat message: {str(e)}")
