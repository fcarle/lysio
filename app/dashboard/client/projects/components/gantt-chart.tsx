import { Project, Task } from '../types';

interface GanttChartProps {
  projects: Project[];
}

export function GanttChart({ projects }: GanttChartProps) {
  // Find the date range for all projects
  const getDateRange = () => {
    let earliestDate = new Date();
    let latestDate = new Date();
    
    projects.forEach(project => {
      const projectDate = new Date(project.deadline);
      if (projectDate > latestDate) {
        latestDate = projectDate;
      }
      // Also check task dates
      project.tasks?.forEach(task => {
        const taskDate = new Date(task.due_date);
        if (taskDate > latestDate) {
          latestDate = taskDate;
        }
      });
    });

    // Set earliest date to the first day of the current month
    earliestDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    // Set latest date to the last day of its month
    latestDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0);

    return { earliestDate, latestDate };
  };

  const { earliestDate, latestDate } = getDateRange();

  // Generate array of months between earliest and latest date
  const generateMonths = () => {
    const months = [];
    let currentDate = new Date(earliestDate);

    while (currentDate <= latestDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      const firstDay = currentDate.getDate();
      
      months.push({
        name: `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`,
        days: lastDay - firstDay + 1,
        startDay: firstDay,
        month,
        year
      });

      currentDate = new Date(year, month + 1, 1);
    }

    return months;
  };

  const months = generateMonths();
  const totalDays = months.reduce((sum, month) => sum + month.days, 0);

  // Helper function to calculate position in timeline
  const getTimelinePosition = (date: Date) => {
    const targetDate = new Date(date);
    let daysFromStart = 0;

    // Calculate days from start to this date
    for (const month of months) {
      if (targetDate.getFullYear() < month.year || 
          (targetDate.getFullYear() === month.year && targetDate.getMonth() < month.month)) {
        return 0;
      }
      
      if (targetDate.getFullYear() === month.year && targetDate.getMonth() === month.month) {
        daysFromStart += targetDate.getDate() - month.startDay + 1;
        break;
      }
      
      daysFromStart += month.days;
    }

    return Math.min(daysFromStart, totalDays);
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="flex flex-col border-b sticky top-0 bg-white z-10">
          {/* Month row */}
          <div className="flex">
            <div className="w-48 p-4 font-semibold">Project</div>
            <div className="flex-1 flex" style={{ minWidth: `calc(100% - 12rem)` }}>
              {months.map((month, i) => (
                <div
                  key={i}
                  className="border-l h-8 flex items-center justify-center text-sm font-medium"
                  style={{ width: `${(month.days / totalDays) * 100}%` }}
                >
                  {month.name}
                </div>
              ))}
            </div>
          </div>
          
          {/* Days row */}
          <div className="flex">
            <div className="w-48"></div>
            <div className="flex-1 flex" style={{ minWidth: `calc(100% - 12rem)` }}>
              {months.map((month, monthIndex) => (
                Array.from({ length: month.days }).map((_, i) => (
                  <div 
                    key={`${monthIndex}-${i}`} 
                    className="border-l p-2 text-center text-xs"
                    style={{ width: `${100 / totalDays}%`, minWidth: '40px' }}
                  >
                    <div className="font-medium">{i + month.startDay}</div>
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Project rows */}
        {projects.map((project) => {
          const deadline = new Date(project.deadline);
          const position = getTimelinePosition(deadline);

          return (
            <div key={project.id} className="flex border-b hover:bg-gray-50">
              <div className="w-48 p-4">
                <div className="font-medium truncate">{project.name}</div>
                <div className="text-xs text-gray-500">
                  Due: {deadline.toLocaleDateString()}
                </div>
              </div>
              <div className="flex-1 relative" style={{ minWidth: `calc(100% - 12rem)` }}>
                {/* Timeline grid */}
                <div className="absolute inset-0 flex">
                  {months.map((month, monthIndex) => (
                    Array.from({ length: month.days }).map((_, i) => (
                      <div 
                        key={`${monthIndex}-${i}`} 
                        className="border-l h-full"
                        style={{ width: `${100 / totalDays}%`, minWidth: '40px' }}
                      />
                    ))
                  ))}
                </div>
                
                {/* Project bar */}
                <div className="h-16 mt-2 relative">
                  <div
                    className={`absolute h-12 rounded-lg ${
                      project.status === 'completed' ? 'bg-green-100' :
                      project.status === 'in-progress' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}
                    style={{ 
                      left: '0',
                      width: `${(position / totalDays) * 100}%`,
                      minWidth: '40px'
                    }}
                  >
                    <div className="px-2 py-1 text-xs font-medium truncate">
                      {project.name}
                    </div>
                  </div>

                  {/* Task markers */}
                  {project.tasks?.map((task) => {
                    const taskDate = new Date(task.due_date);
                    const taskPosition = getTimelinePosition(taskDate);

                    return (
                      <div
                        key={task.id}
                        className="absolute top-0 h-full flex items-center justify-center group z-50"
                        style={{ 
                          left: `${(taskPosition / totalDays) * 100}%`,
                          width: '20px',
                          transform: 'translateX(-10px)'
                        }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                          } cursor-help shadow-sm relative`}
                        >
                          {/* Task tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-gray-300">Due: {taskDate.toLocaleDateString()}</div>
                            <div className="text-gray-300">Status: {task.status}</div>
                            {/* Triangle pointer */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                              <div className="border-4 border-transparent border-t-gray-800" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 