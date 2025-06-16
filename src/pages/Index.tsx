import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import DataVisualization from '../components/DataVisualization';
import { sampleData } from '../data/sampleData';
import { DataItem, ChatMessage, DataFilters, SortConfig, GroupConfig } from '../types/types';

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your data assistant. I can help you sort, filter, highlight, and group your data. Try commands like 'sort by name', 'filter status active', 'highlight John', or 'group by department'. I'll auto-correct common typos and variations!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  
  const [data, setData] = useState<DataItem[]>(sampleData);
  const [filters, setFilters] = useState<DataFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(null);
  const [highlightText, setHighlightText] = useState<string>('');

  // Auto-correction mappings
  const commandCorrections = {
    // Sort variations
    'sort': ['srot', 'sorrt', 'sotr', 'stort'],
    'order': ['ordr', 'oder', 'ordder'],
    'arrange': ['arange', 'arrage'],
    
    // Filter variations
    'filter': ['filtr', 'filtter', 'fliter', 'fiter'],
    'search': ['serch', 'searh', 'seach'],
    'find': ['fnd', 'fin'],
    
    // Highlight variations
    'highlight': ['hilite', 'hilight', 'highlght', 'highligt'],
    'mark': ['makr', 'mrak'],
    
    // Group variations
    'group': ['grp', 'gropu', 'grup'],
    'category': ['categry', 'catagory', 'catgory'],
    
    // Clear variations
    'clear': ['cler', 'clr', 'claer'],
    'reset': ['rese', 'rst', 'resset'],
    'remove': ['remov', 'rmv'],
    
    // Field name corrections
    'name': ['nam', 'nme', 'names'],
    'email': ['emai', 'mail', 'emails'],
    'department': ['dept', 'dep', 'depart', 'departmnt'],
    'status': ['stat', 'staus', 'sttus'],
    'salary': ['sal', 'salar', 'salry'],
    
    // Direction corrections
    'ascending': ['asc', 'acending', 'asending'],
    'descending': ['desc', 'desending', 'decending'],
    'active': ['activ', 'actve'],
    'inactive': ['inactiv', 'inactve']
  };

  const autoCorrectCommand = (command: string): { corrected: string; corrections: string[] } => {
    let correctedCommand = command.toLowerCase();
    const appliedCorrections: string[] = [];

    // Apply corrections
    Object.entries(commandCorrections).forEach(([correct, variations]) => {
      variations.forEach(variation => {
        const regex = new RegExp(`\\b${variation}\\b`, 'gi');
        if (regex.test(correctedCommand)) {
          correctedCommand = correctedCommand.replace(regex, correct);
          appliedCorrections.push(`"${variation}" → "${correct}"`);
        }
      });
    });

    return { corrected: correctedCommand, corrections: appliedCorrections };
  };

  const processCommand = (command: string) => {
    const { corrected: correctedCommand, corrections } = autoCorrectCommand(command);
    const lowerCommand = correctedCommand;
    
    let correctionMessage = '';
    if (corrections.length > 0) {
      correctionMessage = `✓ Auto-corrected: ${corrections.join(', ')}\n\n`;
    }
    
    // Sort commands
    if (lowerCommand.includes('sort by') || lowerCommand.includes('order by') || lowerCommand.includes('arrange by')) {
      const sortMatch = lowerCommand.match(/(?:sort|order|arrange) by (\w+)/);
      const field = sortMatch?.[1];
      const direction = lowerCommand.includes('desc') || lowerCommand.includes('descending') ? 'desc' : 'asc';
      
      if (field) {
        setSortConfig({ field: field as keyof DataItem, direction });
        return `${correctionMessage}Sorted data by ${field} in ${direction}ending order.`;
      }
    }
    
    // Filter commands
    if (lowerCommand.includes('filter') || lowerCommand.includes('search') || lowerCommand.includes('find')) {
      const filterMatch = lowerCommand.match(/(?:filter|search|find) (\w+) (\w+)/);
      if (filterMatch) {
        const [, field, value] = filterMatch;
        setFilters(prev => ({ ...prev, [field]: value }));
        return `${correctionMessage}Filtered data where ${field} contains "${value}".`;
      }
    }
    
    // Highlight commands
    if (lowerCommand.includes('highlight') || lowerCommand.includes('mark')) {
      const highlightMatch = lowerCommand.match(/(?:highlight|mark) (.+)/);
      const text = highlightMatch?.[1];
      if (text) {
        setHighlightText(text);
        return `${correctionMessage}Highlighting text: "${text}".`;
      }
    }
    
    // Group commands
    if (lowerCommand.includes('group by') || lowerCommand.includes('category by')) {
      const groupMatch = lowerCommand.match(/(?:group|category) by (\w+)/);
      const field = groupMatch?.[1];
      if (field) {
        setGroupConfig({ field: field as keyof DataItem });
        return `${correctionMessage}Grouped data by ${field}.`;
      }
    }
    
    // Clear commands
    if (lowerCommand.includes('clear') || lowerCommand.includes('reset') || lowerCommand.includes('remove all')) {
      setFilters({});
      setSortConfig(null);
      setGroupConfig(null);
      setHighlightText('');
      return `${correctionMessage}Cleared all filters, sorting, grouping, and highlighting.`;
    }
    
    // Help command
    if (lowerCommand.includes('help')) {
      return `${correctionMessage}Available commands:\n• sort by [field] [asc/desc]\n• filter [field] [value]\n• highlight [text]\n• group by [field]\n• clear/reset - clear all operations\n\nFields available: name, email, department, status, salary\n\nI can auto-correct common typos and variations!`;
    }
    
    // Enhanced error message with suggestions
    const suggestions = [
      "Try: 'sort by name'",
      "Try: 'filter status active'", 
      "Try: 'highlight john'",
      "Try: 'group by department'",
      "Try: 'clear' to reset everything"
    ];
    
    return `${correctionMessage}I didn't understand that command. ${suggestions[Math.floor(Math.random() * suggestions.length)]} or type 'help' to see all available commands.`;
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
            Sort, filter, highlight, and group your data with natural language commands (with auto-correction!)
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
