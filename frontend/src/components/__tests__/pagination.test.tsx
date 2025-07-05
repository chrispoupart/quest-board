import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { Pagination } from "../ui/pagination";

describe("Pagination component", () => {
  it("shows all page numbers when totalPages <= 5", () => {
    render(
      <Pagination currentPage={2} totalPages={4} onPageChange={() => {}} />
    );
    // Should show 1, 2, 3, 4
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    // Should not show ellipsis
    expect(screen.queryByTestId("pagination-ellipsis")).not.toBeInTheDocument();
  });

  it("shows ellipsis for large page counts", () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />
    );
    // Should show 1, ..., 3, 4, 5, 6, 7, ..., 10
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    // Should show at least one ellipsis
    expect(screen.getAllByTestId("pagination-ellipsis").length).toBeGreaterThan(0);
  });

  it("calls onPageChange when a page is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={4} onPageChange={onPageChange} />
    );
    fireEvent.click(screen.getByText("3"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
