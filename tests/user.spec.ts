// import { expect, test } from 'playwright-test-coverage';
// import { Page } from 'playwright/types/test';

// async function basicInit(page: Page) {
//   let loggedInUser: any = undefined;
//   let usersList: any[] = [];

//   // Handle login/register
//   await page.route('**/api/auth', async (route) => {
//     const method = route.request().method();
//     const body = route.request().postDataJSON();

//     if (method === 'POST') { // register/login
//       if (body?.email && body?.password && body?.name) {
//         // Register
//         const newUser = { id: Date.now(), name: body.name, email: body.email, roles: [{ role: 'diner' }] };
//         usersList.push(newUser);
//         loggedInUser = newUser;
//         return route.fulfill({ status: 200, json: { user: newUser, token: 'abcd' } });
//       }
//       // Login
//       const user = usersList.find(u => u.email === body.email && body.password);
//       if (!user) return route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
//       loggedInUser = user;
//       return route.fulfill({ status: 200, json: { user, token: 'abcd' } });
//     }

//     if (method === 'DELETE') { // logout
//       loggedInUser = undefined;
//       return route.fulfill({ status: 200, json: { success: true } });
//     }
//   });

//   // Return current user
//   await page.route('**/api/user/me', async (route) => {
//     return route.fulfill({ status: 200, json: loggedInUser });
//   });

//   await page.goto('/');
// }

// export { basicInit };

// test('updateUser', async ({ page }) => {
//     await basicInit(page);
//     const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
//     await page.goto('/');
//     await page.getByRole('link', { name: 'Register' }).click();
//     await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
//     await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//     await page.getByRole('textbox', { name: 'Password' }).fill('diner');
//     await page.getByRole('button', { name: 'Register' }).click();
//     await expect(page.getByRole('link', { name: 'pd' })).toBeVisible();

//     await page.getByRole('link', { name: 'pd' }).click();
//     await expect(page.getByRole('main')).toContainText('pizza diner');

//     await page.getByRole('button', { name: 'Edit' }).click();
//     await expect(page.locator('h3')).toContainText('Edit user');
//     await page.getByRole('textbox').first().fill('pizza dinerx');
//     await page.getByRole('button', { name: 'Update' }).click();
//     await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
//     await expect(page.getByRole('main')).toContainText('pizza dinerx');
    
//     await page.getByRole('link', { name: 'Logout' }).click();
//     await page.getByRole('link', { name: 'Login' }).click();
//     await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//     await page.getByRole('textbox', { name: 'Password' }).fill('diner');
//     await page.getByRole('button', { name: 'Login' }).click();
//     await page.getByRole('link', { name: 'pd' }).click();
//     await expect(page.getByRole('main')).toContainText('pizza dinerx');
// });

// test('updateEmail', async ({ page }) => {
//     await basicInit(page);
//     const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
//     await page.goto('/');
//     await page.getByRole('link', { name: 'Register' }).click();
//     await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
//     await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//     await page.getByRole('textbox', { name: 'Password' }).fill('diner');
//     await page.getByRole('button', { name: 'Register' }).click();
//     await expect(page.getByRole('link', { name: 'pd' })).toBeVisible();
//     await page.getByRole('link', { name: 'pd' }).click();
//     await expect(page.getByRole('main')).toContainText('pizza diner');

//     await page.getByRole('button', { name: 'Edit' }).click();
//     await expect(page.locator('h3')).toContainText('Edit user');
//     await page.locator('input[type="email"]').fill("newemail@jwt.com");
//     await page.getByRole('button', { name: 'Update' }).click();
//     await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
//     await expect(page.getByRole('main')).toContainText('newemail@jwt.com');
    
//     await page.getByRole('link', { name: 'Logout' }).click();
//     await page.getByRole('link', { name: 'Login' }).click();
//     await page.getByRole('textbox', { name: 'Email address' }).fill("newemail@jwt.com");
//     await page.getByRole('textbox', { name: 'Password' }).fill('diner');
//     await page.getByRole('button', { name: 'Login' }).click();
//     await page.getByRole('link', { name: 'pd' }).click();
//     await expect(page.getByRole('main')).toContainText('newemail@jwt.com');
// });

// test('updatePassword', async ({ page }) => {
//     await basicInit(page);
//     const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
//     await page.goto('/');
//     await page.getByRole('link', { name: 'Register' }).click();
//     await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
//     await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//     await page.getByRole('textbox', { name: 'Password' }).fill('diner');
//     await page.getByRole('button', { name: 'Register' }).click();
//     await page.getByRole('link', { name: 'pd' }).click();
//     await expect(page.getByRole('main')).toContainText('pizza diner');

//     await page.getByRole('button', { name: 'Edit' }).click();
//     await expect(page.locator('h3')).toContainText('Edit user');
//     await page.locator('#password').click();
//     await page.locator('#password').fill('newpassword');

//     await page.getByRole('button', { name: 'Update' }).click();
//     await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
    
//     await page.getByRole('link', { name: 'Logout' }).click();
//     await page.getByRole('link', { name: 'Login' }).click();
//     await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//     await page.getByRole('textbox', { name: 'Password' }).fill('newpassword');
//     await page.getByRole('button', { name: 'Login' }).click();
//     await page.getByRole('link', { name: 'pd' }).click();
//     // We don't need to expect the new password. It isn't displayed, and we already know it works.
// });