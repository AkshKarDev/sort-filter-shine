
import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import DataVisualization from '../components/DataVisualization';
import { sampleData } from '../data/sampleData';
import { DataItem, ChatMessage, DataFilters, SortConfig, GroupConfig } from '../types/types';

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your data assistant. I can help you sort, filter, highlight, and group your data. Try commands like 'sort by name', 'filter status active', 'highlight John', or 'group by department'.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  
  const [data, setData] = useState<DataItem[]>(sampleData);
  const [filters, setFilters] = useState<DataFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(null);
  const [highlightText, setHighlightText] = useState<string>('');

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Sort commands
    if (lowerCommand.includes('sort by')) {
      const field = lowerCommand.split('sort by ')[1]?.split(' ')[0];
      const direction = lowerCommand.includes('desc') || lowerCommand.includes('descending') ? 'desc' : 'asc';
      
      if (field) {
        setSortConfig({ field: field as keyof DataItem, direction });
        return `Sorted data by ${field} in ${direction}ending order.`;
      }
    }
    
    // Filter commands
    if (lowerCommand.includes('filter')) {
      const parts = lowerCommand.split('filter ')[1];
      if (parts) {
        const [field, value] = parts.split(' ');
        if (field && value) {
          setFilters(prev => ({ ...prev, [field]: value }));
          return `Filtered data where ${field} contains "${value}".`;
        }
      }
    }
    
    // Highlight commands
    if (lowerCommand.includes('highlight')) {
      const text = lowerCommand.split('highlight ')[1];
      if (text) {
        setHighlightText(text);
        return `Highlighting text: "${text}".`;
      }
    }
    
    // Group commands
    if (lowerCommand.includes('group by')) {
      const field = lowerCommand.split('group by ')[1]?.split(' ')[0];
      if (field) {
        setGroupConfig({ field: field as keyof DataItem });
        return `Grouped data by ${field}.`;
      }
    }
    
    // Clear commands
    if (lowerCommand.includes('clear') || lowerCommand.includes('reset')) {
      setFilters({});
      setSortConfig(null);
      setGroupConfig(null);
      setHighlightText('');
      return 'Cleared all filters, sorting, grouping, and highlighting.';
    }
    
    // Help command
    if (lowerCommand.includes('help')) {
      return 'Available commands:\n• sort by [field] [asc/desc]\n• filter [field] [value]\n• highlight [text]\n• group by [field]\n• clear/reset - clear all operations\n\nFields available: name, email, department, status, salary';
    }
    
    return "I didn't understand that command. Type 'help' to see available commands.";
  };

  const handleSendMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the command
    const response = processCommand(text);
    
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: response,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        <header className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Data Management Chatbot
          </h1>
          <p className="text-gray-600 mt-2">
            Sort, filter, highlight, and group your data with natural language commands
          </p>
        </header>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <div className="flex flex-col">
            <ChatInterface 
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
          
          <div className="flex flex-col">
            <DataVisualization
              data={data}
              filters={filters}
              sortConfig={sortConfig}
              groupConfig={groupConfig}
              highlightText={highlightText}
              onFiltersChange={setFilters}
              onSortChange={setSortConfig}
              onGroupChange={setGroupConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
