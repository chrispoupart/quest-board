import * as React from "react"
import { cn } from "../../lib/utils"

interface DialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

interface DialogContentProps {
    children: React.ReactNode
    className?: string
}

interface DialogHeaderProps {
    children: React.ReactNode
    className?: string
}

interface DialogTitleProps {
    children: React.ReactNode
    className?: string
}

interface DialogDescriptionProps {
    children: React.ReactNode
    className?: string
}

interface DialogFooterProps {
    children: React.ReactNode
    className?: string
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) =>
    open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange?.(false)}
            />
            <div className="relative z-50">
                {children}
            </div>
        </div>
    ) : null;

export const DialogContent = ({ children, className }: DialogContentProps) => (
    <div className={cn(
        "relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4",
        className
    )}>
        {children}
    </div>
);

export const DialogHeader = ({ children, className }: DialogHeaderProps) => (
    <div className={cn("mb-4", className)}>
        {children}
    </div>
);

export const DialogTitle = ({ children, className }: DialogTitleProps) => (
    <h2 className={cn("text-lg font-semibold", className)}>
        {children}
    </h2>
);

export const DialogDescription = ({ children, className }: DialogDescriptionProps) => (
    <p className={cn("text-sm text-gray-600", className)}>
        {children}
    </p>
);

export const DialogFooter = ({ children, className }: DialogFooterProps) => (
    <div className={cn("flex justify-end gap-2 mt-4", className)}>
        {children}
    </div>
);
