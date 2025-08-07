import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteMemory } from '@/contexts/InfiniteMemoryContext';
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
import { Calendar, Clock, CheckCircle, Circle, Brain, MessageSquare, Image, Mic, Loader2 } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set a default user ID for demo purposes
    if (!state.currentUserId) {
      setUserId('demo-user-1');
    }
    
    // Load initial data
    loadTasks();
    loadMemoryReport();
  }, [state.currentUserId]);

  const handleProcessText = async () => {
    if (!inputText.trim()) return;
    await processText(inputText);
    setInputText('');
  };

  const handleQueryMemory = async () => {
    if (!queryText.trim()) return;
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
        <Badge variant={state.currentUserId ? "default" : "destructive"}>
          {state.currentUserId ? `User: ${state.currentUserId}` : 'No User Set'}
        </Badge>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

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
                Share information with your AI companion to build your memory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleProcessText()}
                  disabled={state.isLoading}
                />
                <Button onClick={handleProcessText} disabled={state.isLoading || !inputText.trim()}>
                  {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Process'}
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={state.isLoading}
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
                    <Button onClick={handleProcessImage} disabled={state.isLoading}>
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
                  {state.conversationHistory.map((entry) => (
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
                Ask questions about your stored memories and get AI-powered answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask about your memories..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQueryMemory()}
                  disabled={state.isLoading}
                />
                <Button onClick={handleQueryMemory} disabled={state.isLoading || !queryText.trim()}>
                  {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Query'}
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
              <Button onClick={handleCreateTask} disabled={!newTask.summary || !newTask.start_date || !newTask.end_date}>
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
                {state.tasks.map((task) => (
                  <div key={task.task_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCompleteTask(task.task_id)}
                        disabled={task.completed}
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
                {state.tasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No tasks created yet. Create your first task above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Analytics</CardTitle>
              <CardDescription>
                Track your memory patterns and cognitive health
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.memoryReport ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{state.memoryReport.total_interactions}</p>
                      <p className="text-sm text-muted-foreground">Total Interactions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {Math.round(state.memoryReport.average_importance * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Importance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{state.memoryReport.days}</p>
                      <p className="text-sm text-muted-foreground">Days Tracked</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Memory Trends</h4>
                    <div className="space-y-2">
                      {state.memoryReport.memory_trends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{trend.date}</span>
                          <Progress value={trend.score * 100} className="w-32" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No memory data available yet. Start using the system to see analytics.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 