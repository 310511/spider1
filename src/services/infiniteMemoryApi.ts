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
  error?: string;
}

export interface MemoryReport {
  patient_id: string;
  days: number;
  total_interactions: number;
  average_importance: number;
  memory_trends: any[];
  recent_activities: any[];
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
}

class InfiniteMemoryAPI {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_API_URL) {
    this.baseUrl = baseUrl;
  }

  async processText(request: ProcessTextRequest): Promise<MemoryAnalysis> {
    const response = await fetch(`${this.baseUrl}/process-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async query(request: QueryRequest): Promise<{ answer: string; context: any }> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async processAudio(request: ProcessAudioRequest): Promise<MemoryAnalysis> {
    const response = await fetch(`${this.baseUrl}/process-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async processImage(
    userId: string,
    image: File,
    caption: string = ""
  ): Promise<MemoryAnalysis> {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('caption', caption);
    formData.append('image', image);

    const response = await fetch(`${this.baseUrl}/process-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<Blob> {
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
    const response = await fetch(`${this.baseUrl}/memory-report/${patientId}?days=${days}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createTask(request: CreateTaskRequest): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTasks(patientId: string): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/tasks/${patientId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async completeTask(request: MarkTaskCompletedRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async getAdminAlerts(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/admin/alerts`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/acknowledge-alert/${alertId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

export const infiniteMemoryAPI = new InfiniteMemoryAPI();
export default infiniteMemoryAPI;
 