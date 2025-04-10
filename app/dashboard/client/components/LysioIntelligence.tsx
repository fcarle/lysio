import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Sparkles, Mail, Edit, Save, Check, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CreateProjectDialog } from '../projects/components/create-project-dialog'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTeamMembers, useProjects, useCompanySettings } from '@/lib/queries'
import styles from '@/app/styles/animations.module.css'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  showActions?: boolean
  isTyping?: boolean
  isProjectCreation?: boolean
}

interface ActionState {
  editing: boolean
  reviewing: boolean
  saving: boolean
}

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  team_member_responsibilities?: { responsibility: string }[]
  responsibilities?: string[]
}

interface Project {
  id: string
  name: string
  status: string
  progress: number
  deadline: string
  team_size: number
}

interface ProjectDraft {
  name: string
  description: string
  category: string
  status: string
  priority: string
  deadline: string
  budget?: number
  currency: string
  isRecurring: boolean
  team_members: string[]
  tasks: string[]
}

export function LysioIntelligence() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionState, setActionState] = useState<ActionState>({
    editing: false,
    reviewing: false,
    saving: false
  })
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>({
    name: '',
    description: '',
    category: '',
    status: 'in-progress',
    priority: 'medium',
    deadline: '',
    currency: 'USD',
    isRecurring: false,
    team_members: [],
    tasks: []
  })
  const router = useRouter()
  const { user, userId } = useAuth()
  const supabase = createClientComponentClient()
  
  // Using our shared query hooks
  const { data: teamMembers = [], isLoading: isTeamMembersLoading } = useTeamMembers(userId)
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects(userId)
  const { data: companySettings, isLoading: isSettingsLoading } = useCompanySettings(userId)
  
  // Set loading state based on query loading states
  useEffect(() => {
    setLoading(isTeamMembersLoading || isProjectsLoading || isSettingsLoading)
  }, [isTeamMembersLoading, isProjectsLoading, isSettingsLoading])

  useEffect(() => {
    // Only check authentication now, not fetching data
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        
        if (!session) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth error:', error)
        toast.error('Authentication error')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  const formatMessage = (text: string) => {
    if (!text.includes('**Category:**')) {
      // For project-related messages but not project creation
      let formattedText = text
        // Format headers (###)
        .replace(/### (.*?)\n/g, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
        
        // Format suggestions section
        .replace(/Suggestions:/g, '<div class="font-semibold text-gray-700 mt-4 mb-2">Suggestions:</div>')
        
        // Format numbered suggestions with bullets
        .replace(/(\d+\. \*\*.*?\*\*)/g, '<div class="flex items-center space-x-2 my-2"><div class="w-2 h-2 rounded-full bg-purple-400"></div><span class="font-medium">$1</span></div>')
        
        // Format "Would you like me to:" section
        .replace(/Would you like me to:/g, '<div class="text-gray-700 mt-4 mb-2 font-medium">Would you like me to:</div>')
        
        // Format bullet points with custom bullets
        .replace(/- \*\*(.*?)\*\*/g, '<div class="flex items-center space-x-2 my-1 ml-4"><div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div><span class="text-blue-600">$1</span></div>')
        
        // Format reference section
        .replace(/\*\*Existing.*?Reference:\*\*/g, '<div class="mt-4 p-3 bg-gray-50 rounded-lg"><div class="font-medium text-gray-700 mb-2">Existing Project Reference:</div>')
        
        // Format reference details
        .replace(/\*\*Name:\*\* (.*?)\n/g, '<div class="text-sm"><span class="font-medium">Name:</span> <span class="text-gray-700">$1</span></div>')
        .replace(/\*\*Description:\*\* (.*?)\n/g, '<div class="text-sm"><span class="font-medium">Description:</span> <span class="text-gray-700">$1</span></div>')
        .replace(/\*\*Deadline:\*\* (.*?)\n/g, '<div class="text-sm"><span class="font-medium">Deadline:</span> <span class="text-gray-700">$1</span></div>')
        .replace(/\*\*Budget:\*\* (.*?)(?:\n|$)/g, '<div class="text-sm"><span class="font-medium">Budget:</span> <span class="text-green-600">$1</span></div></div>')
        
        // Format network references with a special style
        .replace(/(network of pre-vetted|qualified professionals in our network|check our network)/gi, '<span class="text-blue-600 font-medium cursor-pointer hover:underline">$1</span>')
        
        // Format any remaining bold text
        .replace(/\*\*(.*?)\*\*/g, '<span class="font-medium text-gray-800">$1</span>')
        
        // Format line breaks
        .replace(/\n\n/g, '<div class="my-3"></div>')
        .replace(/\n/g, '<br>')

      // Format team member names
      teamMembers.forEach(member => {
        const parts = formattedText.split(member.name)
        if (parts.length > 1) {
          formattedText = parts.join(`<span class="text-blue-600 font-semibold">${member.name}</span>`)
        }
      })

      return formattedText
    }

    // For project creation messages, use the existing formatting
    let formattedText = text
      // Format project name
      .replace(/^([^]*?)(?=\n\n|$)/, '<h2 class="text-2xl font-bold text-purple-700 mb-6">$1</h2>')
      
      // Format project details section
      .replace(/Category: ([^]*?)\nBudget: ([^]*?)\nPriority: ([^]*?)(?=\n|$)/, `
        <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          <div>
            <div class="text-sm text-gray-500 mb-1">Category</div>
            <div class="font-medium text-blue-600">$1</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Budget</div>
            <div class="font-medium text-green-600">$2</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Priority</div>
            <div class="font-medium text-red-600">$3</div>
          </div>
        </div>
      `)
      
      // Format project description
      .replace(/Project Description:\n([^]*?)(?=\n\nTASKS:|$)/, `
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Project Description</h3>
          <div class="text-gray-600 leading-relaxed">$1</div>
        </div>
      `)
      
      // Format tasks section
      .replace(/TASKS:\n([\s\S]*?)(?=\n\n---|$)/, (match, tasks) => {
        const tasksList = tasks.split('\n')
          .filter(task => task.trim())
          .map(task => {
            const taskMatch = task.match(/\d+\. (.*?): (.*?) \(Priority: (.*?)\)/)
            if (!taskMatch) return ''
            const [_, title, desc, priority] = taskMatch
            const priorityColor = priority.toLowerCase() === 'high' ? 'text-red-600' : 
                                priority.toLowerCase() === 'medium' ? 'text-yellow-600' : 
                                'text-blue-600'
            return `
              <div class="flex items-start space-x-4 mb-4">
                <div class="w-2 h-2 mt-2 rounded-full bg-purple-400 flex-shrink-0"></div>
                <div class="flex-1">
                  <div class="font-medium text-gray-800">${title}</div>
                  <div class="text-gray-600 mt-1">${desc}</div>
                  <div class="text-sm ${priorityColor} mt-1">Priority: ${priority}</div>
                </div>
              </div>`
          })
          .join('')

        return `
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Tasks</h3>
            <div class="space-y-2">
              ${tasksList}
            </div>
          </div>`
      })
      
      // Format notes section if present
      .replace(/Notes:\n([\s\S]*?)(?=\n\n|$)/, `
        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Notes</h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
            $1
          </ul>
        </div>
      `)

      // Clean up any remaining markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\n\n---\n\n/g, '')
      .replace(/\n/g, '<br>')

    return formattedText
  }

  const handleAction = async (action: keyof ActionState) => {
    setActionState(prev => ({ ...prev, [action]: true }))
    
    try {
      switch (action) {
        case 'editing':
          setIsEditDialogOpen(true)
          // Parse the last AI message to extract project details
          const lastAIMessage = messages.find(m => m.sender === 'ai' && m.isProjectCreation)
          if (lastAIMessage) {
            const content = lastAIMessage.content
            
            // Extract project name (first line after the # symbol)
            const nameMatch = content.match(/# ([^\n]+)/)
            const name = nameMatch ? nameMatch[1].trim() : ''
            
            // Extract category
            const categoryMatch = content.match(/\*\*Category:\*\* ([^\n]+)/)
            const category = categoryMatch ? categoryMatch[1].trim() : companySettings.industry || 'Marketing & Sales'
            
            // Extract budget
            const budgetMatch = content.match(/\*\*Budget:\*\* \$?([\d,]+)\s*([A-Z]{3})/)
            const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : companySettings.budget
            const currency = budgetMatch ? budgetMatch[2] : companySettings.currency || 'USD'
            
            // Extract priority
            const priorityMatch = content.match(/\*\*Priority:\*\* ([^\n]+)/)
            const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium'
            
            // Extract description (between Project Description: and TASKS:)
            const descriptionMatch = content.match(/\*\*Project Description:\*\*\s*([^]*?)(?=\*\*TASKS:|$)/)
            const description = descriptionMatch ? descriptionMatch[1].trim() : ''
            
            // Extract tasks
            const tasksMatch = content.match(/\*\*TASKS:\*\*\s*([^]*?)(?=\n\n|$)/)
            const tasks = tasksMatch ? tasksMatch[1]
              .split('\n')
              .map(task => task.trim())
              .filter(task => task.match(/^\d+\.\s*\*\*.*?\*\*/)) // Match numbered tasks with bold titles
              .map(task => {
                const taskMatch = task.match(/^\d+\.\s*\*\*(.*?)\*\*\s*(.*)/)
                return taskMatch ? `${taskMatch[1]}: ${taskMatch[2]}` : task
              })
              : []

            // Get the first team member (owner) by default
            const defaultTeamMember = teamMembers.length > 0 ? [teamMembers[0].id] : []
            
            // Set project deadline to 30 days from now
            const projectDeadline = new Date()
            projectDeadline.setDate(projectDeadline.getDate() + 30)
            const projectDeadlineStr = projectDeadline.toISOString().split('T')[0]

            // Create tasks with staggered deadlines
            const tasksWithDeadlines = tasks.map((task, index) => {
              const taskDeadline = new Date(projectDeadline)
              // High priority tasks get earlier deadlines
              const isHighPriority = task.toLowerCase().includes('high priority')
              const daysToSubtract = isHighPriority 
                ? 20 - (index * 2) // High priority tasks start 20 days before project end
                : 15 - (index * 2) // Other tasks start 15 days before project end
              taskDeadline.setDate(taskDeadline.getDate() - daysToSubtract)
              return {
                title: task.split(':')[0],
                description: task,
                due_date: taskDeadline.toISOString().split('T')[0],
                priority: isHighPriority ? 'high' : 'medium',
                assignee_id: null
              }
            })

            // Create project draft with all fields
            const newProjectDraft: ProjectDraft = {
              name,
              description,
              category,
              status: 'in-progress',
              priority,
              deadline: projectDeadlineStr,
              budget,
              currency,
              isRecurring: false,
              team_members: defaultTeamMember,
              tasks: tasksWithDeadlines.map(task => `${task.title}: ${task.description}`)
            }
            
            setProjectDraft(newProjectDraft)

            // Pre-fill the CreateProjectDialog form
            setIsEditDialogOpen(true)
          }
          break
        case 'reviewing':
          setIsReviewDialogOpen(true)
          break
        case 'saving':
          await saveProject()
          break
      }
    } catch (error) {
      console.error('Error handling action:', error)
      toast.error('Failed to complete action')
    } finally {
      setActionState(prev => ({ ...prev, [action]: false }))
    }
  }

  const saveProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectDraft.name,
          description: projectDraft.description,
          deadline: projectDraft.deadline,
          company_id: user.id,
          status: 'draft',
          progress: 0
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Add team members to the project
      if (projectDraft.team_members.length > 0) {
        const { error: teamError } = await supabase
          .from('project_team_members')
          .insert(
            projectDraft.team_members.map(memberId => ({
              project_id: project.id,
              team_member_id: memberId
            }))
          )

        if (teamError) throw teamError
      }

      // Add tasks to the project
      if (projectDraft.tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from('project_tasks')
          .insert(
            projectDraft.tasks.map(task => ({
              project_id: project.id,
              description: task,
              status: 'pending'
            }))
          )

        if (tasksError) throw tasksError
      }

      toast.success('Project saved and team notified')
      setIsEditDialogOpen(false)
      setIsReviewDialogOpen(false)
      setProjectDraft({
        name: '',
        description: '',
        category: companySettings.industry || 'Marketing & Sales',
        status: 'in-progress',
        priority: 'medium',
        deadline: '',
        currency: companySettings.currency || 'USD',
        isRecurring: false,
        team_members: [],
        tasks: []
      })
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Failed to save project')
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsAITyping(true)

    // Create initial AI message
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
      isTyping: true
    }
    setMessages(prev => [...prev, aiMessage])

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are Lysio Intelligence, an AI assistant for the Lysio platform. You have access to the following context:
              Team Members: ${JSON.stringify(teamMembers)}
              Projects: ${JSON.stringify(projects)}
              Company Settings: ${JSON.stringify(companySettings)}
              Please help users with their projects, team management, and other tasks.
              
              IMPORTANT: When suggesting or creating a project, you MUST start your response with "PROJECT_CREATION" on its own line, followed by a blank line, then use this EXACT format:

              # [Project Name]

              **Category:** [Web & Tech | Design & Creative | Marketing & Sales | Business & Consulting]
              **Budget:** $[Amount] [Currency]
              **Priority:** [High | Medium | Low]

              **Project Description:**
              [Detailed project description...]

              **TASKS:**
              1. **[Task Title]:** [Task description] (Priority: [High | Medium | Low])
              2. **[Task Title]:** [Task description] (Priority: [High | Medium | Low])
              3. **[Task Title]:** [Task description] (Priority: [High | Medium | Low])
              ...

              For non-project responses, do not include the PROJECT_CREATION marker or any of the above sections.
              
              IMPORTANT: When users ask about finding freelancers, agencies, or team members for specific roles or services, ALWAYS direct them to the Lysio Network. Your response should:
              1. Acknowledge their need for the specific role/service
              2. Explain that the Lysio Network can help find the perfect match
              3. Highlight that the network includes pre-vetted professionals
              4. Reference the network in a natural way, like "You can find qualified professionals in our network" or "Check our network of pre-vetted experts"
              5. NEVER use asterisks or quotes around "Find Matches in Lysio Network"
              
              Use the company settings to provide more personalized and relevant responses, especially regarding:
              - Industry-specific recommendations
              - Budget considerations (use the company's budget and currency)
              - Marketing goals and targeting
              - Company location and context`
            },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: input
            }
          ]
        }),
      })

      if (!response.ok) throw new Error('Failed to get AI response')
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        // Process the chunk - split by data: and filter empty lines
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))
        
        for (const line of lines) {
          try {
            // Extract the JSON content
            const jsonStr = line.replace(/^data: /, '').trim()
            if (jsonStr === '[DONE]') continue
            
            const jsonData = JSON.parse(jsonStr)
            const content = jsonData.choices?.[0]?.delta?.content || ''
            
            // Append the new content
            aiResponse += content
            
            // Update the AI message with new content
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: aiResponse,
                    isTyping: false,
                    showActions: aiResponse.includes('PROJECT_CREATION'),
                    isProjectCreation: aiResponse.includes('PROJECT_CREATION')
                  }
                : msg
            ))
          } catch (e) {
            console.error('Error parsing chunk:', e)
            continue
          }
        }
      }

      // Process final response
      if (aiResponse.includes('PROJECT_CREATION')) {
        // Extract project name
        const nameMatch = aiResponse.match(/# ([^\n]+)/)
        const name = nameMatch ? nameMatch[1].trim() : ''
        
        // Extract category
        const categoryMatch = aiResponse.match(/\*\*Category:\*\* ([^\n]+)/)
        const category = categoryMatch ? categoryMatch[1].trim() : companySettings.industry || 'Marketing & Sales'
        
        // Extract budget
        const budgetMatch = aiResponse.match(/\*\*Budget:\*\* \$?([\d,]+)\s*([A-Z]{3})/)
        const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : companySettings.budget
        const currency = budgetMatch ? budgetMatch[2] : companySettings.currency || 'USD'
        
        // Extract priority
        const priorityMatch = aiResponse.match(/\*\*Priority:\*\* ([^\n]+)/)
        const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium'
        
        // Extract description
        const descriptionMatch = aiResponse.match(/\*\*Project Description:\*\*\s*([^]*?)(?=\*\*TASKS:|$)/)
        const description = descriptionMatch ? descriptionMatch[1].trim() : ''
        
        // Extract tasks
        const tasksMatch = aiResponse.match(/\*\*TASKS:\*\*\s*([^]*?)(?=\n\n|$)/)
        const tasks = tasksMatch ? tasksMatch[1]
          .split('\n')
          .map(task => task.trim())
          .filter(task => task.match(/^\d+\.\s*\*\*.*?\*\*/)) // Match numbered tasks with bold titles
          .map(task => {
            const taskMatch = task.match(/^\d+\.\s*\*\*(.*?)\*\*\s*(.*)/)
            return taskMatch ? `${taskMatch[1]}: ${taskMatch[2]}` : task
          })
          : []

        // Get the first team member (owner) by default
        const defaultTeamMember = teamMembers.length > 0 ? [teamMembers[0].id] : []
        
        // Set project deadline to 30 days from now
        const projectDeadline = new Date()
        projectDeadline.setDate(projectDeadline.getDate() + 30)
        const projectDeadlineStr = projectDeadline.toISOString().split('T')[0]

        // Create tasks with staggered deadlines
        const tasksWithDeadlines = tasks.map((task, index) => {
          const taskDeadline = new Date(projectDeadline)
          // High priority tasks get earlier deadlines
          const isHighPriority = task.toLowerCase().includes('high priority')
          const daysToSubtract = isHighPriority 
            ? 20 - (index * 2) // High priority tasks start 20 days before project end
            : 15 - (index * 2) // Other tasks start 15 days before project end
          taskDeadline.setDate(taskDeadline.getDate() - daysToSubtract)
          return {
            title: task.split(':')[0],
            description: task,
            due_date: taskDeadline.toISOString().split('T')[0],
            priority: isHighPriority ? 'high' : 'medium',
            assignee_id: null
          }
        })

        // Create project draft with all fields
        const newProjectDraft: ProjectDraft = {
          name,
          description,
          category,
          status: 'in-progress',
          priority,
          deadline: projectDeadlineStr,
          budget,
          currency,
          isRecurring: false,
          team_members: defaultTeamMember,
          tasks: tasksWithDeadlines.map(task => `${task.title}: ${task.description}`)
        }
        
        setProjectDraft(newProjectDraft)
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      toast.error('Failed to get AI response')
      // Remove the AI message on error
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId))
    } finally {
      setIsAITyping(false)
    }
  }

  // Update the typing indicator to use CSS module
  const renderTypingIndicator = () => (
    <div className="flex items-center">
      <span className={styles.typingDot}></span>
      <span className={styles.typingDot}></span>
      <span className={styles.typingDot}></span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading Lysio Intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-semibold">Lysio Intelligence</h2>
      </div>

      <Card className="p-6">
        <div className="flex flex-col h-[400px]">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Ask Lysio Intelligence to help you plan projects, find partners, and organize your team.
            </p>
          </div>
          
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div className={`flex items-start space-x-3 ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`p-2 rounded-full ${
                      message.sender === 'ai' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {message.sender === 'ai' ? (
                        <Bot className="h-5 w-5 text-purple-600" />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className={`flex-1 rounded-lg p-3 ${
                      message.sender === 'ai' ? 'bg-gray-100' : 'bg-blue-50'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center">
                          <div className="mr-3 flex-shrink-0">
                            <Bot className="h-8 w-8 text-blue-500" />
                          </div>
                          <div>
                            Thinking
                            {renderTypingIndicator()}
                          </div>
                        </div>
                      ) : (
                        <p 
                          className="text-sm whitespace-pre-line message-content"
                          dangerouslySetInnerHTML={{
                            __html: message.sender === 'ai' ? formatMessage(message.content) : message.content
                          }}
                        />
                      )}
                      <span className="text-xs text-gray-400 mt-1 block">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                  
                  {message.showActions && message.isProjectCreation && (
                    <div className="mt-2 flex space-x-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-2"
                        onClick={() => handleAction('editing')}
                        disabled={actionState.editing}
                      >
                        {actionState.editing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                        <span>{actionState.editing ? 'Opening...' : 'Review Project'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex space-x-2">
            <Input
              placeholder="Ask Lysio Intelligence for help with your projects..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
              disabled={isAITyping}
            />
            <Button 
              onClick={handleSend} 
              size="lg" 
              disabled={isAITyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Review Project with Team</DialogTitle>
            <DialogDescription>
              Select team members to review this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-2">
                <Checkbox
                  id={member.id}
                  checked={selectedTeamMembers.includes(member.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTeamMembers(prev => [...prev, member.id])
                    } else {
                      setSelectedTeamMembers(prev => prev.filter(id => id !== member.id))
                    }
                  }}
                />
                <Label htmlFor={member.id} className="text-sm">
                  {member.name} ({member.role})
                </Label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Project</DialogTitle>
          </DialogHeader>
          <CreateProjectDialog 
            initialValues={{
              name: projectDraft.name,
              description: projectDraft.description,
              category: projectDraft.category,
              status: projectDraft.status as 'in-progress' | 'completed' | 'on-hold',
              priority: projectDraft.priority as 'high' | 'medium' | 'low',
              deadline: projectDraft.deadline,
              budget_total: projectDraft.budget?.toString() || '',
              currency: projectDraft.currency,
              is_recurring: projectDraft.isRecurring,
              repeat_interval: undefined,
              team_members: projectDraft.team_members,
              tasks: projectDraft.tasks.map((task, index) => {
                const taskDeadline = new Date(projectDraft.deadline)
                const isHighPriority = task.toLowerCase().includes('high priority')
                const daysToSubtract = isHighPriority 
                  ? 20 - (index * 2)
                  : 15 - (index * 2)
                taskDeadline.setDate(taskDeadline.getDate() - daysToSubtract)
                return {
                  title: task.split(':')[0],
                  description: task,
                  due_date: taskDeadline.toISOString().split('T')[0],
                  priority: isHighPriority ? 'high' : 'medium',
                  assignee_id: null
                }
              })
            }}
            onProjectCreated={() => {
              setIsEditDialogOpen(false)
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 