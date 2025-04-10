'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, Clock, BarChart, MoreVertical, Trash2, Check, Loader2, GanttChart } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CreateProjectDialog } from './components/create-project-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GanttChart as GanttChartComponent } from './components/gantt-chart';
import { CustomChart } from './components/custom-chart';
import { ProjectAssets } from './components/project-assets';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  assigned_to: string;
  due_date: string;
}

interface TeamMember {
  id: string;
  email: string;
  role: string;
  avatar: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface BudgetBreakdown {
  id: string;
  category: string;
  amount: number;
  spent: number;
}

interface ProjectTeamMember {
  team_member: Array<{
    id: string;
    email: string;
    role: string;
    user_id: string;
  }>;
}

interface Project {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  deadline: string;
  team_size: number;
  category: string;
  budget_total: number;
  budget_spent: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
  created_at: string;
  tasks: Task[];
  team: TeamMember[];
  timeline: TimelineEvent[];
  budget_breakdown: BudgetBreakdown[];
}

const statusColors = {
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'on-hold': 'bg-yellow-100 text-yellow-800'
};

const priorityColors = {
  'high': 'bg-red-100 text-red-800',
  'medium': 'bg-orange-100 text-orange-800',
  'low': 'bg-green-100 text-green-800'
};

const taskStatusColors = {
  'completed': 'text-green-500',
  'in-progress': 'text-blue-500',
  'pending': 'text-gray-400'
};

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  due_date: z.string().min(1, "Due date is required"),
  priority: z.enum(["high", "medium", "low"]),
  assignee_id: z.string().optional(),
});

function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] = useState(false);
  const [isChangeAssigneeDialogOpen, setIsChangeAssigneeDialogOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const taskForm = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
      priority: "medium",
      assignee_id: "",
    },
  });

  const editTaskForm = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
      priority: "medium",
      assignee_id: "",
    },
  });

  useEffect(() => {
    fetchProjects();

    // Handle selected project from URL
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get('selected');
    if (selectedId) {
      const project = projects.find(p => p.id === selectedId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, []);

  // Add another useEffect to handle project selection when projects are loaded
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get('selected');
    if (selectedId && projects.length > 0) {
      const project = projects.find(p => p.id === selectedId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projects]);

  useEffect(() => {
    if (taskToEdit) {
      editTaskForm.reset({
        title: taskToEdit.title,
        description: taskToEdit.description,
        due_date: taskToEdit.due_date,
        priority: taskToEdit.priority,
        assignee_id: taskToEdit.assigned_to,
      });
    }
  }, [taskToEdit]);

  async function fetchProjects() {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if user already has a company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      let companyId;

      if (companyError) {
        // Only create a company if it doesn't exist
        const { data: newCompany, error: createCompanyError } = await supabase
          .from('companies')
          .insert([{
            name: `${user.email}'s Company`,
            owner_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('id')
          .single();

        if (createCompanyError) throw createCompanyError;
        companyId = newCompany.id;
      } else {
        companyId = company.id;
      }

      // Now check if user is already a team member
      const { data: existingTeamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('id, company_id')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .single();

      if (teamMemberError && teamMemberError.code !== 'PGRST116') {
        // Only create a team member if they don't exist and it's not just a "no rows returned" error
        const { data: newTeamMember, error: createError } = await supabase
          .from('team_members')
          .insert([{
            user_id: user.id,
            email: user.email,
            role: 'owner',
            status: 'active',
            company_id: companyId
          }])
          .select('id, company_id')
          .single();

        if (createError) throw createError;
        if (!newTeamMember) throw new Error('Failed to create team member');
      }

      // Fetch projects in smaller chunks to avoid timeouts
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          deadline,
          category,
          priority,
          description,
          created_at,
          budget,
          budget_spent,
          company_id
        `)
        .eq('company_id', companyId);

      if (projectsError) throw projectsError;

      // Fetch additional data for each project separately
      const transformedProjects = await Promise.all(projectsData.map(async (project) => {
        const [
          { data: tasks },
          { data: teamMembers },
          { data: timeline },
          { data: budgetBreakdown }
        ] = await Promise.all([
          supabase
            .from('project_tasks')
            .select('*')
            .eq('project_id', project.id),
          supabase
            .from('project_team_members')
            .select(`
              team_member:team_members (
                id,
                email,
                role,
                user_id
              )
            `)
            .eq('project_id', project.id),
          supabase
            .from('project_timeline_events')
            .select('*')
            .eq('project_id', project.id),
          supabase
            .from('project_budget_breakdown')
            .select('*')
            .eq('project_id', project.id)
        ]);

        const team = (teamMembers || []).flatMap((member) => {
          // Handle both array and single object cases
          if (!member.team_member) {
            return [];
          }
          
          // If it's a single object (not an array)
          if (!Array.isArray(member.team_member)) {
            const teamMember = member.team_member as {
              id: string;
              email: string;
              role: string;
              user_id: string;
            };
            
            return [{
              id: teamMember.id,
              email: teamMember.email,
              role: teamMember.role,
              avatar: teamMember.email.charAt(0).toUpperCase()
            }];
          }
          
          // If it's an array (original code)
          return member.team_member.map(tm => ({
            id: tm.id,
            email: tm.email,
            role: tm.role,
            avatar: tm.email.charAt(0).toUpperCase()
          }));
        });

        return {
          ...project,
          progress: calculateProgress(tasks || []),
          team_size: team.length,
          tasks: tasks || [],
          team,
          timeline: timeline || [],
          budget_breakdown: budgetBreakdown || [],
          budget_total: project.budget || 0,
          budget_spent: project.budget_spent || 0
        };
      }));

      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const categories = Array.from(new Set(projects.map(project => project.category)));
  const statuses = Array.from(new Set(projects.map(project => project.status)));

  const filteredProjects = projects.filter(project => {
    if (selectedCategory && project.category !== selectedCategory) return false;
    if (selectedStatus && project.status !== selectedStatus) return false;
    return true;
  });

  async function handleDeleteProject(project: Project) {
    try {
      // Delete related records first
      await supabase.from('project_tasks').delete().eq('project_id', project.id);
      await supabase.from('project_team_members').delete().eq('project_id', project.id);
      await supabase.from('project_timeline_events').delete().eq('project_id', project.id);
      await supabase.from('project_budget_breakdown').delete().eq('project_id', project.id);
      
      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      // Refresh the projects list
      fetchProjects();
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  async function handleAddTask(values: z.infer<typeof taskFormSchema>) {
    try {
      if (!selectedProject) return;

      const { error } = await supabase
        .from('project_tasks')
        .insert({
          project_id: selectedProject.id,
          title: values.title,
          description: values.description,
          due_date: values.due_date,
          priority: values.priority,
          status: 'todo',
          assigned_to: values.assignee_id,
        });

      if (error) throw error;

      // Refresh the projects to get the new task
      await fetchProjects();
      setIsAddTaskDialogOpen(false);
      taskForm.reset();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function handleEditTask(values: z.infer<typeof taskFormSchema>) {
    try {
      if (!taskToEdit) return;

      const { error } = await supabase
        .from('project_tasks')
        .update({
          title: values.title,
          description: values.description,
          due_date: values.due_date,
          priority: values.priority,
          assigned_to: values.assignee_id,
        })
        .eq('id', taskToEdit.id);

      if (error) throw error;

      await fetchProjects();
      setIsEditTaskDialogOpen(false);
      setTaskToEdit(null);
      editTaskForm.reset();
    } catch (error) {
      console.error('Error editing task:', error);
    }
  }

  async function handleChangeTaskStatus(task: Task, newStatus: 'completed' | 'in-progress' | 'pending') {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;

      await fetchProjects();
      setIsChangeStatusDialogOpen(false);
    } catch (error) {
      console.error('Error changing task status:', error);
    }
  }

  async function handleChangeTaskAssignee(task: Task, newAssigneeId: string) {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ assigned_to: newAssigneeId })
        .eq('id', task.id);

      if (error) throw error;

      await fetchProjects();
      setIsChangeAssigneeDialogOpen(false);
    } catch (error) {
      console.error('Error changing task assignee:', error);
    }
  }

  async function handleDeleteTask(task: Task) {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      await fetchProjects();
      setIsDeleteTaskDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async function handleCompleteTask(task: Task) {
    try {
      setCompletingTaskId(task.id);
      
      // Artificial delay for animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update task status to 'completed'
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: 'completed' })
        .eq('id', task.id);

      if (error) throw error;

      // Fetch the updated project data
      await fetchProjects();
      
      // Check if all tasks for the selected project are now completed
      if (selectedProject) {
        console.log("Checking if all tasks are completed");
        // Reload the project with latest data
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('id', selectedProject.id)
          .single();
          
        if (projectError) {
          console.error("Error fetching project:", projectError);
          return;
        }
        
        // Get the latest tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('project_tasks')
          .select('status')
          .eq('project_id', selectedProject.id);
          
        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
          return;
        }
        
        console.log("Current tasks:", tasksData);
        
        // Check if all tasks are completed
        const allTasksCompleted = tasksData && 
                                  tasksData.length > 0 && 
                                  tasksData.every(t => t.status === 'completed');
        
        console.log("All tasks completed:", allTasksCompleted);
        
        if (allTasksCompleted) {
          console.log("Updating project status to completed");
          // All tasks are completed, update project status to completed
          const { error: updateError } = await supabase
            .from('projects')
            .update({ status: 'completed' })
            .eq('id', selectedProject.id);
            
          if (updateError) {
            console.error('Error updating project status:', updateError);
          } else {
            console.log("Project status updated successfully");
            // Refresh projects to show updated status
            await fetchProjects();
          }
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setCompletingTaskId(null);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <CreateProjectDialog onProjectCreated={fetchProjects} />
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="gantt">
            <GanttChart className="w-4 h-4 mr-2" />
            Gantt Chart
          </TabsTrigger>
          <TabsTrigger value="custom">
            <BarChart className="w-4 h-4 mr-2" />
            Custom Chart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters Section with modern design */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              <span>Filter projects by category and status</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full"
                  size="sm"
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedStatus === null ? "default" : "outline"}
                  onClick={() => setSelectedStatus(null)}
                  className="rounded-full"
                  size="sm"
                >
                  All Status
                </Button>
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
                    onClick={() => setSelectedStatus(status)}
                    className="rounded-full"
                    size="sm"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid with improved card design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-muted-foreground">Loading projects...</span>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-1">No projects found</h3>
                <p className="text-muted-foreground text-sm">
                  {selectedCategory || selectedStatus ? 
                    "Try adjusting your filters" : 
                    "Create your first project to get started"}
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedProject(project)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge 
                            variant="secondary"
                            className={`${statusColors[project.status]} px-2 py-0.5 text-xs font-medium`}
                          >
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                          <Badge 
                            variant="secondary"
                            className={`${priorityColors[project.priority]} px-2 py-0.5 text-xs font-medium`}
                          >
                            {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Progress Section */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress 
                          value={project.progress} 
                          className={`h-2 ${
                            project.progress === 100 ? "[&>div]:bg-green-500" :
                            project.progress > 50 ? "[&>div]:bg-blue-500" :
                            "[&>div]:bg-orange-500"
                          }`}
                        />
                      </div>

                      {/* Project Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline</span>
                          </div>
                          <p className="font-medium">
                            {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Team</span>
                          </div>
                          <p className="font-medium">{project.team_size} members</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Time Left</span>
                          </div>
                          <p className={`font-medium ${
                            new Date(project.deadline) <= new Date() ? 'text-red-500' : ''
                          }`}>
                            {new Date(project.deadline) > new Date() 
                              ? `${Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                              : 'Overdue'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BarChart className="h-4 w-4" />
                            <span>Budget</span>
                          </div>
                          <p className="font-medium">
                            ${project.budget_total.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Team Preview */}
                      {project.team.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          <div className="flex -space-x-2">
                            {project.team.slice(0, 3).map((member, index) => (
                              <div
                                key={member.id}
                                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium ring-2 ring-background"
                              >
                                {member.avatar}
                              </div>
                            ))}
                            {project.team.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium ring-2 ring-background">
                                +{project.team.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Project Dialog */}
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedProject && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedProject.name}</DialogTitle>
                    <DialogDescription>{selectedProject.description}</DialogDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge className={statusColors[selectedProject.status]}>
                        {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                      </Badge>
                      <Badge className={priorityColors[selectedProject.priority]}>
                        {selectedProject.priority.charAt(0).toUpperCase() + selectedProject.priority.slice(1)}
                      </Badge>
                    </div>
                  </DialogHeader>

                  <Tabs defaultValue="tasks" className="mt-6">
                    <TabsList>
                      <TabsTrigger value="tasks">Tasks</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="budget">Budget</TabsTrigger>
                      <TabsTrigger value="assets">Assets</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Project Tasks</h3>
                          <Button size="sm" onClick={() => setIsAddTaskDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                          </Button>
                        </div>

                        {/* Task Stats */}
                        <div className="grid grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">
                                {selectedProject.tasks.length}
                              </div>
                              <p className="text-sm text-muted-foreground">Total Tasks</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-green-600">
                                {selectedProject.tasks.filter(t => t.status === 'completed').length}
                              </div>
                              <p className="text-sm text-muted-foreground">Completed</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-blue-600">
                                {selectedProject.tasks.filter(t => t.status === 'in-progress').length}
                              </div>
                              <p className="text-sm text-muted-foreground">In Progress</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-gray-600">
                                {selectedProject.tasks.filter(t => t.status === 'pending').length}
                              </div>
                              <p className="text-sm text-muted-foreground">Pending</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Task List */}
                        <div className="space-y-2">
                          {selectedProject.tasks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              No tasks yet. Add tasks manually or use Smart Add to generate them.
                            </div>
                          ) : (
                            selectedProject.tasks.map((task) => (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all duration-300 ${
                                  completingTaskId === task.id ? 'scale-95 opacity-80' : ''
                                }`}
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    task.status === 'completed' ? 'bg-green-500' :
                                    task.status === 'in-progress' ? 'bg-blue-500' :
                                    'bg-gray-500'
                                  }`} />
                                  <div className="flex-1">
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      {task.description}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="outline">
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                      </Badge>
                                      <Badge variant="outline" className={
                                        task.priority === 'high' ? 'border-red-500 text-red-500' :
                                        task.priority === 'medium' ? 'border-orange-500 text-orange-500' :
                                        'border-green-500 text-green-500'
                                      }>
                                        {task.priority}
                                      </Badge>
                                      {task.assigned_to && (
                                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                                          {selectedProject.team.find(m => m.id === task.assigned_to)?.email}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {task.status !== 'completed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className={`transition-all duration-300 ${
                                        completingTaskId === task.id ? 'bg-green-50' : ''
                                      }`}
                                      onClick={() => handleCompleteTask(task)}
                                      disabled={completingTaskId === task.id}
                                    >
                                      {completingTaskId === task.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Completing...
                                        </>
                                      ) : (
                                        <>
                                          <Check className="mr-2 h-4 w-4" />
                                          Complete
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => {
                                        setTaskToEdit(task);
                                        setIsEditTaskDialogOpen(true);
                                      }}>
                                        Edit Task
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        setTaskToEdit(task);
                                        setIsChangeStatusDialogOpen(true);
                                      }}>
                                        Change Status
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        setTaskToEdit(task);
                                        setIsChangeAssigneeDialogOpen(true);
                                      }}>
                                        Change Assignee
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => {
                                          setTaskToDelete(task);
                                          setIsDeleteTaskDialogOpen(true);
                                        }}
                                      >
                                        Delete Task
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="team" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Team Members ({selectedProject.team.length})</h3>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Member
                          </Button>
                        </div>
                        {selectedProject.team.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No team members yet. Add team members to collaborate on this project.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedProject.team.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-all"
                              >
                                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                                  {member.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{member.email}</div>
                                  <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Change Role
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      Remove from Project
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Project Timeline</h3>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-8 space-y-8 before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200">
                          {selectedProject.timeline.length === 0 && selectedProject.tasks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              No timeline events or tasks yet.
                            </div>
                          ) : (
                            [...selectedProject.timeline.map(event => ({
                              type: 'event' as const,
                              id: event.id,
                              date: new Date(event.date),
                              title: event.title,
                              description: event.description
                            })),
                            ...selectedProject.tasks.map(task => ({
                              type: 'task' as const,
                              id: task.id,
                              date: new Date(task.due_date),
                              title: task.title,
                              description: task.description,
                              status: task.status,
                              priority: task.priority,
                              assignee: selectedProject.team.find(m => m.id === task.assigned_to)?.email
                            }))]
                            .sort((a, b) => a.date.getTime() - b.date.getTime())
                            .map((item, index) => (
                              <div key={item.id} className="relative">
                                {/* Timeline dot */}
                                <div className={`absolute -left-6 w-4 h-4 rounded-full border-4 border-background ${
                                  item.type === 'task' ? 
                                    item.status === 'completed' ? 'bg-green-500' :
                                    item.status === 'in-progress' ? 'bg-blue-500' :
                                    'bg-gray-500'
                                  : 'bg-primary'
                                }`} />
                                
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-semibold">{item.title}</h4>
                                          {item.type === 'task' && (
                                            <Badge variant="outline" className={
                                              item.status === 'completed' ? 'border-green-500 text-green-500' :
                                              item.status === 'in-progress' ? 'border-blue-500 text-blue-500' :
                                              'border-gray-500 text-gray-500'
                                            }>
                                              {item.status}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {item.description}
                                        </p>
                                        {item.type === 'task' && item.assignee && (
                                          <div className="text-sm text-blue-500 mt-1">
                                            Assigned to: {item.assignee}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="text-sm text-muted-foreground">
                                          {item.date.toLocaleDateString()}
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <MoreVertical className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            {item.type === 'task' ? (
                                              <>
                                                <DropdownMenuItem>
                                                  Edit Task
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                  Change Status
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                  Change Assignee
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                  Delete Task
                                                </DropdownMenuItem>
                                              </>
                                            ) : (
                                              <>
                                                <DropdownMenuItem>
                                                  Edit Event
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                  Delete Event
                                                </DropdownMenuItem>
                                              </>
                                            )}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="budget" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Budget Overview</h3>
                          <Button size="sm" onClick={() => {
                            // Get current budget value for the dialog
                            const currentBudget = selectedProject?.budget_total || 0;
                            const newBudget = window.prompt("Enter new budget amount:", currentBudget.toString());
                            
                            // If the user cancels or enters an invalid value, return
                            if (!newBudget || isNaN(parseFloat(newBudget))) return;
                            
                            // Update the budget in Supabase
                            supabase
                              .from('projects')
                              .update({ budget: parseFloat(newBudget) })
                              .eq('id', selectedProject?.id || '')
                              .then(({ error }) => {
                                if (error) {
                                  console.error('Error updating budget:', error);
                                  return;
                                }
                                
                                // Refresh projects data
                                fetchProjects();
                              });
                          }}>
                            <span className="mr-2">💰</span>
                            Change Budget
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                            <div>
                              <div className="text-sm text-gray-500">Total Budget</div>
                              <div className="text-lg font-semibold">
                                ${selectedProject.budget_total.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Spent</div>
                              <div className="text-lg font-semibold">
                                ${selectedProject.budget_spent.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Remaining</div>
                              <div className="text-lg font-semibold">
                                ${(selectedProject.budget_total - selectedProject.budget_spent).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {selectedProject.budget_breakdown.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <div className="font-medium">{item.category}</div>
                                  <div className="text-sm text-gray-500">
                                    ${item.amount.toLocaleString()} allocated
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    ${item.spent.toLocaleString()} spent
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ${(item.amount - item.spent).toLocaleString()} remaining
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="assets" className="mt-4">
                      <ProjectAssets projectId={selectedProject.id} />
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Task Dialog */}
          <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for the project. Fill in all the required information.
                </DialogDescription>
              </DialogHeader>

              <Form {...taskForm}>
                <form onSubmit={taskForm.handleSubmit(handleAddTask)} className="space-y-4">
                  <FormField
                    control={taskForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={taskForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={taskForm.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={taskForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={taskForm.control}
                    name="assignee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignee</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedProject?.team.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Task</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Task Dialog */}
          <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update the task details.
                </DialogDescription>
              </DialogHeader>

              <Form {...editTaskForm}>
                <form onSubmit={editTaskForm.handleSubmit(handleEditTask)} className="space-y-4">
                  <FormField
                    control={editTaskForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editTaskForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editTaskForm.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editTaskForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editTaskForm.control}
                    name="assignee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignee</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedProject?.team.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditTaskDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Change Status Dialog */}
          <Dialog open={isChangeStatusDialogOpen} onOpenChange={setIsChangeStatusDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Task Status</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Button 
                  variant={taskToEdit?.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => taskToEdit && handleChangeTaskStatus(taskToEdit, 'pending')}
                >
                  Pending
                </Button>
                <Button 
                  variant={taskToEdit?.status === 'in-progress' ? 'default' : 'outline'}
                  onClick={() => taskToEdit && handleChangeTaskStatus(taskToEdit, 'in-progress')}
                >
                  In Progress
                </Button>
                <Button 
                  variant={taskToEdit?.status === 'completed' ? 'default' : 'outline'}
                  onClick={() => taskToEdit && handleChangeTaskStatus(taskToEdit, 'completed')}
                >
                  Completed
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Change Assignee Dialog */}
          <Dialog open={isChangeAssigneeDialogOpen} onOpenChange={setIsChangeAssigneeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Task Assignee</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                {selectedProject?.team.map((member) => (
                  <Button
                    key={member.id}
                    variant={taskToEdit?.assigned_to === member.id ? 'default' : 'outline'}
                    onClick={() => taskToEdit && handleChangeTaskAssignee(taskToEdit, member.id)}
                    className="justify-start"
                  >
                    {member.email}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Task Dialog */}
          <AlertDialog open={isDeleteTaskDialogOpen} onOpenChange={setIsDeleteTaskDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the task "{taskToDelete?.title}".
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Task
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Project Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project "{projectToDelete?.name}" and all its associated data.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="gantt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <GanttChartComponent projects={projects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <CustomChart projects={projects} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 