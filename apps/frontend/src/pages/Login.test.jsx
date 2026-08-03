import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Login from "./Login";
import { AuthContext } from "../context/AuthContextInstance";

function renderLogin(login) {
  return render(
    <AuthContext.Provider value={{ login }}>
      <Login />
    </AuthContext.Provider>
  );
}

describe("Login", () => {
  it("renders the login form", () => {
    renderLogin(vi.fn());

    expect(screen.getByRole("img", { name: "PrimeAutocare" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("submits the entered username and password to login", async () => {
    const login = vi.fn().mockResolvedValue();
    const { container } = renderLogin(login);

    fireEvent.change(container.querySelector('input[type="text"]'), {
      target: { value: "jmartin" },
    });
    fireEvent.change(container.querySelector('input[type="password"]'), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith("jmartin", "secret123")
    );
  });
});
