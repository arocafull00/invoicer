import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/shared/components/dialog"
import { Button } from "@/shared/components/button"

export interface ConfirmDialogProps {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onOpenChange?: (open: boolean) => void
}

export function ConfirmDialog({
  open,
  title = "Confirmar acción",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleConfirm() {
    try {
      setIsSubmitting(true)
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              {cancelText}
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm} variant="destructive" disabled={isSubmitting}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDialog


