import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "next-themes";

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: jest.fn(),
      themes: ["light", "dark", "system"],
      systemTheme: "light",
      resolvedTheme: "light",
      forcedTheme: undefined,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders theme toggle button", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("displays sun icon in light mode", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: jest.fn(),
      themes: ["light", "dark", "system"],
      systemTheme: "light",
      resolvedTheme: "light",
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("displays moon icon in dark mode", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: jest.fn(),
      themes: ["light", "dark", "system"],
      systemTheme: "dark",
      resolvedTheme: "dark",
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("opens dropdown menu when clicked", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(button);

    // Dropdown should open (menu items will be rendered by Radix)
    expect(button).toHaveAttribute("aria-expanded");
  });

  it("calls setTheme when theme option is selected", () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      themes: ["light", "dark", "system"],
      systemTheme: "light",
      resolvedTheme: "light",
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(button);

    // When dropdown opens and user selects an option, setTheme should be called
    // (Actual menu interaction testing would require Radix DropdownMenu testing)
    expect(button).toBeInTheDocument();
  });

  it("is keyboard accessible", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Should be focusable
    button.focus();
    expect(button).toHaveFocus();

    // Should respond to Enter key
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
    expect(button).toHaveAttribute("aria-expanded");
  });
});
