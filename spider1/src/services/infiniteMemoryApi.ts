const BACKEND_API_URL = "http://localhost:8000";

export interface ProcessTextRequest {
  user_id: string;
  text: string;
}

export interface QueryRequest {
  user_id: string;
  query: string;
}

export interface ProcessAudioRequest {
  user_id: string;
  filepath: string;
}

export interface TextToSpeechRequest {
  text: string;
  user_id: string;
}

export interface CreateTaskRequest {
  patient_id: string;
  summary: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface MarkTaskCompletedRequest {
  patient_id: string;
  task_id: string;
}

export interface MemoryAnalysis {
  importance_score: number;
  summary: string;
  entities: string[];
  sentiment: string;
  topics: string[];
  action_items?: string[];
  urgency_level?: string;
  error?: string;
}

export interface MemoryReport {
  patient_id: string;
  days: number;
  total_interactions: number;
  average_importance: number;
  memory_trends: any[];
  recent_activities: any[];
  sentiment_distribution?: { [key: string]: number };
}

export interface Task {
  task_id: string;
  patient_id: string;
  summary: string;
  description: string;
  start_date: string;
  end_date: string;
  completed: boolean;
  created_at: string;
  priority?: string;
}

class InfiniteMemoryAPI {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_API_URL) {
    this.baseUrl = baseUrl;
    console.log('🔗 InfiniteMemoryAPI initialized with URL:', this.baseUrl);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('🌐 Making request to:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Request failed:', error);
      throw error;
    }
  }

  async processText(request: ProcessTextRequest): Promise<MemoryAnalysis> {
    console.log('📝 Processing text:', request.text);
    return this.makeRequest('/process-text', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async query(request: QueryRequest): Promise<{ answer: string; context: any }> {
    console.log('🔍 Querying memory:', request.query);
    return this.makeRequest('/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async processAudio(request: ProcessAudioRequest): Promise<MemoryAnalysis> {
    console.log('🎵 Processing audio:', request.filepath);
    return this.makeRequest('/process-audio', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async processImage(
    userId: string,
    image: File,
    caption: string = ""
  ): Promise<MemoryAnalysis> {
    console.log('🖼️ Processing image for user:', userId);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('caption', caption);
    formData.append('image', image);

    const response = await fetch(`${this.baseUrl}/process-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Image processing error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Image processing result:', data);
    return data;
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<Blob> {
    console.log('🔊 Converting text to speech:', request.text);
    const response = await fetch(`${this.baseUrl}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async getMemoryReport(patientId: string, days: number = 3): Promise<MemoryReport> {
    console.log('📊 Getting memory report for:', patientId, 'days:', days);
    return this.makeRequest(`/memory-report/${patientId}?days=${days}`);
  }

  async createTask(request: CreateTaskRequest): Promise<Task> {
    console.log('📋 Creating task:', request.summary);
    return this.makeRequest('/tasks/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getTasks(patientId: string): Promise<Task[]> {
    console.log('📋 Getting tasks for:', patientId);
    return this.makeRequest(`/tasks/${patientId}`);
  }

  async completeTask(request: MarkTaskCompletedRequest): Promise<void> {
    console.log('✅ Completing task:', request.task_id);
    await this.makeRequest('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAdminAlerts(): Promise<any[]> {
    console.log('🚨 Getting admin alerts');
    return this.makeRequest('/admin/alerts');
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    console.log('✅ Acknowledging alert:', alertId);
    await this.makeRequest(`/admin/acknowledge-alert/${alertId}`, {
      method: 'POST',
    });
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing backend connection...');
      const response = await this.makeRequest('/');
      console.log('✅ Backend connection successful:', response);
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  }
}

export const infiniteMemoryAPI = new InfiniteMemoryAPI();
export default infiniteMemoryAPI;
 