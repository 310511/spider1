import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from typing import Optional
from backend.config import settings
from backend.logger import logger
from datetime import datetime, timedelta

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
GOOGLE_CREDENTIALS_PATH = os.path.join(PROJECT_ROOT, settings.google_credentials_path)
GOOGLE_TOKEN_PATH = os.path.join(PROJECT_ROOT, settings.google_token_path)

def get_calendar_service():
    """Authenticates with Google and returns a calendar service object."""
    creds = None
    if os.path.exists(GOOGLE_TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(GOOGLE_TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                logger.error(f"Error refreshing token: {e}. Re-authenticating.")
                flow = InstalledAppFlow.from_client_secrets_file(GOOGLE_CREDENTIALS_PATH, SCOPES)
                creds = flow.run_local_server(port=0)
        else:
            flow = InstalledAppFlow.from_client_secrets_file(GOOGLE_CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(GOOGLE_TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())
    return build('calendar', 'v3', credentials=creds)

def create_calendar_event(summary: str, start_time: str, end_time: Optional[str] = None, description: Optional[str] = "") -> str:
    """Creates a new event on the user's Google Calendar."""
    try:
        service = get_calendar_service()
        # You would need a robust date/time parser here. For now, we assume ISO format.
        start = {"dateTime": start_time, "timeZone": "America/New_York"}
        end = {"dateTime": end_time, "timeZone": "America/New_York"} if end_time else start
        
        event = {
            'summary': summary,
            'description': description,
            'start': start,
            'end': end,
        }
        
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        logger.info(f"Event created: {created_event.get('htmlLink')}")
        return f"OK, I've added '{summary}' to your calendar."
    except Exception as e:
        logger.error(f"Error creating calendar event: {e}")
        return "I'm sorry, I couldn't create the calendar event." 