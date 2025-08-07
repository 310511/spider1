import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare, Calendar, BarChart3 } from 'lucide-react';

export function InfiniteMemoryNav() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <span>Infinite Memory</span>
        </CardTitle>
        <CardDescription>
          AI Cognitive Companion - Your personal memory assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <span>Conversation</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Brain className="h-4 w-4 text-blue-600" />
            <span>Memory Query</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Task Management</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <BarChart3 className="h-4 w-4 text-orange-600" />
            <span>Analytics</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link to="/infinite-memory">
            <Button className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Open Infinite Memory
            </Button>
          </Link>
          <Link to="/infinite-memory-demo">
            <Button variant="outline" className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Try Demo Version
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Process conversations, images, and queries with AI-powered memory assistance
        </p>
      </CardContent>
    </Card>
  );
} 