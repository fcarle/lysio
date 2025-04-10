'use client'

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import Image from 'next/image'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  src: string
  alt: string
}

export function ImageModal({ isOpen, onClose, src, alt }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <div className="relative w-full h-[80vh]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 