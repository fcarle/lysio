import { useState, useEffect } from 'react';
import { Project } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, 
  Scatter, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ComposedChart, Cell
} from 'recharts';
import { 
  Save, Download, Filter, Palette, ChevronDown, ChevronUp, 
  Plus, Trash2, Star, StarOff, Settings, X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface CustomChartProps {
  projects: Project[];
}

type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'radar' | 'composed';
type DataField = 'name' | 'budget_total' | 'budget_spent' | 'progress' | 'team_size' | 'tasks' | 'status' | 'priority' | 'category' | 'deadline';
type FilterOperator = 'equals' | 'contains' | 'greater' | 'less' | 'between';

interface ChartConfig {
  id?: string;
  name: string;
  type: ChartType;
  xAxis: DataField;
  yAxis: DataField;
  title: string;
  color: string;
  showGrid: boolean;
  showLegend: boolean;
  filters: ChartFilter[];
  isFavorite: boolean;
}

interface ChartFilter {
  field: DataField;
  operator: FilterOperator;
  value: string | number | [number, number];
}

interface SavedConfig {
  id: string;
  name: string;
  config: ChartConfig;
  created_at: string;
}

export function CustomChart({ projects }: CustomChartProps) {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    name: 'My Chart',
    type: 'bar',
    xAxis: 'name',
    yAxis: 'budget_total',
    title: 'Project Budget Overview',
    color: '#8884d8',
    showGrid: true,
    showLegend: true,
    filters: [],
    isFavorite: false
  });
  
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newFilter, setNewFilter] = useState<ChartFilter>({
    field: 'status',
    operator: 'equals',
    value: ''
  });
  const [configName, setConfigName] = useState('');
  const supabase = createClientComponentClient();

  // Load saved configurations on component mount
  useEffect(() => {
    loadSavedConfigs();
  }, []);

  const loadSavedConfigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('chart_configurations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading from Supabase:', error);
          // Fallback to localStorage
          loadFromLocalStorage();
          return;
        }
        
        setSavedConfigs(data || []);
      } else {
        // Load from localStorage if user is not authenticated
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      // Fallback to localStorage
      loadFromLocalStorage();
    }
  };

  // Fallback function to load configurations from localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedConfigs = JSON.parse(localStorage.getItem('chart_configurations') || '[]');
      setSavedConfigs(savedConfigs);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setSavedConfigs([]);
    }
  };

  const saveConfiguration = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage if user is not authenticated
        saveToLocalStorage();
        return;
      }

      const { error } = await supabase
        .from('chart_configurations')
        .insert({
          user_id: user.id,
          name: configName || chartConfig.name,
          config: chartConfig,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving to Supabase:', error);
        // Fallback to localStorage if Supabase fails
        saveToLocalStorage();
        return;
      }
      
      await loadSavedConfigs();
      setIsSaveDialogOpen(false);
      setConfigName('');
    } catch (error) {
      console.error('Error saving configuration:', error);
      // Fallback to localStorage if there's any error
      saveToLocalStorage();
    }
  };

  // Fallback function to save configurations to localStorage
  const saveToLocalStorage = () => {
    try {
      const savedConfigs = JSON.parse(localStorage.getItem('chart_configurations') || '[]');
      const newConfig = {
        id: crypto.randomUUID(),
        name: configName || chartConfig.name,
        config: chartConfig,
        created_at: new Date().toISOString()
      };
      
      savedConfigs.push(newConfig);
      localStorage.setItem('chart_configurations', JSON.stringify(savedConfigs));
      
      // Update the state with the new configuration
      setSavedConfigs([...savedConfigs]);
      setIsSaveDialogOpen(false);
      setConfigName('');
      
      console.log('Configuration saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadConfiguration = (config: ChartConfig) => {
    setChartConfig(config);
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('chart_configurations')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting from Supabase:', error);
          // Fallback to localStorage
          deleteFromLocalStorage(id);
          return;
        }
        
        await loadSavedConfigs();
      } else {
        // Delete from localStorage if user is not authenticated
        deleteFromLocalStorage(id);
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      // Fallback to localStorage
      deleteFromLocalStorage(id);
    }
  };

  // Fallback function to delete configurations from localStorage
  const deleteFromLocalStorage = (id: string) => {
    try {
      const savedConfigs = JSON.parse(localStorage.getItem('chart_configurations') || '[]');
      const updatedConfigs = savedConfigs.filter((config: SavedConfig) => config.id !== id);
      localStorage.setItem('chart_configurations', JSON.stringify(updatedConfigs));
      setSavedConfigs(updatedConfigs);
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const config = savedConfigs.find(c => c.id === id);
        if (!config) return;

        const { error } = await supabase
          .from('chart_configurations')
          .update({ config: { ...config.config, isFavorite } })
          .eq('id', id);

        if (error) {
          console.error('Error updating favorite status in Supabase:', error);
          // Fallback to localStorage
          toggleFavoriteInLocalStorage(id, isFavorite);
          return;
        }
        
        await loadSavedConfigs();
      } else {
        // Update in localStorage if user is not authenticated
        toggleFavoriteInLocalStorage(id, isFavorite);
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Fallback to localStorage
      toggleFavoriteInLocalStorage(id, isFavorite);
    }
  };

  // Fallback function to toggle favorite status in localStorage
  const toggleFavoriteInLocalStorage = (id: string, isFavorite: boolean) => {
    try {
      const savedConfigs = JSON.parse(localStorage.getItem('chart_configurations') || '[]');
      const updatedConfigs = savedConfigs.map((config: SavedConfig) => {
        if (config.id === id) {
          return {
            ...config,
            config: {
              ...config.config,
              isFavorite
            }
          };
        }
        return config;
      });
      
      localStorage.setItem('chart_configurations', JSON.stringify(updatedConfigs));
      setSavedConfigs(updatedConfigs);
    } catch (error) {
      console.error('Error updating favorite status in localStorage:', error);
    }
  };

  const addFilter = () => {
    setChartConfig({
      ...chartConfig,
      filters: [...chartConfig.filters, newFilter]
    });
    setNewFilter({
      field: 'status',
      operator: 'equals',
      value: ''
    });
    setIsFilterDialogOpen(false);
  };

  const removeFilter = (index: number) => {
    const updatedFilters = [...chartConfig.filters];
    updatedFilters.splice(index, 1);
    setChartConfig({
      ...chartConfig,
      filters: updatedFilters
    });
  };

  const processData = () => {
    let data = projects.map(project => {
      return {
        name: project.name,
        budget_total: project.budget_total,
        budget_spent: project.budget_spent,
        progress: project.progress,
        team_size: project.team_size,
        tasks: project.tasks.length,
        status: project.status,
        priority: project.priority,
        category: project.category,
        deadline: new Date(project.deadline).toLocaleDateString()
      };
    });

    // Apply filters
    if (chartConfig.filters.length > 0) {
      data = data.filter(item => {
        return chartConfig.filters.every(filter => {
          const value = item[filter.field];
          
          switch (filter.operator) {
            case 'equals':
              return value === filter.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'greater':
              return Number(value) > Number(filter.value);
            case 'less':
              return Number(value) < Number(filter.value);
            case 'between':
              const [min, max] = filter.value as [number, number];
              return Number(value) >= min && Number(value) <= max;
            default:
              return true;
          }
        });
      });
    }

    return data;
  };

  const exportChart = () => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 800;

    // Draw chart background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw chart title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(chartConfig.title, canvas.width / 2, 40);

    // Draw chart (simplified representation)
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText('Chart data would be rendered here', 50, 100);

    // Convert to image and download
    const link = document.createElement('a');
    link.download = `${chartConfig.name || 'chart'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const renderChart = () => {
    const data = processData();

    switch (chartConfig.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis} />
              <YAxis />
              <Tooltip />
              {chartConfig.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={chartConfig.yAxis} 
                stroke={chartConfig.color} 
                strokeWidth={2}
                dot={{ fill: chartConfig.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis} />
              <YAxis />
              <Tooltip />
              {chartConfig.showLegend && <Legend />}
              <Bar 
                dataKey={chartConfig.yAxis} 
                fill={chartConfig.color} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey={chartConfig.yAxis}
                nameKey={chartConfig.xAxis}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill={chartConfig.color}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${(index * 360) / data.length}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
              {chartConfig.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis} type="category" />
              <YAxis dataKey={chartConfig.yAxis} type="number" />
              <Tooltip />
              {chartConfig.showLegend && <Legend />}
              <Scatter 
                data={data} 
                fill={chartConfig.color} 
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis} />
              <YAxis />
              <Tooltip />
              {chartConfig.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey={chartConfig.yAxis} 
                stroke={chartConfig.color} 
                fill={chartConfig.color} 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={chartConfig.xAxis} />
              <PolarRadiusAxis />
              <Radar 
                name={chartConfig.yAxis} 
                dataKey={chartConfig.yAxis} 
                stroke={chartConfig.color} 
                fill={chartConfig.color} 
                fillOpacity={0.6} 
              />
              <Tooltip />
              {chartConfig.showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis} />
              <YAxis />
              <Tooltip />
              {chartConfig.showLegend && <Legend />}
              <Bar 
                dataKey="budget_total" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="budget_spent" 
                stroke="#ff7300" 
                strokeWidth={2}
              />
              <Scatter 
                dataKey="progress" 
                fill="#82ca9d" 
                shape="circle"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Chart</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters ({chartConfig.filters.length})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSaveDialogOpen(true)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportChart}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select
                value={chartConfig.type}
                onValueChange={(value: ChartType) =>
                  setChartConfig({ ...chartConfig, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="radar">Radar Chart</SelectItem>
                  <SelectItem value="composed">Composed Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>X-Axis</Label>
              <Select
                value={chartConfig.xAxis}
                onValueChange={(value: DataField) =>
                  setChartConfig({ ...chartConfig, xAxis: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select X-axis data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Project Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="team_size">Team Size</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Y-Axis</Label>
              <Select
                value={chartConfig.yAxis}
                onValueChange={(value: DataField) =>
                  setChartConfig({ ...chartConfig, yAxis: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Y-axis data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget_total">Total Budget</SelectItem>
                  <SelectItem value="budget_spent">Spent Budget</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="tasks">Number of Tasks</SelectItem>
                  <SelectItem value="team_size">Team Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chart Title</Label>
              <Input
                value={chartConfig.title}
                onChange={(e) =>
                  setChartConfig({ ...chartConfig, title: e.target.value })
                }
                placeholder="Enter chart title"
              />
            </div>
          </div>

          {/* Active Filters */}
          {chartConfig.filters.length > 0 && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {chartConfig.filters.map((filter, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                  >
                    <span className="font-medium">{filter.field}</span>
                    <span className="text-gray-500">{filter.operator}</span>
                    <span>{String(filter.value)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 ml-1" 
                      onClick={() => removeFilter(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Configurations */}
          {savedConfigs.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Configurations</Label>
              <div className="flex flex-wrap gap-2">
                {savedConfigs.map((config) => (
                  <div 
                    key={config.id}
                    className="relative group"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 pr-8"
                      onClick={() => loadConfiguration(config.config)}
                    >
                      {config.config.isFavorite ? (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-3 w-3" />
                      )}
                      {config.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConfiguration(config.id);
                      }}
                    >
                      <X className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-[400px] w-full">
            {renderChart()}
          </div>
        </div>
      </CardContent>

      {/* Save Configuration Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Chart Configuration</DialogTitle>
            <DialogDescription>
              Save your current chart configuration for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Configuration Name</Label>
              <Input
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Enter a name for this configuration"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="favorite" 
                checked={chartConfig.isFavorite}
                onCheckedChange={(checked) => 
                  setChartConfig({ ...chartConfig, isFavorite: checked as boolean })
                }
              />
              <Label htmlFor="favorite">Mark as favorite</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveConfiguration}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Filter</DialogTitle>
            <DialogDescription>
              Filter the data displayed in your chart.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Field</Label>
              <Select
                value={newFilter.field}
                onValueChange={(value: DataField) =>
                  setNewFilter({ ...newFilter, field: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Project Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="team_size">Team Size</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="budget_total">Total Budget</SelectItem>
                  <SelectItem value="budget_spent">Spent Budget</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="tasks">Number of Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select
                value={newFilter.operator}
                onValueChange={(value: FilterOperator) =>
                  setNewFilter({ ...newFilter, operator: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater">Greater Than</SelectItem>
                  <SelectItem value="less">Less Than</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              {newFilter.operator === 'between' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={Array.isArray(newFilter.value) ? newFilter.value[0] : ''}
                    onChange={(e) => 
                      setNewFilter({ 
                        ...newFilter, 
                        value: [Number(e.target.value), Array.isArray(newFilter.value) ? newFilter.value[1] : 0] 
                      })
                    }
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={Array.isArray(newFilter.value) ? newFilter.value[1] : ''}
                    onChange={(e) => 
                      setNewFilter({ 
                        ...newFilter, 
                        value: [Array.isArray(newFilter.value) ? newFilter.value[0] : 0, Number(e.target.value)] 
                      })
                    }
                  />
                </div>
              ) : (
                <Input
                  placeholder="Enter value"
                  value={String(newFilter.value)}
                  onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addFilter}>
              Add Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chart Settings</DialogTitle>
            <DialogDescription>
              Customize the appearance of your chart.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chart Color</Label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-md border" 
                  style={{ backgroundColor: chartConfig.color }}
                />
                <Input
                  value={chartConfig.color}
                  onChange={(e) => setChartConfig({ ...chartConfig, color: e.target.value })}
                  placeholder="#8884d8"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Grid</Label>
              <Switch
                checked={chartConfig.showGrid}
                onCheckedChange={(checked) => 
                  setChartConfig({ ...chartConfig, showGrid: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Legend</Label>
              <Switch
                checked={chartConfig.showLegend}
                onCheckedChange={(checked) => 
                  setChartConfig({ ...chartConfig, showLegend: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 