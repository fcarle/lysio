import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeProps,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { TeamMember } from '../types/team';
import type { Responsibility, ServiceCategory } from '../types/services';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Service {
  name: Responsibility;
  icon: string;
  category: ServiceCategory;
}

// This is a temporary solution until we move this to a proper data file
const AVAILABLE_SERVICES: Service[] = [
  // Performance Marketing
  { name: 'Google Ads', icon: 'Target', category: 'Performance Marketing' },
  { name: 'Meta Ads', icon: 'Share2', category: 'Performance Marketing' },
  { name: 'LinkedIn Ads', icon: 'Users', category: 'Performance Marketing' },
  { name: 'Apple Search Ads', icon: 'Search', category: 'Performance Marketing' },
  
  // Social Media Platforms
  { name: 'Instagram Marketing', icon: 'Image', category: 'Social Media Platforms' },
  { name: 'TikTok Content Creation', icon: 'Video', category: 'Social Media Platforms' },
  { name: 'LinkedIn Company Page Management', icon: 'Building2', category: 'Social Media Platforms' },
  
  // SEO & Organic Growth
  { name: 'On-Page SEO', icon: 'FileText', category: 'SEO & Organic Growth' },
  { name: 'Technical SEO', icon: 'Code', category: 'SEO & Organic Growth' },
  { name: 'Local SEO', icon: 'MapPin', category: 'SEO & Organic Growth' },
];

interface TeamNetworkProps {
  teamMembers: TeamMember[];
}

interface MemberWorkload {
  id: string;
  name: string;
  workload: number;
  projects: number;
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
}

const getWorkloadColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-red-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getWorkloadText = (percentage: number) => {
  if (percentage >= 80) return 'Overloaded';
  if (percentage >= 50) return 'Moderate';
  return 'Available';
};

const CategoryNode = ({ data }: NodeProps) => (
  <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 min-w-[180px]">
    <div className="font-medium text-sm text-slate-700">{data.label}</div>
    <div className="text-xs text-slate-500">{data.servicesCount} services</div>
  </div>
);

const MemberNode = ({ data }: NodeProps) => (
  <Card className="px-4 py-3 shadow-lg border-2 border-gray-200 min-w-[220px] bg-white">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-md bg-blue-50 text-lysio-blue">
        <Icons.User className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm text-slate-900">{data.label}</div>
        <div className="text-xs text-slate-500 mb-2">{data.role}</div>
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Workload</span>
            <div className="flex items-center gap-2">
              <span>{data.workloadPercentage}%</span>
              <Badge variant="secondary" className={`text-xs ${
                data.workloadPercentage >= 80 ? 'bg-red-100 text-red-700' :
                data.workloadPercentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {getWorkloadText(data.workloadPercentage)}
              </Badge>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full w-full">
            <div 
              className={`h-full rounded-full transition-all ${getWorkloadColor(data.workloadPercentage)}`}
              style={{ width: `${data.workloadPercentage}%` }}
            />
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Projects</span>
            <Badge variant="outline" className="text-xs">
              {data.projects} assigned
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Tasks</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                {data.tasks.completed} done
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {data.tasks.inProgress} in progress
              </Badge>
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                {data.tasks.pending} pending
              </Badge>
            </div>
          </div>
        </div>
        {data.responsibilities && data.responsibilities.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-slate-700 mb-1">Services</div>
            <div className="flex flex-wrap gap-1">
              {data.responsibilities.slice(0, 2).map((resp: string) => (
                <Badge key={resp} variant="secondary" className="text-xs">
                  {resp}
                </Badge>
              ))}
              {data.responsibilities.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{data.responsibilities.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </Card>
);

const ResponsibilityNode = ({ data }: NodeProps) => (
  <Card className={`px-4 py-3 shadow-lg border-2 min-w-[220px] ${
    data.assignedMembers.length > 0 
      ? 'border-blue-200 bg-blue-50/30' 
      : 'border-slate-200 bg-slate-50'
  }`}>
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-md ${
        data.assignedMembers.length > 0 
          ? 'bg-blue-100 text-blue-700' 
          : 'bg-slate-100 text-slate-600'
      }`}>
        <Icons.Target className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className={`font-semibold text-sm ${
          data.assignedMembers.length > 0 
            ? 'text-blue-700' 
            : 'text-slate-700'
        }`}>
          {data.label}
        </div>
        <div className="text-xs text-slate-500">{data.category}</div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Assigned to</span>
            <span>{data.assignedMembers.length} members</span>
          </div>
          {data.assignedMembers.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {data.assignedMembers.map((member: string) => (
                <Badge key={member} variant="secondary" className="text-xs">
                  {member}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500">Unassigned</div>
          )}
        </div>
      </div>
    </div>
  </Card>
);

const nodeTypes = {
  member: MemberNode,
  responsibility: ResponsibilityNode,
  category: CategoryNode,
};

const MEMBERS_Y = 100;
const CATEGORIES_Y = 300;
const SERVICES_Y_START = 400;
const SERVICES_Y_SPACING = 150;
const GRID_SPACING = 300;

export default function TeamNetwork({ teamMembers }: TeamNetworkProps) {
  const [showOverloaded, setShowOverloaded] = useState(false);
  const [showUnassigned, setShowUnassigned] = useState(false);
  const [showWorkloadSummary, setShowWorkloadSummary] = useState(true);
  const [memberWorkloads, setMemberWorkloads] = useState<MemberWorkload[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMemberWorkloads();
  }, [teamMembers]);

  const fetchMemberWorkloads = async () => {
    try {
      const workloads = await Promise.all(teamMembers.map(async (member) => {
        // Fetch projects - get all projects where the member is assigned
        const { data: projectMemberships, error: projectError } = await supabase
          .from('project_team_members')
          .select(`
            project_id,
            project:projects(*)
          `)
          .eq('user_id', member.user_id);

        if (projectError) {
          console.error('Error fetching projects for member:', member.id, projectError);
        }

        // Fetch tasks - get all tasks assigned to this member
        const { data: tasks, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignee_id', member.user_id);

        if (taskError) {
          console.error('Error fetching tasks for member:', member.id, taskError);
        }

        // Calculate task statistics
        const taskStats = {
          total: tasks?.length || 0,
          completed: tasks?.filter(t => t.status === 'completed').length || 0,
          inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
          pending: tasks?.filter(t => t.status === 'pending').length || 0
        };

        // Log the data for debugging
        console.log(`Member ${member.name} (${member.id}):`, {
          projects: projectMemberships?.length || 0,
          tasks: taskStats,
          rawData: { projectMemberships, tasks }
        });

        return {
          id: member.id,
          name: member.name,
          workload: (member.responsibilities?.length || 0) / Math.max(teamMembers.length, 1) * 100,
          projects: projectMemberships?.length || 0,
          tasks: taskStats
        };
      }));

      setMemberWorkloads(workloads);
    } catch (error) {
      console.error('Error fetching member workloads:', error);
    }
  };

  // Get all unique responsibilities from team members
  const allResponsibilities = Array.from(
    new Set(
      teamMembers
        .flatMap((member) => member.responsibilities || [])
        .filter(Boolean)
    )
  );

  // Calculate workload statistics
  const workloadStats = {
    overloaded: memberWorkloads.filter(w => w.workload >= 80).length,
    moderate: memberWorkloads.filter(w => w.workload >= 50 && w.workload < 80).length,
    available: memberWorkloads.filter(w => w.workload < 50).length,
    total: memberWorkloads.length
  };

  // Create nodes for team members
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  // Filter team members based on workload if showOverloaded is true
  const filteredTeamMembers = showOverloaded 
    ? teamMembers.filter(member => {
        const workload = memberWorkloads.find(w => w.id === member.id)?.workload || 0;
        return workload >= 80;
      })
    : teamMembers;

  // Create nodes for team members
  filteredTeamMembers.forEach((member, index) => {
    const workload = memberWorkloads.find(w => w.id === member.id);
    
    // Log the workload data for debugging
    console.log(`Creating node for ${member.name}:`, workload);
    
    initialNodes.push({
      id: `member-${member.id}`,
      type: 'member',
      position: { 
        x: 100 + (index * GRID_SPACING), 
        y: MEMBERS_Y 
      },
      data: { 
        label: member.name,
        role: member.role,
        workloadPercentage: Math.round(workload?.workload || 0),
        responsibilities: member.responsibilities,
        projects: workload?.projects || 0,
        tasks: workload?.tasks || { total: 0, completed: 0, inProgress: 0, pending: 0 }
      },
    });
  });

  // Group services by category
  const servicesByCategory = AVAILABLE_SERVICES.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<ServiceCategory, typeof AVAILABLE_SERVICES>);

  // Create category nodes and their services
  Object.entries(servicesByCategory).forEach(([category, services], categoryIndex) => {
    // Add category node
    const categoryNode = {
      id: `category-${category}`,
      type: 'category',
      position: {
        x: 100 + (categoryIndex * GRID_SPACING),
        y: CATEGORIES_Y
      },
      data: {
        label: category,
        servicesCount: services.length
      }
    };
    initialNodes.push(categoryNode);

    // Filter services if showUnassigned is true
    const filteredServices = showUnassigned
      ? services.filter(service => {
          const assignedCount = teamMembers.filter(member => 
            member.responsibilities?.includes(service.name)
          ).length;
          return assignedCount === 0;
        })
      : services;

    // Add service nodes for this category
    filteredServices.forEach((service, serviceIndex) => {
      const assignedMembers = teamMembers
        .filter(member => member.responsibilities?.includes(service.name))
        .map(member => member.name);

      const serviceNode = {
        id: `resp-${service.name}`,
        type: 'responsibility',
        position: {
          x: 100 + (categoryIndex * GRID_SPACING),
          y: SERVICES_Y_START + (serviceIndex * 100)
        },
        data: {
          label: service.name,
          category: service.category,
          assignedMembers
        }
      };
      initialNodes.push(serviceNode);

      // Add edge from category to service
      initialEdges.push({
        id: `edge-category-${category}-${service.name}`,
        source: `category-${category}`,
        target: `resp-${service.name}`,
        type: 'smoothstep',
        style: { 
          stroke: '#94a3b8',
          strokeWidth: 1,
          opacity: 0.3
        },
      });
    });
  });

  // Create edges between members and their responsibilities
  filteredTeamMembers.forEach((member) => {
    const memberResponsibilities = member.responsibilities || [];
    memberResponsibilities.forEach((resp) => {
      const service = AVAILABLE_SERVICES.find(s => s.name === resp);
      if (service && (!showUnassigned || service.category)) {
        initialEdges.push({
          id: `edge-${member.id}-${resp}`,
          source: `member-${member.id}`,
          target: `resp-${resp}`,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#3b82f6',
            strokeWidth: 2,
            opacity: 0.6
          },
        });
      }
    });
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[800px] w-full border rounded-lg bg-slate-50/50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.4}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
      >
        <Background color="#94a3b8" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const data = node.data as any;
            if (node.type === 'member') {
              return data.workloadPercentage >= 80 ? '#ef4444' : '#3b82f6';
            }
            if (node.type === 'category') {
              return '#94a3b8';
            }
            return '#e2e8f0';
          }}
        />
        <Panel position="top-left" className="bg-white p-2 rounded-lg shadow-lg">
          <div className="space-y-2">
            <Button
              size="sm"
              variant={showOverloaded ? "default" : "outline"}
              onClick={() => setShowOverloaded(!showOverloaded)}
              className="w-full"
            >
              <Icons.AlertCircle className="w-4 h-4 mr-2" />
              {showOverloaded ? 'Show All Members' : 'Show Overloaded'}
            </Button>
            <Button
              size="sm"
              variant={showUnassigned ? "default" : "outline"}
              onClick={() => setShowUnassigned(!showUnassigned)}
              className="w-full"
            >
              <Icons.AlertTriangle className="w-4 h-4 mr-2" />
              {showUnassigned ? 'Show All Services' : 'Show Unassigned'}
            </Button>
            <Button
              size="sm"
              variant={showWorkloadSummary ? "default" : "outline"}
              onClick={() => setShowWorkloadSummary(!showWorkloadSummary)}
              className="w-full"
            >
              <Icons.BarChart2 className="w-4 h-4 mr-2" />
              {showWorkloadSummary ? 'Hide Summary' : 'Show Summary'}
            </Button>
          </div>
        </Panel>

        {showWorkloadSummary && (
          <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-900 mb-2">Workload Distribution</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Overloaded</span>
                    </div>
                    <span className="font-medium">{workloadStats.overloaded}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Moderate</span>
                    </div>
                    <span className="font-medium">{workloadStats.moderate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Available</span>
                    </div>
                    <span className="font-medium">{workloadStats.available}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 mb-2">Team Insights</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• {workloadStats.overloaded} members are overloaded</p>
                  <p>• {workloadStats.available} members have capacity for more work</p>
                  <p>• {workloadStats.moderate} members have balanced workload</p>
                  <p>• Total projects: {memberWorkloads.reduce((sum, m) => sum + m.projects, 0)}</p>
                  <p>• Total tasks: {memberWorkloads.reduce((sum, m) => sum + m.tasks.total, 0)}</p>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
} 