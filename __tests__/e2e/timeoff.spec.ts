import { test, expect } from "@playwright/test";

test("Timeoff management test", async ({ page }) => {
  // Navigate to the homepage and click on the Login link
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

  // Navigate to the Timeoff section
  const timeoffLink = page.getByRole("link", { name: "Timeoff" });
  await timeoffLink.click();
  await expect(page).toHaveURL("https://chrona.me/time-off");

  // Interact with the 'Filter Name...' input
  const filterByNameInput = page.getByPlaceholder("Filter Name...");
  await filterByNameInput.click();
  await filterByNameInput.fill("Employee Name"); // Fill the filter with a specific name
  await expect(filterByNameInput).toHaveValue("Employee Name");

  // Open and close the 'Columns' configuration
  const columnsButton = page.getByRole("button", { name: "Columns" });
  await columnsButton.click(); // Open the Columns dropdown or dialog
  await page.getByLabel("Columns").press("Escape"); // Close the Columns dropdown or dialog by pressing 'Escape'

  // Interact with the pagination control
  const rowsPerPage = page.getByText("Rows per page");
  await rowsPerPage.click(); // Simulate clicking to expand pagination options

  // Open the 'Schedule Time-off' dialog
  const scheduleTimeOffButton = page.getByRole("button", {
    name: "Schedule Time-off",
  });
  await scheduleTimeOffButton.click();
  await expect(
    page.getByRole("heading", { name: "Schedule Time-off" })
  ).toBeVisible(); // Ensure the dialog is visible

  // Click to select Time-off type
  await page.getByText("Select your Time-off type,").click(); // Assuming this text is clickable and opens a type selection
  await page
    .locator("div")
    .filter({ hasText: /^Vacation$/ })
    .click(); // Select 'Vacation'
  await page
    .locator("div")
    .filter({ hasText: /^Sick Leave$/ })
    .click(); // Select 'Sick Leave'
  await page
    .locator("div")
    .filter({ hasText: /^Personal Time$/ })
    .click(); // Select 'Personal Time'
});
