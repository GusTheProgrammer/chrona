import { test, expect } from "@playwright/test";
test("Login and profile navigation test on Chrona", async ({ page }) => {
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

  // Wait for navigation after login
  await expect(page).toHaveURL("https://chrona.me/");

  // Click a specific button that appears after logging in
  const someButton = page.getByLabel("Main").getByRole("button").nth(1);
  await someButton.click();

  // Navigate to the profile page
  const profileLink = page.getByRole("link", { name: "Profile" });
  await profileLink.click();
  await expect(page).toHaveURL("https://chrona.me/account/profile");

  // Click somewhere on the page to test interaction
  await page.locator("html").click();
});
