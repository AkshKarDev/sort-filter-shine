
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataItem, DataFilters, SortConfig, GroupConfig } from '../types/types';

interface DataVisualizationProps {
  data: DataItem[];
  filters: DataFilters;
  sortConfig: SortConfig | null;
  groupConfig: GroupConfig | null;
  highlightText: string;
  onFiltersChange: (filters: DataFilters) => void;
  onSortChange: (config: SortConfig | null) => void;
  onGroupChange: (config: GroupConfig | null) => void;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  filters,
  sortConfig,
  groupConfig,
  highlightText,
  onFiltersChange,
  onSortChange,
  onGroupChange,
}) => {
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value) {
        result = result.filter(item => 
          String(item[field as keyof DataItem]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.field];
        const bVal = b[sortConfig.field];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortConfig]);

  const groupedData = useMemo(() => {
    if (!groupConfig) return { ungrouped: processedData };

    return processedData.reduce((groups, item) => {
      const groupKey = String(item[groupConfig.field]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, DataItem[]>);
  }, [processedData, groupConfig]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  const handleSort = (field: keyof DataItem) => {
    if (sortConfig?.field === field) {
      onSortChange({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      onSortChange({ field, direction: 'asc' });
    }
  };

  const getSortIcon = (field: keyof DataItem) => {
    if (sortConfig?.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <Card className="flex flex-col h-full shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
        <h3 className="font-semibold">Data Table ({processedData.length} items)</h3>
        <div className="flex gap-2 mt-2 flex-wrap">
          {Object.entries(filters).map(([field, value]) => (
            value && (
              <Badge key={field} variant="secondary" className="bg-white/20 text-white">
                {field}: {value}
              </Badge>
            )
          ))}
          {sortConfig && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              Sort: {sortConfig.field} {sortConfig.direction}
            </Badge>
          )}
          {groupConfig && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              Group: {groupConfig.field}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 border-b bg-gray-50/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Input
            placeholder="Filter name..."
            value={filters.name || ''}
            onChange={(e) => onFiltersChange({ ...filters, name: e.target.value })}
            className="text-xs"
          />
          <Input
            placeholder="Filter department..."
            value={filters.department || ''}
            onChange={(e) => onFiltersChange({ ...filters, department: e.target.value })}
            className="text-xs"
          />
          <Input
            placeholder="Filter status..."
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onFiltersChange({});
              onSortChange(null);
              onGroupChange(null);
            }}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {Object.entries(groupedData).map(([groupKey, items]) => (
          <div key={groupKey} className="mb-2">
            {groupConfig && (
              <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 font-semibold text-purple-800 border-b">
                {groupConfig.field}: {groupKey} ({items.length} items)
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-8">
                  <tr>
                    {['name', 'email', 'department', 'status', 'salary'].map((field) => (
                      <th
                        key={field}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(field as keyof DataItem)}
                      >
                        <div className="flex items-center gap-1">
                          {field}
                          <span className="text-gray-400">{getSortIcon(field as keyof DataItem)}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {highlightText(item.name, highlightText)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {highlightText(item.email, highlightText)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {highlightText(item.department, highlightText)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge 
                          variant={item.status === 'Active' ? 'default' : 'secondary'}
                          className={item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {highlightText(item.status, highlightText)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${item.salary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DataVisualization;
