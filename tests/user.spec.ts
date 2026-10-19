import { test, expect } from "playwright-test-coverage";
import { Page } from "@playwright/test";
import { User, Role } from "../src/service/pizzaService";

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;

  const validUsers: Record<string, User> = {
    "d@jwt.com": {
      id: "3",
      name: "pizza diner",
      email: "d@jwt.com",
      password: "a",
      roles: [{ role: Role.Diner }],
    },
    "a@jwt.com": {
      id: "4",
      name: "常用名字",
      email: "a@jwt.com",
      password: "admin",
      roles: [{ role: Role.Admin }],
    },
    "f@jwt.com": {
      id: "5",
      name: "pizza franchise",
      email: "f@jwt.com",
      password: "franchisee",
      roles: [{ role: Role.Franchisee }],
    },
  };

  // Register, log in, and log out.
  await page.route("**/api/auth", async (route) => {
    const method = route.request().method();

    if (method === "POST") {
      const body = route.request().postDataJSON();

      if (!body?.name || !body?.email || !body?.password) {
        return route.fulfill({
          status: 400,
          json: { message: "Missing registration fields" },
        });
      }

      if (validUsers[body.email]) {
        return route.fulfill({
          status: 409,
          json: { message: "User already exists" },
        });
      }

      const user: User = {
        id: String(Date.now()),
        name: body.name,
        email: body.email,
        password: body.password,
        roles: [{ role: Role.Diner }],
      };

      validUsers[user.email] = user;
      loggedInUser = user;

      return route.fulfill({
        json: { user, token: "abcdef" },
      });
    }

    if (method === "PUT") {
      const body = route.request().postDataJSON();
      const user = validUsers[body?.email];

      if (!user || user.password !== body.password) {
        return route.fulfill({
          status: 401,
          json: { message: "Unauthorized" },
        });
      }

      loggedInUser = user;

      return route.fulfill({
        json: { user, token: "abcdef" },
      });
    }

    if (method === "DELETE") {
      loggedInUser = undefined;
      return route.fulfill({
        json: { success: true },
      });
    }

    return route.continue();
  });

  // Get the currently logged-in user.
  await page.route("**/api/user/me", async (route) => {
    return route.fulfill({
      json: loggedInUser ?? null,
    });
  });

  // Update a user.
  await page.route(/\/api\/user\/[^/]+$/, async (route) => {
    if (route.request().method() !== "PUT") {
      return route.continue();
    }

    const body = route.request().postDataJSON();
    const oldEmail = loggedInUser?.email;
    const existingUser = validUsers[oldEmail ?? ""];

    if (!existingUser || String(body.id) !== existingUser.id) {
      return route.fulfill({
        status: 404,
        json: { message: "User not found" },
      });
    }

    const updatedUser: User = {
      ...existingUser,
      ...body,
      // Preserve the password if the update omits it or sends an empty value.
      password: body.password || existingUser.password,
    };

    if (updatedUser.email !== oldEmail && validUsers[updatedUser.email]) {
      return route.fulfill({
        status: 409,
        json: { message: "Email already exists" },
      });
    }

    if (oldEmail && oldEmail !== updatedUser.email) {
      delete validUsers[oldEmail];
    }

    validUsers[updatedUser.email] = updatedUser;
    loggedInUser = updatedUser;

    return route.fulfill({
      json: {
        user: updatedUser,
        token: "abcdef",
      },
    });
  });

  // Mock the pizza menu.
  await page.route("**/api/order/menu", async (route) => {
    return route.fulfill({
      json: [
        {
          id: 1,
          title: "Veggie",
          image: "pizza1.png",
          price: 0.0038,
          description: "A garden of delight",
        },
        {
          id: 2,
          title: "Pepperoni",
          image: "pizza2.png",
          price: 0.0042,
          description: "Spicy treat",
        },
      ],
    });
  });

  await page.goto("/");
}

test("updateUser", async ({ page }) => {
  await basicInit(page);

  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza diner");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  await page.getByRole("textbox").first().fill("pizza dinerx");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  await expect(page.getByRole("main")).toContainText("pizza dinerx");

  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza dinerx");
});

test("updateUser with password change", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // wait for a link with the name "pd" to appear and click it
  await page.waitForSelector('a:has-text("pd")');

  await page.getByRole("link", { name: "pd" }).click();

  await page.getByRole("button", { name: "Edit" }).click();

  await expect(page.locator("h3")).toContainText("Edit user");
  await page.locator("#password").fill("dinerx");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");

  await page.getByRole("textbox", { name: "Password" }).fill("dinerx");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza diner");
});

test("updateUser with email change", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd" }).click();
  await page.getByRole("button", { name: "Edit" }).click();

  await expect(page.locator("h3")).toContainText("Edit user");
  const newEmail = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

  await page.locator('input[type="email"]').fill(newEmail);

  await page.getByRole("button", { name: "Update" }).click();
  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });
});
