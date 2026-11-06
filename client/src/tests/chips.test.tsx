import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IngredientChips } from "../components/IngredientChips.js";

const TestWrapper: React.FC<{ initial?: string[]; maxLimit?: number }> = ({
  initial = [],
  maxLimit = 30,
}) => {
  const [ingredients, setIngredients] = useState<string[]>(initial);

  return (
    <IngredientChips
      ingredients={ingredients}
      onAdd={(item) => setIngredients((prev) => [...prev, item])}
      onRemove={(idx) => setIngredients((prev) => prev.filter((_, i) => i !== idx))}
      maxLimit={maxLimit}
    />
  );
};

describe("IngredientChips Component Tests", () => {
  it("adds an ingredient when Enter is pressed", () => {
    render(<TestWrapper />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "Tomatoes" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText("Tomatoes")).toBeInTheDocument();
  });

  it("adds an ingredient when comma is pressed", () => {
    render(<TestWrapper />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "Garlic" } });
    fireEvent.keyDown(input, { key: ",", code: "Comma" });

    expect(screen.getByText("Garlic")).toBeInTheDocument();
  });

  it("prevents case-insensitive duplicate ingredients", () => {
    render(<TestWrapper initial={["Pasta"]} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "pasta" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(
      screen.getByText('"pasta" is already in your pantry.')
    ).toBeInTheDocument();
  });

  it("removes an ingredient when clicking the remove button", () => {
    render(<TestWrapper initial={["Basil", "Olive oil"]} />);
    expect(screen.getByText("Basil")).toBeInTheDocument();

    const removeBasilBtn = screen.getByRole("button", {
      name: "Remove Basil",
    });
    fireEvent.click(removeBasilBtn);

    expect(screen.queryByText("Basil")).not.toBeInTheDocument();
    expect(screen.getByText("Olive oil")).toBeInTheDocument();
  });

  it("removes the last ingredient on backspace when input is empty", () => {
    render(<TestWrapper initial={["Onions", "Carrots"]} />);
    const input = screen.getByRole("textbox");

    fireEvent.keyDown(input, { key: "Backspace", code: "Backspace" });

    expect(screen.queryByText("Carrots")).not.toBeInTheDocument();
    expect(screen.getByText("Onions")).toBeInTheDocument();
  });

  it("enforces maxLimit of ingredients", () => {
    render(<TestWrapper initial={["A", "B"]} maxLimit={2} />);
    const input = screen.getByRole("textbox");

    expect(input).toBeDisabled();
    expect(screen.getByText("2/2 ingredients")).toBeInTheDocument();
  });
});
