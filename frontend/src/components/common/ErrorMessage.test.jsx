import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ErrorMessage from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("renders nothing when no message is provided", () => {
    const { container } = render(<ErrorMessage />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the provided error message", () => {
    render(<ErrorMessage message="Unable to save document" />);

    expect(screen.getByText("Unable to save document")).toBeInTheDocument();
  });
});
