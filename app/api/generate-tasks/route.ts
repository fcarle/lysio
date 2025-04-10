import { NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const projectContext = await request.json();

    const prompt = `As an AI project manager, analyze the following project and company details to generate highly relevant tasks:

Project Details:
Name: ${projectContext.name}
Description: ${projectContext.description}
Category: ${projectContext.category}
Deadline: ${projectContext.deadline}
Priority: ${projectContext.priority}
Team Size: ${projectContext.teamSize} members
${projectContext.isRecurring ? `Recurring: Yes (${projectContext.repeatInterval})` : 'Recurring: No'}

Company Context:
Industry: ${projectContext.companyContext.industry}
Location: ${projectContext.companyContext.location}
About: ${projectContext.companyContext.about}
Target Audience: ${projectContext.companyContext.targetAudience}
Marketing Goals: ${projectContext.companyContext.marketingGoals}

Team Members and their Services:
${projectContext.teamMembers.map(member => `- ${member.email}: ${member.services.map(s => s.name).join(', ')}`).join('\n')}

Based on all these details, generate a list of 3-5 essential tasks that would be required to complete this project successfully. Consider:
1. The company's industry and target audience when designing tasks
2. Align tasks with the company's marketing goals
3. Match tasks to team members based on their expertise
4. Ensure tasks are appropriate for the local market (location)
5. Consider the company's background and approach

For each task:
1. Consider which service/expertise is required for the task
2. Assign the task to the most suitable team member based on their services
3. Provide a clear title and description that aligns with company goals
4. Set an appropriate due date before the project deadline
5. Assign a priority level

You must respond with ONLY a JSON array in this exact format, with no additional text:
[
  {
    "title": "Task title here",
    "description": "Task description here",
    "due_date": "YYYY-MM-DD",
    "priority": "high|medium|low",
    "assignee_id": "team_member_id",
    "required_service": "service_name"
  }
]

Make sure:
- Each task directly contributes to the company's marketing goals
- Tasks are appropriate for the target audience and industry
- Each task is assigned to a team member with the required expertise
- Tasks are distributed fairly among team members
- Task dependencies and timeline are logical
- Due dates are before the project deadline`;

    console.log('Sending request to Deepseek API...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a project management assistant that specializes in task assignment based on team member expertise. Always respond with valid JSON arrays only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Deepseek API error:', errorData);
      throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Deepseek API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid API response format');
    }

    let tasks;
    const content = data.choices[0].message.content;
    
    try {
      // Remove markdown code block markers if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      // Try to parse the response content as JSON
      tasks = JSON.parse(cleanContent);
      
      // Validate that tasks is an array
      if (!Array.isArray(tasks)) {
        console.error('Response is not an array:', tasks);
        throw new Error('Response is not an array');
      }

      // Process and validate the generated tasks
      const processedTasks = tasks.map(task => {
        if (!task || typeof task !== 'object') {
          console.error('Invalid task format:', task);
          return null;
        }

        // Ensure the due_date is in YYYY-MM-DD format
        let dueDate = task.due_date;
        if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
          dueDate = projectContext.deadline;
        }

        // Find the team member by email and get their ID
        let assigneeId = task.assignee_id;
        if (typeof assigneeId === 'string' && assigneeId.includes('@')) {
          const teamMember = projectContext.teamMembers.find(m => m.email.toLowerCase() === assigneeId.toLowerCase());
          assigneeId = teamMember ? teamMember.id : null;
        }

        return {
          title: task.title || 'Untitled Task',
          description: task.description || '',
          due_date: dueDate,
          priority: (task.priority || 'medium').toLowerCase(),
          assignee_id: assigneeId,
          required_service: task.required_service || '',
        };
      }).filter(Boolean); // Remove any null tasks

      if (processedTasks.length === 0) {
        throw new Error('No valid tasks generated');
      }

      console.log('Processed tasks:', processedTasks);
      return NextResponse.json(processedTasks);

    } catch (e) {
      console.error('Error parsing or processing tasks:', e);
      console.error('Raw content:', content);
      throw new Error(`Failed to process tasks: ${e.message}`);
    }

  } catch (error) {
    console.error('Error in generate-tasks API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate tasks' },
      { status: 500 }
    );
  }
} 