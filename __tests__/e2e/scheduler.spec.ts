import { test, expect } from "@playwright/test";

test("Comprehensive navigation and interaction test on Chrona", async ({
  page,
}) => {
  // Navigate to the login page
  await page.goto("https://chrona.me/auth/login");
  // Fill in the email
  const emailInput = page.getByPlaceholder("Enter email");
  await emailInput.click();
  await emailInput.fill("test@chrona.me");
  await expect(emailInput).toHaveValue("test@chrona.me");

  // Use keyboard to navigate to the password input
  await emailInput.press("Tab");

  // Fill in the password
  const passwordInput = page.getByPlaceholder("Enter password");
  await expect(passwordInput).toBeFocused(); // Ensure focus has moved to password input
  await passwordInput.fill("test@chrona.me");
  await expect(passwordInput).toHaveValue("test@chrona.me");

  // Click the Sign In button
  const signInButton = page.getByRole("button", { name: "Sign In" });
  await signInButton.click();

  // Navigate to the scheduler page
  const timeoffLink = page.getByRole("link", { name: "Scheduler" });
  await timeoffLink.click();
  await expect(page).toHaveURL("https://chrona.me/scheduler");

  // Interact with the 'Filter by Name...' input
  const filterByNameInput = page.getByPlaceholder("Filter by Name...");
  await filterByNameInput.click();
  await filterByNameInput.fill("Test");

  // Click on 'Pick a date' button to open the date picker
  const pickDateButton = page.getByRole("button", { name: "Pick a date" });
  await pickDateButton.click();

  // Toggle visibility of columns
  const toggleColumnsButton = page.getByLabel("Toggle columns");
  await toggleColumnsButton.click();
});
