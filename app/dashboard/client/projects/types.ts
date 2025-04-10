export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  assigned_to: string;
  due_date: string;
}

export interface TeamMember {
  id: string;
  email: string;
  role: string;
  avatar: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface BudgetBreakdown {
  id: string;
  category: string;
  amount: number;
  spent: number;
}

export interface Project {
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