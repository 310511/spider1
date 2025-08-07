import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteMemory } from '@/contexts/InfiniteMemoryContext';
import { infiniteMemoryAPI } from '@/services/infiniteMemoryApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle, Circle, Brain, MessageSquare, Image, Mic, Loader2, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';

export function InfiniteMemoryDashboard() {
  const { state, processText, queryMemory, processImage, createTask, completeTask, loadTasks, loadMemoryReport, setUserId, clearError } = useInfiniteMemory();
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
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set a default user ID for demo purposes
    if (!state.currentUserId) {
      setUserId('demo-user-1');
    }
    
    // Test backend connection
    testBackendConnection();
    
    // Load initial data
    loadTasks();
    loadMemoryReport();
  }, [state.currentUserId]);

  const testBackendConnection = async () => {
    setBackendStatus('testing');
    try {
      const isConnected = await infiniteMemoryAPI.testConnection();
      setBackendStatus(isConnected ? 'connected' : 'disconnected');
      console.log('🔗 Backend connection test result:', isConnected);
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('❌ Backend connection test failed:', error);
    }
  };

  const handleProcessText = async () => {
    if (!inputText.trim()) return;
    
    console.log('📝 Processing text:', inputText);
    await processText(inputText);
    setInputText('');
  };

  const handleQueryMemory = async () => {
    if (!queryText.trim()) return;
    
    console.log('🔍 Querying memory:', queryText);
    await queryMemory(queryText);
    setQueryText('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;
    await processImage(selectedImage, imageCaption);
    setSelectedImage(null);
    setImageCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.summary || !newTask.start_date || !newTask.end_date) return;
    await createTask(newTask);
    setNewTask({
      summary: '',
      description: '',
      start_date: '',
      end_date: '',
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const getImportanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Infinite Memory</h1>
            <p className="text-muted-foreground">AI Cognitive Companion</p>
          </div>
        </div>
        
        {/* Backend Status Indicator */}
        <div className="flex items-center space-x-2">
          {backendStatus === 'connected' ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : backendStatus === 'disconnected' ? (
            <WifiOff className="h-5 w-5 text-red-500" />
          ) : (
            <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
          )}
          <span className={`text-sm font-medium ${
            backendStatus === 'connected' ? 'text-green-600' : 
            backendStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            Backend {backendStatus}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testBackendConnection}
            disabled={backendStatus === 'testing'}
          >
            Test Connection
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="memory-query">Memory Query</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Conversation Tab */}
        <TabsContent value="conversation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Process New Information</span>
              </CardTitle>
              <CardDescription>
                Share information with your AI companion to build your memory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
                <Button 
                  onClick={handleProcessText} 
                  disabled={state.isLoading || backendStatus !== 'connected'}
                  className="self-end"
                >
                  {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Process'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={backendStatus !== 'connected'}
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
                    <Input
                      placeholder="Image caption..."
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      className="w-48"
                    />
                    <Button onClick={handleProcessImage} size="sm">
                      Process
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conversation History */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {state.conversationHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No conversation history yet. Start by processing some information!
                    </p>
                  ) : (
                    state.conversationHistory.map((entry) => (
                      <div key={entry.id} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
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
                              <Badge 
                                variant="secondary" 
                                className={getImportanceColor(entry.analysis.importance_score)}
                              >
                                {Math.round(entry.analysis.importance_score * 100)}% Important
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{entry.content}</p>
                          {entry.analysis && (
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <span>Sentiment:</span>
                                <span className={getSentimentColor(entry.analysis.sentiment)}>
                                  {entry.analysis.sentiment}
                                </span>
                                {entry.analysis.urgency_level && entry.analysis.urgency_level !== 'normal' && (
                                  <Badge variant="destructive" className="text-xs">
                                    {entry.analysis.urgency_level} urgency
                                  </Badge>
                                )}
                              </div>
                              {entry.analysis.topics && entry.analysis.topics.length > 0 && (
                                <div>
                                  <span>Topics: </span>
                                  <span>{entry.analysis.topics.join(', ')}</span>
                                </div>
                              )}
                              {entry.analysis.action_items && entry.analysis.action_items.length > 0 && (
                                <div>
                                  <span>Actions: </span>
                                  <span>{entry.analysis.action_items.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Query Tab */}
        <TabsContent value="memory-query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Query Memory</CardTitle>
              <CardDescription>
                Ask questions about your stored information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask about your memory..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleQueryMemory}
                  disabled={state.isLoading || backendStatus !== 'connected'}
                >
                  {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Query'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Task summary"
                  value={newTask.summary}
                  onChange={(e) => setNewTask({ ...newTask, summary: e.target.value })}
                />
                <Input
                  placeholder="Start date (YYYY-MM-DD)"
                  value={newTask.start_date}
                  onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="flex space-x-2">
                <Input
                  placeholder="End date (YYYY-MM-DD)"
                  value={newTask.end_date}
                  onChange={(e) => setNewTask({ ...newTask, end_date: e.target.value })}
                />
                <Button 
                  onClick={handleCreateTask}
                  disabled={state.isLoading || backendStatus !== 'connected'}
                >
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tasks yet. Create your first task!
                  </p>
                ) : (
                  state.tasks.map((task) => (
                    <div key={task.task_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{task.summary}</h3>
                          {task.priority && (
                            <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>{task.start_date} - {task.end_date}</span>
                          <span>{task.completed ? 'Completed' : 'Pending'}</span>
                        </div>
                      </div>
                      {!task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteTask(task.task_id)}
                          disabled={state.isLoading || backendStatus !== 'connected'}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {state.memoryReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{state.memoryReport.total_interactions}</div>
                      <div className="text-sm text-muted-foreground">Total Interactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(state.memoryReport.average_importance * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Importance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{state.memoryReport.days}</div>
                      <div className="text-sm text-muted-foreground">Days Analyzed</div>
                    </div>
                  </div>
                  
                  {state.memoryReport.sentiment_distribution && (
                    <div>
                      <h4 className="font-medium mb-2">Sentiment Distribution</h4>
                      <div className="flex space-x-4">
                        {Object.entries(state.memoryReport.sentiment_distribution).map(([sentiment, count]) => (
                          <div key={sentiment} className="text-center">
                            <div className="text-lg font-semibold">{count}</div>
                            <div className="text-sm text-muted-foreground capitalize">{sentiment}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No analytics data available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 