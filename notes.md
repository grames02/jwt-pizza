# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity | Frontend component | Backend endpoints | Database SQL |
|--------------|------------------|------------------|--------------|
| View home page | home.tsx | none | none |
| Register new user<br/>(t@jwt.com, pw: test) | register.tsx | [POST] /api/auth | `INSERT INTO user (name, email, password) VALUES (?, ?, ?)` <br/> `INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)` |
| Login new user<br/>(t@jwt.com, pw: test) | login.tsx | [PUT] /api/auth | `SELECT * FROM user WHERE email = ?` <br/> `SELECT * FROM userRole WHERE userId = ?` |
| Order pizza | menu.tsx | [POST] /api/order | `INSERT INTO dinerOrder (userId, storeId, franchiseId, total, created)` <br/> `INSERT INTO orderItem (orderId, menuId, price)` |
| Verify pizza | delivery.tsx | [GET] /api/order/:orderId | `SELECT * FROM dinerOrder WHERE id = ?` <br/> `SELECT * FROM orderItem WHERE orderId = ?` |
| View profile page | dinerDashboard.tsx | [GET] /api/user | `SELECT * FROM user WHERE id = ?` |
| View franchise<br/>(as diner) | franchiseDashboard.tsx | [GET] /api/franchise | `SELECT * FROM franchise` <br/> `SELECT * FROM store WHERE franchiseId = ?` |
| Logout | logout.tsx | none | none |
| View About page | about.tsx | none | none |
| View History page | history.tsx | [GET] /api/order | `SELECT * FROM dinerOrder WHERE userId = ?` |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx | [PUT] /api/auth | `SELECT * FROM user WHERE email = ?` <br/> `SELECT * FROM userRole WHERE userId = ?` |
| View franchise<br/>(as franchisee) | franchiseDashboard.tsx | [GET] /api/franchise | `SELECT * FROM franchise WHERE id = ?` <br/> `SELECT * FROM store WHERE franchiseId = ?` |
| Create a store | createStore.tsx | [POST] /api/store | `INSERT INTO store (franchiseId, name)` |
| Close a store | closeStore.tsx | [DELETE] /api/store/:storeId | `DELETE FROM store WHERE id = ?` |
| Login as admin<br/>(a@jwt.com, pw: admin) | login.tsx | [PUT] /api/auth | `SELECT * FROM user WHERE email = ?` <br/> `SELECT * FROM userRole WHERE userId = ?` |
| View Admin page | adminDashboard.tsx | [GET] /api/admin | `SELECT * FROM franchise` <br/> `SELECT * FROM user` |
| Create a franchise for t@jwt.com | adminDashboard.tsx | [POST] /api/franchise | `INSERT INTO franchise (name, adminId)` <br/> `INSERT INTO userRole (userId, role, objectId)` |
| Close the franchise for t@jwt.com | adminDashboard.tsx | [DELETE] /api/franchise/:franchiseId | `DELETE FROM franchise WHERE id = ?` |

