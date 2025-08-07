import streamlit as st
import sys
import os
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta
import requests
import json
from io import BytesIO
import time
import re
import vad # Re-enable the VAD import
from backend.logger import logger
import logging
import base64

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Backend API base URL - you can change this if running the backend server separately
BACKEND_API_URL = "http://localhost:8000"

# Configure Streamlit page
st.set_page_config(
    page_title="INFINITE-MEMORY",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom CSS to dock chat input to the bottom ---
st.markdown("""
    <style>
        .stChatInputContainer {
            position: fixed;
            bottom: 3rem;
            width: 100%;
            background-color: #ffffff; /* Or match your theme's background */
            padding-right: 2rem;
        }
    </style>
""", unsafe_allow_html=True)

# Simple user database (in production, use a proper database)
USER_DATABASE = {
    "admin": {
        "password": "admin123",  # In production, hash this password
        "role": "admin",
        "name": "Administrator"
    },
    "patient1": {
        "password": "patient123",
        "role": "patient",
        "name": "John Irving",
        "age": 65,
        "condition": "Early-stage Dementia",
        "emergency_contact": "Jane Irving (Daughter) - 555-0123"
    },
    "patient2": {
        "password": "patient456",
        "role": "patient", 
        "name": "Mary Collingwood",
        "age": 68,
        "condition": "Alzheimer's Disease",
        "emergency_contact": "Bob Collingwood (Son) - 555-0456"
    }
}

def authenticate_user(username, password):
    """Authenticate user credentials"""
    if username in USER_DATABASE:
        # In production, compare hashed passwords
        if USER_DATABASE[username]["password"] == password:
            return USER_DATABASE[username]
    return None

def init_session_state():
    """Initialize session state variables"""
    if 'authenticated' not in st.session_state:
        st.session_state.authenticated = False
    if 'user_info' not in st.session_state:
        st.session_state.user_info = None
    if 'conversation_history' not in st.session_state:
        st.session_state.conversation_history = []
    if 'vad_listening' not in st.session_state:
        st.session_state.vad_listening = False

def login_page():
    """Display login page"""
    st.title("🧠 INFINITE-MEMORY")
    st.subheader("AI Cognitive Companion")
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("### Please Login")
        
        with st.form("login_form"):
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            submit_button = st.form_submit_button("Login")
            
            if submit_button:
                user_info = authenticate_user(username, password)
                if user_info:
                    st.session_state.authenticated = True
                    st.session_state.user_info = user_info
                    st.session_state.username = username
                    st.success(f"Welcome, {user_info['name']}!")
                    st.rerun()
                else:
                    st.error("Invalid username or password. Please try again.")
        
        # Demo credentials info
        with st.expander("Demo Credentials"):
            st.markdown("""
            **Admin:**
            - Username: admin
            - Password: admin123
            
            **Patient 1:**
            - Username: patient1  
            - Password: patient123
            
            **Patient 2:**
            - Username: patient2
            - Password: patient456
            """)

def patient_interface():
    """Patient/User interface"""
    st.title(f"Welcome, {st.session_state.user_info['name']} 👋")
    
    # Sidebar with patient info
    with st.sidebar:
        st.markdown("### Your Information")
        st.write(f"**Name:** {st.session_state.user_info['name']}")
        st.write(f"**Age:** {st.session_state.user_info.get('age', 'N/A')}")
        st.write(f"**Condition:** {st.session_state.user_info.get('condition', 'N/A')}")
        st.write(f"**Emergency Contact:** {st.session_state.user_info.get('emergency_contact', 'N/A')}")
        
        st.markdown("---")
        st.markdown("### Today's Tasks")
        try:
            response = requests.get(f"{BACKEND_API_URL}/tasks/{st.session_state.username}")
            tasks = response.json()
            if tasks:
                for task in tasks:
                    is_done = st.checkbox(f"{task.get('summary')}", value=task.get('completed'), key=f"patient_task_{task.get('task_id')}")
                    if is_done != task.get('completed'):
                        requests.post(f"{BACKEND_API_URL}/tasks/complete", json={"patient_id": st.session_state.username, "task_id": task.get('task_id')})
                        st.rerun()
            else:
                st.info("No upcoming tasks.")
        except Exception as e:
            st.warning("Could not load tasks.")
        
        st.markdown("---")
        if st.button("Logout"):
            st.session_state.authenticated = False
            st.session_state.user_info = None
            st.rerun()

    # Re-enable and correct the VAD startup and status display
    try:
        if not vad.is_currently_listening():
            vad.start_background_listening(st.session_state.username)

        if vad.is_currently_listening():
            user_name = st.session_state.user_info.get("name", "you") if st.session_state.user_info else "you"
            st.success(f"🎤 Voice monitoring is active for {user_name}")
        else:
            st.warning("🎤 Voice monitoring is starting or has encountered an issue.")
    except Exception as e:
        st.error(f"Could not initialize voice features: {e}")

    # Main interface tabs
    tab1, tab2, tab3 = st.tabs(["💬 Chat", "📝 My Memories", "📊 My Progress"])
    
    with tab1:
        st.subheader("Talk to your AI Companion")
        st.session_state.speak_responses = st.checkbox("🔊 Enable Spoken Responses", value=st.session_state.get("speak_responses", True))
        
        # Add a file uploader for images
        uploaded_image = st.file_uploader("Add an image to your memory", type=["jpg", "jpeg", "png"])
        
        # --- Create a container for the chat history ---
        chat_container = st.container()
        
        with chat_container:
            # Display chat messages from history
            for message in st.session_state.conversation_history:
                with st.chat_message(message["role"]):
                    st.markdown(message["content"])
                    if message.get("image_url"):
                        st.markdown(f"[View related image]({message['image_url']})")

        # --- Chat Input is now outside the container ---
        if prompt := st.chat_input("What would you like to remember about this image?"):
            # Add a timestamp to all new history items
            st.session_state.conversation_history.append({"role": "user", "content": prompt, "timestamp": datetime.now()})
            # --- IMAGE PROCESSING LOGIC ---
            if uploaded_image is not None:
                # Process the image and the prompt as a caption
                with st.spinner("Analyzing your image..."):
                    image_bytes = uploaded_image.getvalue()
                    response = process_image_memory(image_bytes, uploaded_image.name, prompt, st.session_state.username)
                    
                    description = f"I've saved the image you uploaded with the note: '{prompt}'. Here's what I see: {response.get('description')}"
                    
                    # Display and add AI's description to history
                    with st.chat_message("assistant"):
                        st.markdown(description)
                    st.session_state.conversation_history.append({
                        "role": "assistant",
                        "content": description,
                        "image_url": response.get("image_url"),
                        "timestamp": datetime.now()
                    })

                    # --- THIS IS THE MISSING PIECE FOR TTS ---
                    if st.session_state.speak_responses:
                        with st.spinner("Generating speech..."):
                            text_to_speech_response(description, st.session_state.username)
                    
                    st.rerun()

            # --- TEXT PROCESSING LOGIC (if no image) ---
            else:
                # 1. Add user message to history and display it
                st.session_state.conversation_history.append({"role": "user", "content": prompt, "timestamp": datetime.now()})
                with st.chat_message("user"):
                    st.markdown(prompt)

                # 2. Process memory and get AI response
                with st.spinner("Thinking..."):
                    # Store the user's message as a memory first
                    process_text_memory(prompt, st.session_state.username)
                    # Then get the AI's response to that message
                    response = process_user_query(prompt, st.session_state.username)
                    full_response = response.get("answer", "I'm sorry, I had trouble responding.")
                    
                    # Display AI response in chat message container
                    with st.chat_message("assistant"):
                        message_placeholder = st.empty()
                        message_placeholder.markdown(full_response)
                        
                    # Add AI response to chat history
                    st.session_state.conversation_history.append({
                        "role": "assistant",
                        "content": full_response,
                        "image_url": response.get("image_url"),
                        "timestamp": datetime.now()
                    })

                    # Automatically play TTS if enabled
                    if st.session_state.speak_responses:
                        with st.spinner("Generating speech..."):
                            text_to_speech_response(full_response, st.session_state.username)
        
        # This timed block is now the core of the VAD-UI interaction
        if 'last_audio_check' not in st.session_state:
            st.session_state.last_audio_check = datetime.now()
        
        # Check for new audio files every 5 seconds for responsiveness
        if datetime.now() - st.session_state.last_audio_check > timedelta(seconds=5):
            processed_audio = process_audio_files(st.session_state.username)
            if processed_audio:
                for audio_item in processed_audio:
                    # Use the new, standardized format with 'role' and 'content'
                    st.session_state.conversation_history.append({
                        "role": "user",
                        "content": audio_item.get("transcript", "_(Audio processed)_"),
                    })
                st.rerun()
            st.session_state.last_audio_check = datetime.now()
        
    with tab2:
        st.subheader("Your Memory Bank")
        
        # Query interface with improved functionality
        col1, col2 = st.columns([3, 1])
        with col1:
            query_input = st.text_input("Search your memories or ask a question:")
        with col2:
            speak_response = st.checkbox("🔊 Speak answer")
        
        if st.button("Search", type="primary"):
            if query_input.strip():
                with st.spinner("Searching your memories..."):
                    try:
                        # Use the full query pipeline
                        response = process_user_query(query_input, st.session_state.username)
                        
                        st.markdown("### AI Response:")
                        st.write(response["answer"])
                        
                        if response.get("image_url"):
                            st.markdown(f"[View related image]({response['image_url']})")
                        
                        if speak_response:
                            with st.spinner("Generating speech..."):
                                text_to_speech_response(response["answer"], st.session_state.username)
                        
                        # Standardize the history items created from the search
                        st.session_state.conversation_history.append({
                            "role": "user",
                            "content": f"_(Searched for: {query_input})_"
                        })
                        st.session_state.conversation_history.append({
                            "role": "assistant",
                            "content": response["answer"]
                        })
                        
                    except Exception as e:
                        st.error(f"Error searching memories: {str(e)}")
        
    with tab3:
        st.subheader("📊 My Memory Progress")
        
        # Get patient's memory report
        try:
            # Try API endpoint first
            try:
                response = requests.get(f"{BACKEND_API_URL}/memory-report/{st.session_state.username}?days=3", timeout=5)
                if response.status_code == 200:
                    report_data = response.json()
                    report = report_data.get("report", {})
                else:
                    raise Exception("API not available")
            except (requests.exceptions.RequestException, requests.exceptions.Timeout, Exception):
                # Fallback to direct service calls
                st.info("🔄 Using direct service access...")
                response = requests.get(f"{BACKEND_API_URL}/memory-report/{st.session_state.username}?days=3", timeout=5)
                report = response.json().get("report", {})
            
            # Show key metrics
            st.markdown("### Your Memory Performance (Last 3 Days)")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                weighted_avg = report.get("weighted_average", 0)
                if weighted_avg >= 0.7:
                    st.success(f"🎉 **Excellent**: {weighted_avg:.3f}")
                elif weighted_avg >= 0.5:
                    st.info(f"👍 **Good**: {weighted_avg:.3f}")
                else:
                    st.warning(f"📝 **Room for Improvement**: {weighted_avg:.3f}")
                st.write("*Overall Memory Score*")
            
            with col2:
                trend = report.get("trend", "no_data")
                trend_emoji = {"improving": "📈", "deteriorating": "📉", "stable": "➡️", "no_data": "❓"}
                
                if trend == "improving":
                    st.success(f"{trend_emoji[trend]} **Improving**")
                elif trend == "deteriorating":
                    st.warning(f"{trend_emoji[trend]} **Needs Attention**")
                else:
                    st.info(f"{trend_emoji.get(trend, '❓')} **{trend.title()}**")
                st.write("*Trend*")
            
            with col3:
                total_interactions = report.get("total_interactions", 0)
                st.metric("Conversations", total_interactions)
                st.write("*Total Interactions*")
            
            # Progress chart
            daily_data = report.get("daily_averages", [])
            if daily_data:
                st.markdown("### Daily Progress Chart")
                
                # Create DataFrame for plotting
                df = pd.DataFrame(daily_data)
                df['date'] = pd.to_datetime(df['date'])
                
                # Simple line chart
                fig = px.line(df, x='date', y='average_score', 
                            title="Your Memory Progress Over Time",
                            labels={'average_score': 'Memory Score', 'date': 'Date'},
                            markers=True)
                fig.add_hline(y=0.5, line_dash="dash", line_color="gray", 
                            annotation_text="Good baseline")
                fig.update_layout(showlegend=False)
                st.plotly_chart(fig, use_container_width=True)
                
                # Simple table
                st.markdown("### Daily Summary")
                display_df = df.copy()
                display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
                display_df['average_score'] = display_df['average_score'].round(3)
                display_df.columns = ['Date', 'Score', 'Conversations']
                st.dataframe(display_df, use_container_width=True, hide_index=True)
                
                # Encourage patient
                improvement_rate = report.get("improvement_rate", 0)
                if improvement_rate > 5:
                    st.success("🎉 **Great job!** Your memory performance is improving!")
                elif improvement_rate < -5:
                    st.info("💪 **Keep practicing!** Regular interaction helps maintain memory.")
                else:
                    st.info("✨ **You're doing well!** Keep up the good work.")
            
            else:
                st.info("📊 Start having conversations to see your progress here!")
                st.markdown("""
                **Tips to improve your memory score:**
                - Have regular conversations with your AI companion
                - Share daily experiences and activities
                - Ask questions about past memories
                - Practice recalling important information
                """)
        
        except Exception as e:
            st.info("Your progress tracking will be available after your first conversation.")
    
   
def admin_interface():
    """Admin interface for monitoring patients"""
    st.title("🏥 Admin Dashboard")
    
    # Sidebar
    with st.sidebar:
        st.markdown("### Admin Controls")
        st.write(f"**Logged in as:** {st.session_state.user_info['name']}")
        
        st.markdown("---")
        if st.button("Logout"):
            st.session_state.authenticated = False
            st.session_state.user_info = None
            st.rerun()
    
    # Main dashboard tabs
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["📊 Dashboard", "👥 Patients", "🔍 Memory Analysis", "📈 Memory Reports", "✅ Tasks"])
    
    with tab1:
        st.subheader("System Overview")
        
        # Get patient list (excluding admin)
        patients = {k: v for k, v in USER_DATABASE.items() if v["role"] == "patient"}
        
        # Check for alerts
        try:
            # Try API endpoint first
            try:
                response = requests.get(f"{BACKEND_API_URL}/admin/alerts", timeout=5)
                if response.status_code == 200:
                    alerts_data = response.json()
                    alerts = alerts_data.get("alerts", [])
                else:
                    raise Exception("API not available")
            except (requests.exceptions.RequestException, requests.exceptions.Timeout, Exception):
                # Fallback to direct service calls
                st.info("🔄 Backend API unavailable, using direct service access...")
                response = requests.get(f"{BACKEND_API_URL}/admin/alerts", timeout=5)
                alerts = response.json().get("alerts", [])
            
            # Show critical alerts at top
            critical_alerts = [a for a in alerts if a["severity"] == "high"]
            if critical_alerts:
                st.error(f"🚨 {len(critical_alerts)} Critical Alerts Require Attention!")
                for alert in critical_alerts[:3]:  # Show top 3
                    col1, col2 = st.columns([4, 1])
                    with col1:
                        st.warning(f"**{alert['patient_id']}**: {alert['message']}")
                    with col2:
                        if st.button(f"Acknowledge", key=f"ack_{alert['id']}"):
                            # Try API first, then fallback
                            try:
                                ack_response = requests.post(f"{BACKEND_API_URL}/admin/acknowledge-alert/{alert['id']}")
                                if ack_response.status_code == 200:
                                    st.success("Alert acknowledged!")
                                    st.rerun()
                            except:
                                # Direct service fallback
                                st.info("🔄 Using direct service access...")
                                response = requests.post(f"{BACKEND_API_URL}/admin/acknowledge-alert/{alert['id']}")
                                if response.status_code == 200:
                                    st.success("Alert acknowledged!")
                                    st.rerun()
        except Exception as e:
            st.info(f"⚠️ Alert system unavailable: {str(e)}")  # Show info instead of hiding errors
        
        # Overview metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Patients", len(patients))
        
        with col2:
            active_conversations = len([item for item in st.session_state.conversation_history 
                                     if item.get('timestamp') and item.get('timestamp') > datetime.now() - timedelta(days=1)])
            st.metric("Active Today", active_conversations)
        
        with col3:
            total_memories = len(st.session_state.conversation_history)
            st.metric("Total Memories", total_memories)
        
        with col4:
            if st.session_state.conversation_history:
                avg_importance = sum([item.get('analysis', {}).get('importance_score', 0) 
                                    for item in st.session_state.conversation_history 
                                    if item.get('analysis') and "error" not in item.get('analysis', {})]) / total_memories
                st.metric("Avg Importance", f"{avg_importance:.2f}")
            else:
                st.metric("Avg Importance", "0.00")
        
        # Recent activity chart
        if st.session_state.conversation_history:
            st.subheader("Recent Activity")
            
            activity_data = []
            for item in st.session_state.conversation_history:
                # Use the new 'role' key and safe .get() access
                user_or_role = item.get('role', 'unknown')
                # We only want to chart patient activity, not the AI's responses
                if user_or_role != 'assistant':
                    activity_data.append({
                        "Date": item.get('timestamp').date() if item.get('timestamp') else None,
                        "Hour": item.get('timestamp').hour if item.get('timestamp') else None,
                        "Patient": user_or_role, # Use the role as the patient identifier
                        "Importance": item.get('analysis', {}).get('importance_score', 0)
                    })
            
            if activity_data:
                activity_df = pd.DataFrame(activity_data)
                
                # Daily activity chart
                daily_activity = activity_df.groupby(['Date', 'Patient']).size().reset_index(name='Count')
                fig = px.line(daily_activity, x='Date', y='Count', color='Patient', 
                            title="Daily Activity by Patient")
                st.plotly_chart(fig, use_container_width=True)
                
                # Importance distribution
                fig2 = px.histogram(activity_df, x='Importance', nbins=20, 
                                  title="Memory Importance Distribution")
                st.plotly_chart(fig2, use_container_width=True)
    
    with tab2:
        st.subheader("Patient Management")
        
        # Patient selection
        patient_usernames = [k for k, v in USER_DATABASE.items() if v["role"] == "patient"]
        selected_patient = st.selectbox("Select Patient", patient_usernames)
        
        if selected_patient:
            patient_info = USER_DATABASE[selected_patient]
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("### Patient Information")
                st.write(f"**Name:** {patient_info['name']}")
                st.write(f"**Age:** {patient_info.get('age', 'N/A')}")
                st.write(f"**Condition:** {patient_info.get('condition', 'N/A')}")
                st.write(f"**Emergency Contact:** {patient_info.get('emergency_contact', 'N/A')}")
            
            with col2:
                st.markdown("### Activity Summary")
                patient_conversations = [item for item in st.session_state.conversation_history 
                                       if item['user'] == selected_patient]
                
                st.metric("Total Conversations", len(patient_conversations))
                
                if patient_conversations:
                    recent_activity = len([item for item in patient_conversations 
                                         if item['timestamp'] > datetime.now() - timedelta(days=7)])
                    st.metric("Last 7 Days", recent_activity)
                    
                    avg_importance = sum([item.get('analysis', {}).get('importance_score', 0) 
                                        for item in patient_conversations 
                                        if item.get('analysis') and "error" not in item.get('analysis', {})]) / len(patient_conversations)
                    st.metric("Avg Importance", f"{avg_importance:.2f}")
            
            # Patient's recent conversations
            if patient_conversations:
                st.markdown("### Recent Conversations")
                for item in reversed(patient_conversations[-10:]):  # Show last 10
                    with st.expander(f"{item['timestamp'].strftime('%Y-%m-%d %H:%M')} - Importance: {item.get('analysis', {}).get('importance_score', 'N/A') if item.get('analysis') and 'error' not in item.get('analysis', {}) else 'Error'}"):
                        st.write(f"**Message:** {item['message']}")
                        if item.get('analysis') and "error" not in item.get('analysis', {}):
                            st.write(f"**Summary:** {item.get('analysis', {}).get('summary', 'N/A')}")
                            if item.get('analysis', {}).get('entities'):
                                st.write("**Entities:**")
                                for entity in item.get('analysis', {}).get('entities', []):
                                    st.write(f"- {entity.get('name', 'N/A')} ({entity.get('type', 'N/A')})")
    
    with tab3:
        st.subheader("Memory Analysis Tools")
        
        # Global search across all patients
        st.markdown("### Search All Patient Memories")
        search_query = st.text_input("Enter search query:")
        
        if st.button("Search All"):
            if search_query.strip():
                try:
                    results = neptune.query(search_query)
                    if results:
                        st.json(results)
                    else:
                        st.info("No memories found for your query.")
                except Exception as e:
                    st.error(f"Error searching memories: {str(e)}")
        
        # Analysis insights
        if st.session_state.conversation_history:
            st.markdown("### Analysis Insights")
            
            # Most common entities across all patients
            all_entities = []
            for item in st.session_state.conversation_history:
                # Use safe .get() for analysis and entities
                analysis = item.get('analysis', {})
                if analysis and "error" not in analysis and analysis.get('entities'):
                    all_entities.extend([entity.get('name', '') for entity in analysis.get('entities', [])])
            
            if all_entities:
                entity_counts = pd.Series(all_entities).value_counts().head(10)
                st.markdown("#### Most Mentioned Entities")
                st.bar_chart(entity_counts)
            
            # High importance conversations
            high_importance = [item for item in st.session_state.conversation_history 
                             if item.get('analysis') and item.get('analysis', {}).get('importance_score', 0) > 0.7]
            
            if high_importance:
                st.markdown("#### High Importance Conversations (Score > 0.7)")
                for item in high_importance:
                    # Use .get() for safe access to 'user'
                    user = item.get('user', 'Unknown')
                    st.write(f"**{user}** - {item.get('timestamp').strftime('%Y-%m-%d %H:%M') if item.get('timestamp') else ''}")
                    st.write(f"Summary: {item.get('analysis', {}).get('summary', 'N/A')}")
                    st.write(f"Importance: {item.get('analysis', {}).get('importance_score', 'N/A')}")
                    st.write("---")
    
    with tab4:
        st.subheader("Memory Analytics & Reports")
        
        # Patient selection for detailed report
        patient_usernames = [k for k, v in USER_DATABASE.items() if v["role"] == "patient"]
        selected_patient = st.selectbox("Select Patient for Detailed Report", patient_usernames, key="memory_report_patient")
        
        col1, col2 = st.columns([1, 1])
        with col1:
            days_range = st.selectbox("Time Range", [3, 7, 14], index=0, key="days_range")
        with col2:
            if st.button("Generate Report", type="primary"):
                st.session_state.generate_report = True
        
        if selected_patient and (st.session_state.get('generate_report', False) or st.button("Auto Refresh", key="auto_refresh")):
            try:
                # Try API endpoint first
                try:
                    response = requests.get(f"{BACKEND_API_URL}/memory-report/{selected_patient}?days={days_range}", timeout=5)
                    if response.status_code == 200:
                        report_data = response.json()
                        report = report_data.get("report", {})
                        alerts = report_data.get("alerts", [])
                    else:
                        raise Exception("API not available")
                except (requests.exceptions.RequestException, requests.exceptions.Timeout, Exception):
                    # Fallback to direct service calls
                    st.info("🔄 Using direct service access...")
                    response = requests.get(f"{BACKEND_API_URL}/memory-report/{selected_patient}?days={days_range}", timeout=5)
                    report = response.json().get("report", {})
                    alerts = response.json().get("alerts", [])
                    
                # Display key metrics
                st.markdown("### 📊 Key Metrics")
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    weighted_avg = report.get("weighted_average", 0)
                    st.metric("Weighted Average Score", f"{weighted_avg:.3f}")
                
                with col2:
                    trend = report.get("trend", "no_data")
                    trend_emoji = {"improving": "📈", "deteriorating": "📉", "stable": "➡️", "no_data": "❓"}
                    st.metric("Trend", f"{trend_emoji.get(trend, '❓')} {trend.title()}")
                
                with col3:
                    total_interactions = report.get("total_interactions", 0)
                    st.metric("Total Interactions", total_interactions)
                
                with col4:
                    improvement_rate = report.get("improvement_rate", 0)
                    st.metric("Improvement Rate", f"{improvement_rate:+.1f}%")
                
                # Daily progress chart
                daily_data = report.get("daily_averages", [])
                if daily_data:
                    st.markdown("### 📈 Daily Memory Performance")
                    
                    # Create DataFrame for plotting
                    df = pd.DataFrame(daily_data)
                    df['date'] = pd.to_datetime(df['date'])
                    
                    # Line chart
                    fig = px.line(df, x='date', y='average_score', 
                                title=f"Memory Performance Over {days_range} Days",
                                labels={'average_score': 'Memory Score', 'date': 'Date'})
                    fig.add_hline(y=0.5, line_dash="dash", line_color="gray", 
                                annotation_text="Baseline (0.5)")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Bar chart for interaction counts
                    fig2 = px.bar(df, x='date', y='interaction_count',
                                title="Daily Interaction Count",
                                labels={'interaction_count': 'Interactions', 'date': 'Date'})
                    st.plotly_chart(fig2, use_container_width=True)
                    
                    # Data table
                    st.markdown("### 📋 Detailed Daily Report")
                    display_df = df.copy()
                    display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
                    display_df['average_score'] = display_df['average_score'].round(3)
                    display_df.columns = ['Date', 'Memory Score', 'Interactions']
                    st.dataframe(display_df, use_container_width=True, hide_index=True)
                
                # Alerts section
                if alerts:
                    st.markdown("### 🚨 Active Alerts")
                    for alert in alerts:
                        severity_color = {"high": "🔴", "medium": "🟡", "low": "🟢"}
                        st.warning(f"{severity_color.get(alert['severity'], '⚪')} **{alert['alert_type'].replace('_', ' ').title()}**: {alert['message']}")
                
                # Recommendations based on data
                st.markdown("### 💡 Recommendations")
                if weighted_avg < 0.3:
                    st.error("⚠️ **Immediate Attention Required**: Very low memory scores detected. Consider scheduling urgent medical consultation.")
                elif improvement_rate < -15:
                    st.warning("⚠️ **Monitor Closely**: Rapid deterioration detected. Increase monitoring frequency.")
                elif improvement_rate > 10:
                    st.success("✅ **Good Progress**: Patient showing improvement. Continue current treatment plan.")
                else:
                    st.info("ℹ️ **Stable Condition**: Memory performance is stable. Maintain regular monitoring.")
            
            except Exception as e:
                st.error(f"Error generating report: {str(e)}")
        
        # All patients summary
        st.markdown("### 👥 All Patients Summary")
        try:
            # Try API endpoint first
            try:
                response = requests.get(f"{BACKEND_API_URL}/admin/patient-summaries", timeout=5)
                if response.status_code == 200:
                    summaries_data = response.json()
                    summaries = summaries_data.get("summaries", {})
                else:
                    raise Exception("API not available")
            except (requests.exceptions.RequestException, requests.exceptions.Timeout, Exception):
                # Fallback to direct service calls
                st.info("🔄 Backend API unavailable, using direct service access...")
                response = requests.get(f"{BACKEND_API_URL}/admin/patient-summaries", timeout=5)
                summaries = response.json().get("summaries", {})
            
            if summaries:
                # Create summary table
                summary_rows = []
                for patient_id, data in summaries.items():
                    patient_name = USER_DATABASE.get(patient_id, {}).get("name", patient_id)
                    summary_rows.append({
                        "Patient": patient_name,
                        "Weighted Avg": f"{data.get('weighted_average', 0):.3f}",
                        "Trend": data.get('trend', 'no_data').title(),
                        "Improvement": f"{data.get('improvement_rate', 0):+.1f}%",
                        "Interactions": data.get('total_interactions', 0),
                        "Alerts": len(data.get('alerts', []))
                    })
                
                if summary_rows:
                    summary_df = pd.DataFrame(summary_rows)
                    st.dataframe(summary_df, use_container_width=True, hide_index=True)
                    
                    # Comparative chart
                    if len(summary_rows) > 1:
                        fig = px.bar(summary_df, x='Patient', y='Weighted Avg',
                                   title="Patient Memory Scores Comparison",
                                   color='Weighted Avg',
                                   color_continuous_scale='RdYlGn')
                        st.plotly_chart(fig, use_container_width=True)
                else:
                    st.info("No patient data available yet.")
            else:
                st.info("📊 No patient memory data available yet. Start by having patients interact with the system.")
                
        except Exception as e:
            st.error(f"❌ Error loading patient summaries: {str(e)}")
    
    with tab5:
        st.subheader("Manage Patient Tasks")
        
        patient_usernames = [k for k, v in USER_DATABASE.items() if v["role"] == "patient"]
        selected_patient_for_tasks = st.selectbox("Select Patient to Manage Tasks", patient_usernames, key="task_patient_select")

        if selected_patient_for_tasks:
            # --- Display Existing Tasks ---
            st.markdown("#### Upcoming Tasks")
            try:
                response = requests.get(f"{BACKEND_API_URL}/tasks/{selected_patient_for_tasks}")
                response.raise_for_status()
                tasks = response.json()
                
                if not tasks:
                    st.info("No upcoming tasks for this patient.")
                
                for task in tasks:
                    col1, col2 = st.columns([4, 1])
                    with col1:
                        st.write(f"**{task['summary']}** from {task['start_date']} to {task['end_date']}")
                        if task.get('description'):
                            st.caption(task['description'])
                    with col2:
                        is_completed = st.checkbox("Completed", value=task.get('completed', False), key=task['task_id'])
                        if is_completed != task.get('completed', False):
                            requests.post(f"{BACKEND_API_URL}/tasks/complete", json={"patient_id": selected_patient_for_tasks, "task_id": task['task_id']})
                            st.rerun()

            except Exception as e:
                st.error(f"Could not load tasks: {e}")

            # --- Create New Task Form ---
            st.markdown("---")
            st.markdown("#### Add a New Task")
            with st.form("new_task_form"):
                task_summary = st.text_input("Task Summary (e.g., Family Visit)")
                
                col1, col2 = st.columns(2)
                with col1:
                    start_date = st.date_input("Start Date")
                with col2:
                    end_date = st.date_input("End Date")

                task_desc = st.text_area("Description (Optional)")
                
                submitted = st.form_submit_button("Add Task")
                if submitted:
                    if task_summary and start_date and end_date:
                        payload = {
                            "patient_id": selected_patient_for_tasks,
                            "summary": task_summary,
                            "start_date": start_date.isoformat(),
                            "end_date": end_date.isoformat(),
                            "description": task_desc
                        }
                        requests.post(f"{BACKEND_API_URL}/tasks/create", json=payload)
                        st.success(f"Task '{task_summary}' added for {selected_patient_for_tasks}!")
                        st.rerun()
                    else:
                        st.warning("Please provide a summary and schedule for the task.")

def process_user_query(user_input: str, username: str):
    """Process user query through the backend API."""
    try:
        query_data = {"user_id": username, "query": user_input}
        response = requests.post(f"{BACKEND_API_URL}/query", json=query_data, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        st.error(f"Error processing query: {str(e)}")
        return {
            "answer": "I'm sorry, I'm having trouble processing your question right now.",
            "image_url": None,
            "query": user_input
        }

# Calendar detection is now handled by the LLM in the backend with tool calling

def process_text_memory(text: str, username: str):
    """Process and store text as memory via the backend API."""
    try:
        response = requests.post(f"{BACKEND_API_URL}/process-text", 
                                   json={"user_id": username, "text": text}, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        st.error(f"Error processing text memory: {str(e)}")
        return {"error": str(e)}

def process_audio_files(username: str):
    """Checks for new audio files, sends them to backend, and returns results."""
    audios_dir = os.path.join(os.path.dirname(__file__), "audios")
    os.makedirs(audios_dir, exist_ok=True)
    
    processed_results = []
    audio_files = [f for f in os.listdir(audios_dir) if f.startswith(username) and f.endswith('.wav')]
    
    for audio_file in audio_files:
        filepath = os.path.join(audios_dir, audio_file)
        try:
            api_url = f"{BACKEND_API_URL}/process-audio"
            payload = {"user_id": username, "filepath": filepath}
            response = requests.post(api_url, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                transcript = result.get("transcript", "Audio processed")
                processed_results.append({"transcript": transcript, "analysis": result})
                # Backend now deletes the file, so we don't need to os.remove here
            else:
                logger.error(f"Failed to process {filepath}: {response.text}")
        except Exception as e:
            logger.error(f"Error processing {filepath}: {e}")
            
    return processed_results

def text_to_speech_response(text: str, username: str):
    """Call the backend to convert text to speech and play it."""
    try:
        logger.info(f"Requesting TTS for user '{username}' with text: '{text[:50]}...'")
        payload = {"user_id": username, "text": text}
        response = requests.post(f"{BACKEND_API_URL}/text-to-speech",
                                 json=payload,
                                 timeout=30, stream=True)
        response.raise_for_status()  # This will raise an HTTPError for 4xx/5xx responses
        # Use autoplay=True and hide the player with custom CSS
        audio_html = f"""
            <audio autoplay>
                <source src="data:audio/mpeg;base64,{base64.b64encode(response.content).decode()}" type="audio/mpeg">
            </audio>
            """
        st.markdown(audio_html, unsafe_allow_html=True)
        return True
    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
        # Log the detailed error response from the backend
        try:
            error_details = http_err.response.json()
            logger.error(f"Backend validation error: {error_details}")
            st.error(f"Could not generate speech. Details: {error_details.get('detail', 'Unknown validation error')}")
        except json.JSONDecodeError:
            logger.error(f"Backend error response was not valid JSON: {http_err.response.text}")
            st.error("Could not generate speech due to a server error.")
    except Exception as e:
        logger.error(f"An unexpected error occurred during TTS: {e}")
        st.error("An unexpected error occurred while generating speech.")
    return False

def process_image_memory(image_bytes: bytes, filename: str, caption: str, username: str):
    """Sends an image and caption to the backend for processing."""
    try:
        files = {'image': (filename, image_bytes)}
        payload = {'user_id': username, 'caption': caption}
        response = requests.post(f"{BACKEND_API_URL}/process-image", files=files, data=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        st.error(f"Error processing image: {e}")
        return {"error": str(e)}

def main():
    """Main application entry point"""
    init_session_state()
    
    if not st.session_state.authenticated:
        login_page()
    else:
        # Route to appropriate interface based on user role
        if st.session_state.user_info["role"] == "admin":
            admin_interface()
        elif st.session_state.user_info["role"] == "patient":
            patient_interface()
        else:
            st.error("Unknown user role")

if __name__ == "__main__":
    main()
