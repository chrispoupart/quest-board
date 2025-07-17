import React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "./button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}) => {
  if (totalPages <= 1) {
    return null
  }

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pageNumbers = new Set<number | string>()
    pageNumbers.add(1)

    // Add pages around current page
    for (let i = -1; i <= 1; i++) {
      const page = currentPage + i
      if (page > 1 && page < totalPages) {
        pageNumbers.add(page)
      }
    }

    pageNumbers.add(totalPages)

    const result: (number | string)[] = []
    let lastPage: number | string = 0
    for (const page of Array.from(pageNumbers).sort((a, b) => (a as number) - (b as number))) {
      if (lastPage !== 0 && (page as number) - (lastPage as number) > 1) {
        result.push("...")
      }
      result.push(page)
      lastPage = page
    }
    return result
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span data-testid="pagination-ellipsis" className="flex items-center justify-center w-8 h-8">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
