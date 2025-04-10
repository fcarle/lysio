'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BookDemoDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function BookDemoDialog({ isOpen, onClose }: BookDemoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Schedule a Demo</DialogTitle>
        </DialogHeader>
        <div className="h-[600px] w-full">
          <iframe 
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1T6zqy13MGwiaQk-_vrHETd3iZgk6SFnmcYa99zM_DCPucZy5gcuiL0otIdf9DRBT766ghC7gV?gv=true" 
            width="100%" 
            height="100%" 
            frameBorder="0"
            className="rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 