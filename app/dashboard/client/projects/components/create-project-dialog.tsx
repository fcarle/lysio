'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Wand2, Loader2 } from 'lucide-react';

interface TeamMemberService {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: string;
  services: TeamMemberService[];
}

interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  assignee_id: string | null;
  required_service?: string;
}

const formSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['in-progress', 'completed', 'on-hold']),
  priority: z.enum(['high', 'medium', 'low']),
  deadline: z.string().min(1, 'Deadline is required'),
  budget_total: z.string().min(1, 'Budget is required'),
  currency: z.string().min(1, 'Currency is required'),
  is_recurring: z.boolean().default(false),
  repeat_interval: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  team_members: z.array(z.string()).default([]),
  tasks: z.array(z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    due_date: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    assignee_id: z.string().optional(),
    required_service: z.string().optional()
  })).default([]),
  timeline_events: z.array(z.object({
    title: z.string().min(1, 'Event title is required'),
    description: z.string().min(1, 'Event description is required'),
    date: z.string().min(1, 'Event date is required')
  })).default([]),
  budget_breakdown: z.array(z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.number().min(0, 'Amount must be positive'),
    description: z.string().optional()
  })).default([])
});

interface CreateProjectDialogProps {
  onProjectCreated: () => void;
  initialValues?: z.infer<typeof formSchema>;
}

export function CreateProjectDialog({ onProjectCreated, initialValues }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<TaskFormData[]>(
    initialValues?.tasks?.map(task => ({
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority as 'high' | 'medium' | 'low',
      assignee_id: task.assignee_id || null,
      required_service: task.required_service
    })) || []
  );
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      category: initialValues?.category || '',
      status: initialValues?.status || 'in-progress',
      priority: initialValues?.priority || 'medium',
      deadline: initialValues?.deadline || '',
      budget_total: initialValues?.budget_total || '',
      currency: initialValues?.currency || 'USD',
      is_recurring: initialValues?.is_recurring || false,
      repeat_interval: initialValues?.repeat_interval,
      team_members: initialValues?.team_members || [],
      tasks: initialValues?.tasks || [],
      timeline_events: initialValues?.timeline_events || [],
      budget_breakdown: initialValues?.budget_breakdown || [],
    },
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  async function fetchTeamMembers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if the user already has a team member record
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      let companyId;

      if (teamMemberError) {
        // If team member doesn't exist, we need to create a company first
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (companyError) {
          // Create a new company
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

        // Now create a team member record
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

        // Add owner permissions
        const ownerPermissions = [
          'view_dashboard',
          'view_projects',
          'manage_projects',
          'view_team',
          'manage_team',
          'view_settings',
          'manage_settings',
          'view_analytics',
          'manage_analytics',
          'use_ai_chat',
          'invite_team_members',
          'view_tasks',
          'manage_tasks',
          'view_all_tasks',
          'manage_services',
          'view_services'
        ];

        const { error: permissionsError } = await supabase
          .from('team_member_permissions')
          .insert(
            ownerPermissions.map(permission => ({
              team_member_id: newTeamMember.id,
              permission
            }))
          );

        if (permissionsError) throw permissionsError;
        companyId = newTeamMember.company_id;
      } else {
        companyId = teamMember.company_id;
      }

      if (!companyId) {
        throw new Error('No company ID available');
      }

      // Fetch team members with their permissions
      const { data: teamMembers, error: fetchError } = await supabase
        .from('team_members')
        .select(`
          id,
          email,
          role,
          status,
          team_member_permissions (
            permission
          )
        `)
        .eq('company_id', companyId);

      if (fetchError) throw fetchError;

      // Transform the data to match our interface
      const transformedMembers = teamMembers?.map(member => ({
        ...member,
        services: [] // Initialize with empty services array
      })) || [];

      setTeamMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch team members',
        variant: 'destructive',
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Form values on submit:", values);
      console.log("Tasks state on submit:", tasks);
      
      // Ensure tasks are properly synchronized with form
      if (tasks.length > 0 && (!values.tasks || values.tasks.length === 0)) {
        console.log("Synchronizing tasks state with form values");
        form.setValue('tasks', tasks);
        values = form.getValues(); // Get updated values
        console.log("Updated form values:", values);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if the user already has a team member record
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('id, company_id')
        .eq('user_id', user.id)
        .single();

      let companyId;

      if (teamMemberError) {
        // If team member doesn't exist, we need to create a company first
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (companyError) {
          // Create a new company
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

        // Now create a team member record
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

        // Add owner permissions
        const ownerPermissions = [
          'view_dashboard',
          'view_projects',
          'manage_projects',
          'view_team',
          'manage_team',
          'view_settings',
          'manage_settings',
          'view_analytics',
          'manage_analytics',
          'use_ai_chat',
          'invite_team_members',
          'view_tasks',
          'manage_tasks',
          'view_all_tasks',
          'manage_services',
          'view_services'
        ];

        const { error: permissionsError } = await supabase
          .from('team_member_permissions')
          .insert(
            ownerPermissions.map(permission => ({
              team_member_id: newTeamMember.id,
              permission
            }))
          );

        if (permissionsError) throw permissionsError;
        companyId = newTeamMember.company_id;
      } else {
        companyId = teamMember.company_id;
      }

      if (!companyId) {
        throw new Error('No company ID available');
      }

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: values.name,
          description: values.description,
          status: values.status,
          priority: values.priority,
          category: values.category,
          deadline: values.deadline,
          budget: parseFloat(values.budget_total) || 0,
          company_id: companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error('Failed to create project');

      // Add team members to the project
      if (values.team_members.length > 0) {
        const { error: teamError } = await supabase
          .from('project_team_members')
          .insert(
            values.team_members.map(memberId => ({
              project_id: project.id,
              team_member_id: memberId
            }))
          );

        if (teamError) throw teamError;
      }

      // Add timeline events
      if (values.timeline_events.length > 0) {
        const { error: timelineError } = await supabase
          .from('project_timeline_events')
          .insert(
            values.timeline_events.map(event => ({
              project_id: project.id,
              title: event.title,
              description: event.description,
              date: event.date
            }))
          );

        if (timelineError) throw timelineError;
      }

      // Add budget breakdown
      if (values.budget_breakdown.length > 0) {
        const { error: budgetError } = await supabase
          .from('project_budget_breakdown')
          .insert(
            values.budget_breakdown.map(item => ({
              project_id: project.id,
              category: item.category,
              amount: item.amount,
              description: item.description
            }))
          );

        if (budgetError) throw budgetError;
      }

      // Add tasks
      if (values.tasks.length > 0) {
        console.log("Attempting to add tasks:", values.tasks);
        
        // Map tasks to database format
        const tasksToInsert = values.tasks.map(task => ({
          project_id: project.id,
          title: task.title,
          description: task.description,
          due_date: task.due_date,
          priority: task.priority,
          status: 'todo',
          assigned_to: task.assignee_id
        }));
        
        console.log("Tasks mapped for insertion:", tasksToInsert);
        
        const { data: insertedTasks, error: tasksError } = await supabase
          .from('project_tasks')
          .insert(tasksToInsert)
          .select();

        console.log("Task insertion result:", { data: insertedTasks, error: tasksError });

        if (tasksError) {
          console.error("Task insertion error details:", tasksError);
          throw tasksError;
        }
      }

      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      setOpen(false);
      form.reset();
      if (onProjectCreated) {
        onProjectCreated();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      });
    }
  }

  const addTask = () => {
    setTasks([...tasks, {
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      assignee_id: null,
    }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof TaskFormData, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { 
      ...newTasks[index], 
      [field]: value,
      ...(field === 'assignee_id' && { assignee_id: value || null })
    };
    setTasks(newTasks);
    
    // Also update the form's tasks field to pass validation
    form.setValue('tasks', newTasks);
    console.log('Updated task:', newTasks[index]);
    console.log('All form tasks after update:', form.getValues('tasks'));
  };

  const generateSmartTasks = async () => {
    try {
      setIsGeneratingTasks(true);
      const formValues = form.getValues();
      
      // Get selected team members with their services
      const selectedTeamMembers = teamMembers
        .filter(member => formValues.team_members.includes(member.id))
        .map(member => ({
          id: member.id,
          email: member.email,
          services: member.services
        }));

      // Get company_id from current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('No authenticated user found');
      }

      // Fetch company settings directly using user_id
      const { data: companySettings, error: settingsError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (settingsError) {
        console.error('Error fetching company settings:', settingsError);
        throw new Error('Failed to fetch company settings');
      }

      // Prepare project context for AI
      const projectContext = {
        name: formValues.name,
        description: formValues.description,
        category: formValues.category,
        deadline: formValues.deadline,
        priority: formValues.priority,
        status: 'in-progress',
        teamSize: formValues.team_members.length,
        isRecurring: formValues.is_recurring,
        repeatInterval: formValues.repeat_interval,
        teamMembers: selectedTeamMembers,
        companyContext: {
          industry: companySettings.industry,
          location: companySettings.location,
          about: companySettings.about,
          targetAudience: companySettings.target_audience,
          marketingGoals: companySettings.marketing_goals,
        }
      };

      // Call Deepseek API
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectContext),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tasks');
      }

      const generatedTasks = await response.json();

      // Add generated tasks to the existing tasks
      setTasks([...tasks, ...generatedTasks.map(task => ({
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority as 'high' | 'medium' | 'low',
        assignee_id: task.assignee_id,
        required_service: task.required_service
      }))]);

      toast({
        title: "Success",
        description: "AI generated tasks have been added",
      });
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter project description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Web & Tech">Web & Tech</SelectItem>
                            <SelectItem value="Design & Creative">
                              Design & Creative
                            </SelectItem>
                            <SelectItem value="Marketing & Sales">
                              Marketing & Sales
                            </SelectItem>
                            <SelectItem value="Business & Consulting">
                              Business & Consulting
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Budget (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter project budget"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="CHF">CHF (Fr)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recurring Project</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_recurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This is a recurring project</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('is_recurring') && (
                    <FormField
                      control={form.control}
                      name="repeat_interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat Every</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select interval" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-muted/5">
              <FormField
                control={form.control}
                name="team_members"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Team Members *</FormLabel>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {teamMembers.map((member) => (
                        <FormField
                          key={member.id}
                          control={form.control}
                          name="team_members"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={member.id}
                                className="flex items-start space-x-3 space-y-0 bg-background rounded-md p-4 border"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(member.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            member.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== member.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    {member.email}
                                  </FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    {member.role}
                                  </p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tasks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Project Tasks</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateSmartTasks}
                    disabled={isGeneratingTasks || !form.getValues().description}
                    className="min-w-[120px]"
                  >
                    {isGeneratingTasks ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>AI Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        <span>Smart Add</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTask}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No tasks added yet. Click 'Smart Add' to generate tasks or 'Add Task' to create one manually.
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Task {index + 1}</h4>
                        {tasks.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTask(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`tasks.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter task title"
                                  value={task.title}
                                  onChange={(e) => updateTask(index, 'title', e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`tasks.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter task description"
                                  value={task.description}
                                  onChange={(e) => updateTask(index, 'description', e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.due_date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={task.due_date}
                                    onChange={(e) => updateTask(index, 'due_date', e.target.value)}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.priority`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select
                                  value={task.priority}
                                  onValueChange={(value) => updateTask(index, 'priority', value)}
                                >
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
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`tasks.${index}.assignee_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assignee</FormLabel>
                              <Select
                                value={task.assignee_id || ''}
                                onValueChange={(value) => {
                                  console.log('Selected assignee:', value);
                                  updateTask(index, 'assignee_id', value);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue>
                                      {task.assignee_id ? 
                                        teamMembers.find(m => m.id === task.assignee_id)?.email || 'Select team member'
                                        : 'Select team member'
                                      }
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {teamMembers
                                    .filter(member => 
                                      form.getValues().team_members.includes(member.id) && 
                                      (!task.required_service || 
                                      member.services.some(s => s.name === task.required_service))
                                    )
                                    .map(member => (
                                      <SelectItem 
                                        key={member.id} 
                                        value={member.id}
                                      >
                                        <div className="flex flex-col">
                                          <span>{member.email}</span>
                                          <span className="text-xs text-muted-foreground">
                                            Services: {member.services.map(s => s.name).join(', ')}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 sticky bottom-0 pt-4 bg-background border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 