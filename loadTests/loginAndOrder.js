import { sleep, check } from "k6";
import http from "k6/http";
import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 20, duration: "1m" },
        { target: 20, duration: "3m30s" },
        { target: 0, duration: "1m" },
      ],
      gracefulRampDown: "30s",
      exec: "scenario_1",
    },
  },
};

export function scenario_1() {
  let response;

  const vars = {};

  // Login
  response = http.put(
    "https://pizza-service.tastypizzapie.click/api/auth",
    '{"email":"d@jwt.com","password":"diner"}',
    {
      headers: {
        "sec-ch-ua-platform": '"Windows"',
        "sec-ch-ua":
          '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
        "Content-Type": "application/json",
        "sec-ch-ua-mobile": "?0",
      },
    },
  );
  check(response, {
    "status equals 200": (response) => response.status.toString() === "200",
  });

  vars["token"] = jsonpath.query(response.json(), "$.token")[0];

  sleep(12.8);

  // Get order page
  response = http.get(
    "https://pizza-service.tastypizzapie.click/api/order/menu",
    {
      headers: {
        "sec-ch-ua-platform": '"Windows"',
        Authorization: `Bearer ${vars["token"]}`,
        "sec-ch-ua":
          '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
        "Content-Type": "application/json",
        "sec-ch-ua-mobile": "?0",
      },
    },
  );

  // Select franchise
  response = http.get(
    "https://pizza-service.tastypizzapie.click/api/franchise?page=0&limit=20&name=*",
    {
      headers: {
        "sec-ch-ua-platform": '"Windows"',
        Authorization: `Bearer ${vars["token"]}`,
        "sec-ch-ua":
          '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
        "Content-Type": "application/json",
        "sec-ch-ua-mobile": "?0",
      },
    },
  );
  sleep(6.2);

  // Select Pizza
  response = http.get("https://pizza-service.tastypizzapie.click/api/user/me", {
    headers: {
      "sec-ch-ua-platform": '"Windows"',
      Authorization: `Bearer ${vars["token"]}`,
      "sec-ch-ua":
        '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
      "Content-Type": "application/json",
      "sec-ch-ua-mobile": "?0",
    },
  });
  sleep(1.1);

  // Order
  response = http.post(
    "https://pizza-service.tastypizzapie.click/api/order",
    '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
    {
      headers: {
        "sec-ch-ua-platform": '"Windows"',
        Authorization: `Bearer ${vars["token"]}`,
        "sec-ch-ua":
          '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
        "Content-Type": "application/json",
        "sec-ch-ua-mobile": "?0",
      },
    },
  );
  sleep(2.2);

  // validate
  response = http.post(
    "https://pizza-factory.cs329.click/api/order/verify",
    '{"jwt":"eyJpYXQiOjE3OTUyNDQyOTgsImV4cCI6MTc5NTMzMDY5OCwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9TcF94VzhlM3kwNk1KS3ZIeW9sRFZMaXZXX2hnTWxhcFZSUVFQVndiY0UifQ.eyJ2ZW5kb3IiOnsiaWQiOiJnYW1lczEiLCJuYW1lIjoiR2VvcmdlIEFtZXMifSwiZGluZXIiOnsiaWQiOjQsIm5hbWUiOiJwaXp6YSBkaW5lciIsImVtYWlsIjoiZEBqd3QuY29tIn0sIm9yZGVyIjp7Iml0ZW1zIjpbeyJtZW51SWQiOjEsImRlc2NyaXB0aW9uIjoiVmVnZ2llIiwicHJpY2UiOjAuMDAzOH1dLCJzdG9yZUlkIjoiMSIsImZyYW5jaGlzZUlkIjoxLCJpZCI6MTJ9fQ.iwceSnAdtbrUPLBo_xzz9Nrt5K7fu0LW2JaSeImqeL012vu-fBD9sC-7aI8vSugL5te5Hp9nlnYrjWPZyJfSNhr7KCpB4onRSqAsaWZAzLTOACcqLEAKSuKQ9kGFjc_QEDRzNepzKI1OxK8qk5PUfc0aTA9EmjI9ucoVQdJfA0j7Mr_RNy6-BbvgJ6s1FuHzX2TfBpPK-QstN49rRc_z_ppP04z07JCAuo_eX0QWieE7MBgP9127v_W2EEYdcyUDaebWWvN_iJIw1VnvakNZ9Mdv22Zvdsg0tXdR6pDgQePqulR0go_5PRupGhrkEtuXQSpfBUpHu6LKO7f2neDHKZhsmIZhkkjgJbrkJQbTDKNkAsfOO1hrMCCwJppZlV2G5KQ3msdYtid4dIJB-SOArEt5YjY4_PgbD1ZQt3bPtzYNRBqpEEuYYJOdgzB5UeDB4YLwYj8U3eXEr7Xel9H9TjD8MgmGx2rJt2NiSvsWxxe7grrWwSW3kjrC3yo-anbUPM_6jJCiqifvyrx8ehQQrlNEfKGTcZvnZy_aJczAI_IRyPboNkApUEoWrmLosbC6dyZaNLyyeBsFRyUZb0nzexG_t5pathcIUNDDMmWmuEJ8tsNDIqzsaB0AzXj7uMQJPyKA4c8DrxKSPN9eHVXs9yvwGLlXkGplIHbnbVbSkPs"}',
    {
      headers: {
        "sec-ch-ua-platform": '"Windows"',
        Authorization: `Bearer ${vars["token"]}`,
        "sec-ch-ua":
          '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
        "Content-Type": "application/json",
        "sec-ch-ua-mobile": "?0",
      },
    },
  );
}
