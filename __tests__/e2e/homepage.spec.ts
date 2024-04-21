import { test, expect } from "@playwright/test";

test("Chrona homepage tests", async ({ page }) => {
  // Go to the homepage
  await page.goto("https://chrona.me/");

  // wait for the page to load
  await page.waitForLoadState("domcontentloaded");

  // Assertions for various headings and text content
  const workforceManagementHeading = page.getByRole("heading", {
    name: "chrona. Workforce Management",
  });
  await expect(workforceManagementHeading).toBeVisible();
  await workforceManagementHeading.click();

  const featuresHeading = page.getByRole("heading", { name: "Features" });
  await expect(featuresHeading).toBeVisible();
  await featuresHeading.click();

  const shiftManagementHeading = page.getByRole("heading", {
    name: "Shift Management",
  });
  await expect(shiftManagementHeading).toBeVisible();
  await shiftManagementHeading.click();

  const holidayPlanningHeading = page.getByRole("heading", {
    name: "Holiday Planning",
  });
  await expect(holidayPlanningHeading).toBeVisible();
  await holidayPlanningHeading.click();

  const timeOffTrackingHeading = page.getByRole("heading", {
    name: "Time Off Tracking",
  });
  await expect(timeOffTrackingHeading).toBeVisible();
  await timeOffTrackingHeading.click();

  const employeeSchedulingHeading = page.getByRole("heading", {
    name: "Employee Scheduling",
  });
  await expect(employeeSchedulingHeading).toBeVisible();
  await employeeSchedulingHeading.click();

  const teamManagementHeading = page.getByRole("heading", {
    name: "Team Management",
  });
  await expect(teamManagementHeading).toBeVisible();
  await teamManagementHeading.click();

  await expect(page.getByText("At Chrona, we believe")).toBeVisible();
  await page.getByText("At Chrona, we believe").click();

  await expect(page.getByText("Client-Centric")).toBeVisible();
  await page.getByText("Client-Centric").click();

  const clientCentricServicesHeading = page.getByRole("heading", {
    name: "Client-Centric Services",
  });
  await expect(clientCentricServicesHeading).toBeVisible();
  await clientCentricServicesHeading.click();

  await expect(page.getByText("Chrona is committed to")).toBeVisible();
  await page.getByText("Chrona is committed to").click();

  await expect(page.getByText("Plan and visualize team")).toBeVisible();
  await page.getByText("Plan and visualize team").click();

  await expect(page.getByText("Easily manage time off")).toBeVisible();
  await page.getByText("Easily manage time off").click();

  await expect(page.getByText("Optimize your workforce")).toBeVisible();
  await page.getByText("Optimize your workforce").click();

  await expect(page.getByText("Monitor and analyze workforce")).toBeVisible();
  await page.getByText("Monitor and analyze workforce").click();

  const faqHeading = page.getByRole("heading", {
    name: "Frequently Asked Questions",
  });
  await expect(faqHeading).toBeVisible();
  await faqHeading.click();

  const howCanImproveButton = page.getByRole("button", {
    name: "How can Chrona improve our",
  });
  await expect(howCanImproveButton).toBeVisible();
  await howCanImproveButton.click();

  await expect(page.getByText("Chrona simplifies the")).toBeVisible();
  await page.getByText("Chrona simplifies the").click();
});
