import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle, Circle, Brain, MessageSquare, Image, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for demonstration
const mockConversationHistory = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: 'user' as const,
    content: 'I need to remember to take my medication at 9 AM tomorrow',
    analysis: {
      importance_score: 0.9,
      summary: 'High priority medication reminder identified',
      sentiment: 'neutral',
      topics: ['medication', 'health', 'reminder'],
      entities: ['medication', '9 AM', 'tomorrow']
    }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    type: 'ai' as const,
    content: 'I\'ve recorded your medication reminder for tomorrow at 9 AM. This is marked as high priority due to its importance for your health.',
    analysis: {
      importance_score: 0.9,
      summary: 'Confirmed medication reminder creation',
      sentiment: 'positive',
      topics: ['medication', 'health', 'reminder'],
      entities: ['medication', '9 AM', 'tomorrow']
    }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    type: 'user' as const,
    content: 'My daughter Sarah is coming to visit this weekend',
    analysis: {
      importance_score: 0.7,
      summary: 'Family visit information recorded',
      sentiment: 'positive',
      topics: ['family', 'visit', 'weekend'],
      entities: ['Sarah', 'daughter', 'weekend']
    }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    type: 'ai' as const,
    content: 'That\'s wonderful! I\'ve noted that Sarah, your daughter, is visiting this weekend. I\'ll remind you about this when the weekend approaches.',
    analysis: {
      importance_score: 0.7,
      summary: 'Acknowledged family visit reminder',
      sentiment: 'positive',
      topics: ['family', 'visit', 'weekend'],
      entities: ['Sarah', 'daughter', 'weekend']
    }
  }
];

const mockTasks = [
  {
    task_id: '1',
    patient_id: 'demo-user-1',
    summary: 'Take medication',
    description: 'Blood pressure medication - 1 tablet',
    start_date: '2024-01-15',
    end_date: '2024-01-15',
    completed: false,
    created_at: '2024-01-14T10:00:00Z'
  },
  {
    task_id: '2',
    patient_id: 'demo-user-1',
    summary: 'Doctor appointment',
    description: 'Annual checkup with Dr. Smith',
    start_date: '2024-01-16',
    end_date: '2024-01-16',
    completed: false,
    created_at: '2024-01-14T11:00:00Z'
  },
  {
    task_id: '3',
    patient_id: 'demo-user-1',
    summary: 'Call pharmacy',
    description: 'Refill prescription for diabetes medication',
    start_date: '2024-01-14',
    end_date: '2024-01-14',
    completed: true,
    created_at: '2024-01-13T09:00:00Z'
  }
];

const mockMemoryReport = {
  patient_id: 'demo-user-1',
  days: 7,
  total_interactions: 24,
  average_importance: 0.75,
  memory_trends: [
    { date: '2024-01-08', score: 0.6 },
    { date: '2024-01-09', score: 0.7 },
    { date: '2024-01-10', score: 0.8 },
    { date: '2024-01-11', score: 0.75 },
    { date: '2024-01-12', score: 0.85 },
    { date: '2024-01-13', score: 0.9 },
    { date: '2024-01-14', score: 0.8 }
  ],
  recent_activities: [
    'Medication reminder created',
    'Family visit noted',
    'Doctor appointment scheduled'
  ]
};

export function InfiniteMemoryDemo() {
  const [inputText, setInputText] = useState('');
  const [queryText, setQueryText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [newTask, setNewTask] = useState({
    summary: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [activeTab, setActiveTab] = useState('conversation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState(mockConversationHistory);
  const [tasks, setTasks] = useState(mockTasks);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleProcessText = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'user' as const,
      content: inputText,
      analysis: {
        importance_score: Math.random() * 0.5 + 0.3, // Random importance between 0.3-0.8
        summary: 'Processed user input',
        sentiment: 'neutral',
        topics: ['general'],
        entities: []
      }
    };
    
    // Add AI response
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      timestamp: new Date(),
      type: 'ai' as const,
      content: `I've processed your message: "${inputText}". This information has been stored in your memory for future reference.`,
      analysis: {
        importance_score: userMessage.analysis.importance_score,
        summary: 'Acknowledged user input',
        sentiment: 'positive',
        topics: ['general'],
        entities: []
      }
    };
    
    setConversationHistory(prev => [...prev, userMessage, aiResponse]);
    setInputText('');
    setIsProcessing(false);
  };

  const handleQueryMemory = async () => {
    if (!queryText.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add user query
    const userQuery = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'user' as const,
      content: queryText,
    };
    
    // Add AI response
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      timestamp: new Date(),
      type: 'ai' as const,
      content: `Based on your stored memories, here's what I found about "${queryText}": This appears to be a new query. I'll search through your memory database for relevant information.`,
    };
    
    setConversationHistory(prev => [...prev, userQuery, aiResponse]);
    setQueryText('');
    setIsProcessing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiResponse = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'ai' as const,
      content: `I've processed the image "${selectedImage.name}"${imageCaption ? ` with caption: "${imageCaption}"` : ''}. The image has been analyzed and stored in your memory.`,
      analysis: {
        importance_score: 0.6,
        summary: 'Image processed and stored',
        sentiment: 'neutral',
        topics: ['image', 'memory'],
        entities: []
      }
    };
    
    setConversationHistory(prev => [...prev, aiResponse]);
    setSelectedImage(null);
    setImageCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsProcessing(false);
  };

  const handleCreateTask = async () => {
    if (!newTask.summary || !newTask.start_date || !newTask.end_date) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newTaskItem = {
      task_id: Date.now().toString(),
      patient_id: 'demo-user-1',
      summary: newTask.summary,
      description: newTask.description,
      start_date: newTask.start_date,
      end_date: newTask.end_date,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, newTaskItem]);
    setNewTask({
      summary: '',
      description: '',
      start_date: '',
      end_date: '',
    });
    setIsProcessing(false);
  };

  const handleCompleteTask = async (taskId: string) => {
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTasks(prev => prev.map(task =>
      task.task_id === taskId ? { ...task, completed: true } : task
    ));
    setIsProcessing(false);
  };

  const getImportanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Infinite Memory</h1>
            <p className="text-muted-foreground">AI Cognitive Companion (Demo Mode)</p>
          </div>
        </div>
        <Badge variant="secondary">
          Demo Mode - Mock Data
        </Badge>
      </div>

      <Alert>
        <AlertDescription>
          This is a demonstration of the Infinite Memory integration. The backend is not connected, so all data is simulated.
          Follow the setup guide to connect the real backend.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="memory">Memory Query</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Process New Information</span>
              </CardTitle>
              <CardDescription>
                Share information with your AI companion to build your memory (Demo)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleProcessText()}
                  disabled={isProcessing}
                />
                <Button onClick={handleProcessText} disabled={isProcessing || !inputText.trim()}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Process'}
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {selectedImage && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedImage.name}
                    </span>
                    <Input
                      placeholder="Image caption (optional)"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      className="w-48"
                    />
                    <Button onClick={handleProcessImage} disabled={isProcessing}>
                      Process
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {conversationHistory.map((entry) => (
                    <div key={entry.id} className="flex space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {entry.type === 'user' ? 'U' : 'AI'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {entry.type === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(entry.timestamp, 'HH:mm')}
                          </span>
                          {entry.analysis && (
                            <Badge className={getImportanceColor(entry.analysis.importance_score)}>
                              {Math.round(entry.analysis.importance_score * 100)}% Important
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{entry.content}</p>
                        {entry.analysis && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>Sentiment: {entry.analysis.sentiment}</div>
                            <div>Topics: {entry.analysis.topics.join(', ')}</div>
                            {entry.analysis.entities.length > 0 && (
                              <div>Entities: {entry.analysis.entities.join(', ')}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Query Your Memory</span>
              </CardTitle>
              <CardDescription>
                Ask questions about your stored memories and get AI-powered answers (Demo)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask about your memories..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQueryMemory()}
                  disabled={isProcessing}
                />
                <Button onClick={handleQueryMemory} disabled={isProcessing || !queryText.trim()}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Query'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Create New Task</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Task summary"
                  value={newTask.summary}
                  onChange={(e) => setNewTask({ ...newTask, summary: e.target.value })}
                />
                <Input
                  type="date"
                  value={newTask.start_date}
                  onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Textarea
                  placeholder="Task description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <Input
                  type="date"
                  value={newTask.end_date}
                  onChange={(e) => setNewTask({ ...newTask, end_date: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateTask} disabled={!newTask.summary || !newTask.start_date || !newTask.end_date || isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Task
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.task_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCompleteTask(task.task_id)}
                        disabled={task.completed || isProcessing}
                      >
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.summary}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{task.start_date} - {task.end_date}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={task.completed ? "secondary" : "default"}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Analytics</CardTitle>
              <CardDescription>
                Track your memory patterns and cognitive health (Demo Data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{mockMemoryReport.total_interactions}</p>
                    <p className="text-sm text-muted-foreground">Total Interactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {Math.round(mockMemoryReport.average_importance * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Importance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{mockMemoryReport.days}</p>
                    <p className="text-sm text-muted-foreground">Days Tracked</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Memory Trends</h4>
                  <div className="space-y-2">
                    {mockMemoryReport.memory_trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{trend.date}</span>
                        <Progress value={trend.score * 100} className="w-32" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 