# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      |        home.tsx    |        none       |     none     |
| Register new user<br/>(t@jwt.com, pw: test)         |  register.tsx      |[POST] /api/auth   |INSERT INTO user<br/>(name, email,password) VALUES (?, ?, ?) <br/> INSERT INTO userRole <br/> (userId, role, objectId) VALUES (?, ?, ?)             |
| Login new user<br/>(t@jwt.com, pw: test)            |      login.tsx     | [PUT] /api/auth   |    SELECT * FROM user WHERE email = ?<br/>SELECT * FROM userRole WHERE userId = ?          |
| Order pizza                                         |           menu.tsx         |   [POST] /api/order                |       INSERT INTO pizzaOrder (userId, storeId, franchiseId, total, created)<br/>INSERT INTO orderItem (orderId, menuId, price)       |
| Verify pizza                                        |      delivery.tsx              |  [GET] /api/order/:orderID                 |    SELECT * FROM pizzaOrder WHERE id = ?<br/>SELECT * FROM orderItem WHERE orderId = ?          |
| View profile page                                   |      dinerDashboard.tsx              |    [GET] /api/user               |   SELECT * FROM user WHERE id = ?           |
| View franchise<br/>(as diner)                       |    franchiseDashboard.tsx                |     [GET] /api/franchise              |   SELECT * FROM franchise<br/>SELECT * FROM store WHERE franchiseId = ?           |
| Logout                                              |   logout.tsx                 |     none              |    none          |
| View About page                                     |       about.tsx             |       none            |  none            |
| View History page                                   |      history.tsx              |      none             |       none       |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |       franchiseDashboard.tsx          |                   |              |
| View franchise<br/>(as franchisee)                  |          franchiseDashboard.tsx          |                   |              |
| Create a store                                      |   createStore.tsx                 |                   |              |
| Close a store                                       |   closeStore.tsx                 |                   |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           |  login.tsx                  |                   |              |
| View Admin page                                     |         adminDashboard.tsx           |                   |              |
| Create a franchise for t@jwt.com                    |    adminDashboard.tsx                |                   |              |
| Close the franchise for t@jwt.com                   |   adminDashboard.tsx                 |                   |              |
