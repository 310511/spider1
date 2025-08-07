import React, { useState } from 'react';
import { infiniteMemoryAPI } from '@/services/infiniteMemoryApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TestConnection() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testText, setTestText] = useState('i am not being able to remember anythinnng');
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnection = async () => {
    setIsLoading(true);
    addResult('🧪 Testing backend connection...');
    
    try {
      const isConnected = await infiniteMemoryAPI.testConnection();
      addResult(`✅ Backend connection: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      addResult(`❌ Backend connection failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTextProcessing = async () => {
    setIsLoading(true);
    addResult(`📝 Testing text processing: "${testText}"`);
    
    try {
      const result = await infiniteMemoryAPI.processText({
        user_id: 'demo-user-1',
        text: testText
      });
      
      addResult(`✅ Text processing result:`);
      addResult(`   - Sentiment: ${result.sentiment}`);
      addResult(`   - Importance: ${Math.round(result.importance_score * 100)}%`);
      addResult(`   - Urgency: ${result.urgency_level}`);
      addResult(`   - Summary: ${result.summary}`);
    } catch (error) {
      addResult(`❌ Text processing failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMemoryQuery = async () => {
    setIsLoading(true);
    addResult('🔍 Testing memory query...');
    
    try {
      const result = await infiniteMemoryAPI.query({
        user_id: 'demo-user-1',
        query: 'What should I do about my memory problems?'
      });
      
      addResult(`✅ Memory query result:`);
      addResult(`   - Answer: ${result.answer}`);
      addResult(`   - Context: ${JSON.stringify(result.context)}`);
    } catch (error) {
      addResult(`❌ Memory query failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMemoryReport = async () => {
    setIsLoading(true);
    addResult('📊 Testing memory report...');
    
    try {
      const result = await infiniteMemoryAPI.getMemoryReport('demo-user-1', 3);
      
      addResult(`✅ Memory report result:`);
      addResult(`   - Total interactions: ${result.total_interactions}`);
      addResult(`   - Average importance: ${Math.round(result.average_importance * 100)}%`);
      if (result.sentiment_distribution) {
        addResult(`   - Sentiment distribution: ${JSON.stringify(result.sentiment_distribution)}`);
      }
    } catch (error) {
      addResult(`❌ Memory report failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Infinite Memory Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={testBackendConnection} disabled={isLoading}>
              Test Connection
            </Button>
            <Button onClick={testTextProcessing} disabled={isLoading}>
              Test Text Processing
            </Button>
            <Button onClick={testMemoryQuery} disabled={isLoading}>
              Test Memory Query
            </Button>
            <Button onClick={testMemoryReport} disabled={isLoading}>
              Test Memory Report
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Text:</label>
            <Input
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test..."
            />
          </div>
          
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Test Results:</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 