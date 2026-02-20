import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { User, Role } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  let validUsers: Record<string, User> = { 
    'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
     'a@jwt.com': { id: '4', name: 'Admin', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] },
    'f@jwt.com': { id: '5', name: 'franchisee', email: 'f@jwt.com', password: 'franchisee', roles: [{ role: Role.Franchisee }] },
  };
  
  // Authorize login for the given user
  await page.route('**/api/auth', async (route) => {
  const method = route.request().method();

  // Handle LOGIN
  if (method === 'POST' || method === 'PUT') {
    const loginReq = route.request().postDataJSON();

    if (!loginReq || !loginReq.email) {
      return route.fulfill({ status: 400 });
    }

    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      return route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
    }

    loggedInUser = user;

    return route.fulfill({
      json: {
        user,
        token: 'abcdef',
      },
    });
  }

  // Handle LOGOUT
  if (method === 'DELETE') {
    loggedInUser = undefined;
    return route.fulfill({ json: { success: true } });
  }

  return route.continue();
});

  
  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  let franchiseRes = {
  franchises: [
    {
      id: 2,
      name: 'LotaPizza',
      stores: [
        { id: 4, name: 'Lehi' },
        { id: 5, name: 'Springville' },
        { id: 6, name: 'American Fork' },
      ],
    },
    { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
    { id: 4, name: 'topSpot', stores: [] },
  ],
};
  await page.route(/\/api\/franchise.*/, async (route) => {
  const method = route.request().method();
  const url = route.request().url();

  // GET all franchises
  if (method === 'GET') {
    return route.fulfill({ json: franchiseRes });
  }

  // CREATE franchise
  if (method === 'POST' && url.endsWith('/api/franchise')) {
    const body = route.request().postDataJSON();
    franchiseRes.franchises.push({
      id: Date.now(),
      name: body.name,
      stores: [],
    });
    return route.fulfill({ json: { success: true } });
  }

  // DELETE franchise
  if (method === 'DELETE') {
    const id = Number(url.split('/').pop());
    franchiseRes.franchises =
      franchiseRes.franchises.filter(f => f.id !== id);

    return route.fulfill({ json: { success: true } });
  }

  return route.continue();
});

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'POST') {
      const orderReq = route.request().postDataJSON();
      await route.fulfill({ json: { order: { ...orderReq, id:23 }, jwt: 'eyJpYXQ' } });
    }
    else {
      await route.continue();}
  });
  await page.goto('/');
}

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('Register', async ({ page }) => {
  await basicInit(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('main').getByText('Register').click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('test1');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('test1t');
  await page.getByRole('textbox', { name: 'Email address' }).fill('test@hello.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('test123');
  await page.getByRole('button', { name: 'Register' }).click();
});

test('View Franchises as Non-LoggedIn User', async ({ page }) => {
await basicInit(page);
await page.goto('/');
await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
});

test('View About Page as Non-LoggedIn User', async ({ page }) => {
  await basicInit(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'About' }).click();
});

test('View History Page as Non-LoggedIn User', async ({ page }) => {
  await basicInit(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'History' }).click();
});


test('Login as Franchisee and view stores.', async ({ page }) => {
  await basicInit(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
});


test('View Admin Page', async ({ page }) => {
    await basicInit(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'A', exact: true }).click();
});

    
test('Diner, view store page', async ({ page }) => {
  await basicInit(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
});

test('Admin, create new franchise', async ({ page }) => {
    await basicInit(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByRole('textbox', { name: 'Franchise Name' }).click();
    await page.getByRole('textbox', { name: 'Franchise Name' }).fill('New Franchise');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();
});

test('Franchisee login', async ({ page }) => {
  await basicInit(page);
    await page.goto('/');
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await page.getByRole('link', { name: 'login', exact: true }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();
});


test('Admin, close franchise', async ({ page }) => {
    await basicInit(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByLabel('Global').getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('row', { name: 'LotaPizza' }).getByRole('button').click();
});

test('Admin, close store', async ({ page }) => {
    await basicInit(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();

    const adminLink = page.getByLabel('Global').getByRole('link', { name: 'Admin' });
    await adminLink.waitFor({state: 'visible'});
    await adminLink.click();
    await page.getByRole('row', { name: 'Lehi ₿ Close' }).getByRole('button').click();
});


test('Admin can view franchise list', async ({ page }) => {
  await basicInit(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  await page.getByRole('link', { name: 'Admin' }).click();

});

test('logout', async ({ page }) => {
  await basicInit(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Order' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
});

test('View Docs Page', async ({ page }) => {
  await basicInit(page);
  await page.goto('/docs');
  await expect(page.locator('main')).toBeVisible();
});