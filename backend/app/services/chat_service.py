import openai
from app.config import settings
from app.schemas import ChatRequest, ChatResponse, ChatMessage
from typing import List
import json

class ChatService:
    def __init__(self):
        if settings.openai_api_key:
            openai.api_key = settings.openai_api_key
    
    def process_message(self, request: ChatRequest) -> ChatResponse:
        # Simple rule-based responses for demo purposes
        # In production, you'd use OpenAI API or another LLM
        
        user_message = request.message.lower()
        
        if any(keyword in user_message for keyword in ["po", "purchase order"]):
            reply = "Purchase orders are tracked with cap, utilization, vendor, and expiry metadata. You can review PO balances on the dashboard or open the document detail page for more context."
        elif "invoice" in user_message:
            reply = "Invoices are matched against their linked PO. Validation ensures amounts stay within the PO cap and alerts trigger if mismatches appear."
        elif any(keyword in user_message for keyword in ["agreement", "contract"]):
            reply = "Service agreements store vendor relationships, expiry dates, and linked PO versions. The system raises alerts 30 days before expiration."
        elif any(keyword in user_message for keyword in ["alert", "notification"]):
            reply = "Alerts fire when PO utilization crosses thresholds, invoices fail validation, or agreements near expiration. Manage rules in the Alerts view."
        elif any(keyword in user_message for keyword in ["chatbot", "assistant"]):
            reply = "I'm the DMS assistant. Ask about PO balances, upcoming expiries, or document summaries and I'll point you to the right dashboard modules."
        else:
            reply = "I can help you with purchase orders, invoices, service agreements, and alerts. What would you like to know about?"
        
        return ChatResponse(reply=reply)
    
    def process_message_with_openai(self, request: ChatRequest) -> ChatResponse:
        """Process message using OpenAI API (requires API key)"""
        if not settings.openai_api_key:
            return self.process_message(request)
        
        try:
            # Prepare messages for OpenAI
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful assistant for a Document Management System (DMS). You help users understand purchase orders, invoices, service agreements, and alerts. Keep responses concise and helpful."
                }
            ]
            
            # Add context if provided
            if request.context:
                for msg in request.context:
                    messages.append({
                        "role": msg.role,
                        "content": msg.content
                    })
            
            # Add current message
            messages.append({
                "role": "user",
                "content": request.message
            })
            
            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            reply = response.choices[0].message.content
            return ChatResponse(reply=reply)
            
        except Exception as e:
            # Fallback to rule-based response
            return self.process_message(request)
