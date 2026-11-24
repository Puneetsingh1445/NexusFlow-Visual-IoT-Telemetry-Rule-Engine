/**
 * testAuth.js — NexusFlow Authentication Test Suite
 *
 * Run AFTER: npm install && npm run dev (in a separate terminal)
 * Usage:     node testAuth.js
 *
 * Tests:
 *  1. User registration
 *  2. Duplicate registration rejection
 *  3. Password validation (too short, missing number, missing letter)
 *  4. JWT token generation and shape
 *  5. JWT token storage format verification
 *  6. User login with registered credentials
 *  7. Login with wrong password
 *  8. Login with unknown email
 *  9. Authorization header on protected route (/api/auth/me)
 * 10. Protected route blocked without token
 * 11. Protected route blocked with malformed token
 * 12. Full registration → login → protected-access round-trip
 */

import axios from "axios";

const BASE = "http://localhost:5000/api";
const TIMESTAMP = Date.now();
const TEST_EMAIL = `testuser_${TIMESTAMP}@nexusflow.test`;
const TEST_PASSWORD = "TestPass1";
const TEST_NAME = "Auth Tester";

let passed = 0;
let failed = 0;
let capturedToken = null;

// ─── helpers ──────────────────────────────────────────────────────────────────

function ok(label) {
  console.log(`  ✅ PASS  ${label}`);
  passed++;
}

function fail(label, reason) {
  console.error(`  ❌ FAIL  ${label}`);
  console.error(`          → ${reason}`);
  failed++;
}

async function post(path, body, headers = {}) {
  try {
    const res = await axios.post(`${BASE}${path}`, body, {
      headers,
      validateStatus: () => true, // never throw on HTTP errors
    });
    return res;
  } catch (err) {
    return { status: 0, data: { message: err.message } };
  }
}

async function get(path, headers = {}) {
  try {
    const res = await axios.get(`${BASE}${path}`, {
      headers,
      validateStatus: () => true,
    });
    return res;
  } catch (err) {
    return { status: 0, data: { message: err.message } };
  }
}

// ─── tests ────────────────────────────────────────────────────────────────────

async function test1_register() {
  console.log("\n[1] User Registration");
  const res = await post("/auth/register", {
    name: TEST_NAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (res.status !== 201) {
    fail("Registration returns HTTP 201", `Got ${res.status} — ${JSON.stringify(res.data)}`);
    return;
  }
  ok("Registration returns HTTP 201");

  if (res.data?.success !== true) {
    fail("Response has success:true", JSON.stringify(res.data));
    return;
  }
  ok("Response has success:true");

  const token = res.data?.token;
  if (!token || typeof token !== "string" || token.split(".").length !== 3) {
    fail("Response contains a valid JWT token (3 dot-separated parts)", `token=${token}`);
    return;
  }
  ok("Response contains a valid JWT token");
  capturedToken = token;

  const user = res.data?.data;
  if (!user?.id || !user?.email || !user?.name) {
    fail("Response data contains id, email, name", JSON.stringify(user));
    return;
  }
  ok("Response data contains id, email, name");

  if (user.email !== TEST_EMAIL.toLowerCase()) {
    fail("Stored email is lowercased", `Got ${user.email}, expected ${TEST_EMAIL.toLowerCase()}`);
  } else {
    ok("Stored email is lowercased correctly");
  }

  if (!user.createdAt) {
    fail("Response data contains createdAt", JSON.stringify(user));
  } else {
    ok("Response data contains createdAt");
  }
}

async function test2_duplicateRegistration() {
  console.log("\n[2] Duplicate Registration Rejection");
  const res = await post("/auth/register", {
    name: TEST_NAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (res.status !== 409) {
    fail("Duplicate registration returns HTTP 409", `Got ${res.status} — ${JSON.stringify(res.data)}`);
  } else {
    ok("Duplicate registration returns HTTP 409");
    ok(`Error message: "${res.data?.message}"`);
  }
}

async function test3_passwordValidation() {
  console.log("\n[3] Password Validation Rules");
  const cases = [
    { desc: "Too short (<8 chars)", pw: "Ab1",        expectStatus: 422 },
    { desc: "No number",           pw: "PasswordOnly", expectStatus: 422 },
    { desc: "No letter",           pw: "12345678",    expectStatus: 422 },
    { desc: "Valid password",      pw: "ValidPass9",  expectStatus: 201 },
  ];

  for (const { desc, pw, expectStatus } of cases) {
    const uniqueEmail = `pwtest_${Date.now()}_${Math.random().toString(36).slice(2)}@nexusflow.test`;
    const res = await post("/auth/register", { name: "PW Test", email: uniqueEmail, password: pw });
    if (res.status === expectStatus) {
      ok(`${desc} → HTTP ${expectStatus}`);
    } else {
      fail(`${desc} → expected HTTP ${expectStatus}`, `Got ${res.status} — ${JSON.stringify(res.data?.errors || res.data?.message)}`);
    }
  }
}

async function test4_loginSuccess() {
  console.log("\n[4] Login with Registered Credentials");
  const res = await post("/auth/login", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (res.status !== 200) {
    fail("Login returns HTTP 200", `Got ${res.status} — ${JSON.stringify(res.data)}`);
    return;
  }
  ok("Login returns HTTP 200");

  if (res.data?.success !== true) {
    fail("Response has success:true", JSON.stringify(res.data));
  } else {
    ok("Response has success:true");
  }

  const token = res.data?.token;
  if (!token || token.split(".").length !== 3) {
    fail("Login response contains valid JWT", `token=${token}`);
  } else {
    ok("Login response contains valid JWT");
    capturedToken = token; // update with fresh login token
  }

  const user = res.data?.data;
  if (!user?.id || !user?.name || !user?.email) {
    fail("Login response data has id, name, email", JSON.stringify(user));
  } else {
    ok("Login response data has id, name, email");
  }

  if (user?.email !== TEST_EMAIL.toLowerCase()) {
    fail("Login response email is lowercased", `Got ${user?.email}`);
  } else {
    ok("Login response email matches registered email (lowercased)");
  }
}

async function test5_loginWrongPassword() {
  console.log("\n[5] Login with Wrong Password");
  const res = await post("/auth/login", {
    email: TEST_EMAIL,
    password: "WrongPass999",
  });

  if (res.status !== 401) {
    fail("Wrong password returns HTTP 401", `Got ${res.status} — ${JSON.stringify(res.data)}`);
  } else {
    ok("Wrong password returns HTTP 401");
    ok(`Message: "${res.data?.message}"`);
  }
}

async function test6_loginUnknownEmail() {
  console.log("\n[6] Login with Unknown Email");
  // Use a valid email format that is guaranteed not to be registered
  const unknownEmail = `unknown_${TIMESTAMP}_unregistered@nexusflow.test`;
  const res = await post("/auth/login", {
    email: unknownEmail,
    password: TEST_PASSWORD,
  });

  if (res.status !== 401) {
    fail("Unknown email returns HTTP 401", `Got ${res.status} — ${JSON.stringify(res.data)}`);
  } else {
    ok("Unknown email returns HTTP 401 (no user enumeration)");
  }
}

async function test7_protectedRouteWithToken() {
  console.log("\n[7] Authorization Header on Protected Route");
  if (!capturedToken) {
    fail("Cannot test — no token captured (login tests may have failed)", "");
    return;
  }

  const res = await get("/auth/me", {
    Authorization: `Bearer ${capturedToken}`,
  });

  if (res.status !== 200) {
    fail("GET /api/auth/me with valid token returns HTTP 200", `Got ${res.status} — ${JSON.stringify(res.data)}`);
    return;
  }
  ok("GET /api/auth/me with valid token returns HTTP 200");

  if (res.data?.success !== true) {
    fail("/api/auth/me response has success:true", JSON.stringify(res.data));
  } else {
    ok("/api/auth/me response has success:true");
  }

  if (!res.data?.user?.userId) {
    fail("/api/auth/me response has user.userId", JSON.stringify(res.data?.user));
  } else {
    ok(`/api/auth/me response has user.userId: ${res.data.user.userId}`);
  }
}

async function test8_protectedRouteWithoutToken() {
  console.log("\n[8] Protected Route Blocked Without Token");
  const res = await get("/auth/me");

  if (res.status !== 401) {
    fail("GET /api/auth/me without token returns HTTP 401", `Got ${res.status}`);
  } else {
    ok("GET /api/auth/me without token returns HTTP 401");
  }
}

async function test9_protectedRouteWithBadToken() {
  console.log("\n[9] Protected Route Blocked with Malformed Token");
  const res = await get("/auth/me", {
    Authorization: "Bearer this.is.not.a.valid.jwt",
  });

  if (res.status !== 401) {
    fail("Malformed token returns HTTP 401", `Got ${res.status}`);
  } else {
    ok("Malformed token returns HTTP 401");
  }
}

async function test10_tokenJWTStructure() {
  console.log("\n[10] JWT Token Structure and Payload");
  if (!capturedToken) {
    fail("No token captured — skipping JWT structure test", "");
    return;
  }

  const parts = capturedToken.split(".");
  if (parts.length !== 3) {
    fail("Token has 3 parts (header.payload.signature)", `Got ${parts.length} parts`);
    return;
  }
  ok("Token has 3 parts (header.payload.signature)");

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!payload.userId) {
      fail("JWT payload contains userId", JSON.stringify(payload));
    } else {
      ok(`JWT payload.userId is present: ${payload.userId}`);
    }
    if (!payload.role) {
      fail("JWT payload contains role", JSON.stringify(payload));
    } else {
      ok(`JWT payload.role: ${payload.role}`);
    }
    if (!payload.exp) {
      fail("JWT payload contains exp (expiry)", JSON.stringify(payload));
    } else {
      const expiresIn = new Date(payload.exp * 1000).toISOString();
      ok(`JWT expires: ${expiresIn}`);
    }
  } catch (e) {
    fail("JWT payload is valid base64url JSON", e.message);
  }
}

async function test11_emailCaseInsensitiveLogin() {
  console.log("\n[11] Email Case-Insensitive Login");
  const res = await post("/auth/login", {
    email: TEST_EMAIL.toUpperCase(), // register used lowercase — Zod lowercases both
    password: TEST_PASSWORD,
  });

  if (res.status !== 200) {
    fail("Login with uppercase email works (Zod normalizes to lowercase)", `Got ${res.status} — ${JSON.stringify(res.data?.message)}`);
  } else {
    ok("Login with uppercase email succeeds (Zod lowercases before lookup)");
  }
}

async function test12_devicesProtectedRoute() {
  console.log("\n[12] Protected Device Route Requires Valid Token");
  if (!capturedToken) {
    fail("No token — skipping", "");
    return;
  }
  const withToken = await get("/devices", { Authorization: `Bearer ${capturedToken}` });
  const withoutToken = await get("/devices");

  if (withToken.status === 200) {
    ok("GET /api/devices with valid token returns 200");
  } else {
    fail("GET /api/devices with valid token", `Got ${withToken.status} — ${JSON.stringify(withToken.data)}`);
  }

  if (withoutToken.status === 401) {
    ok("GET /api/devices without token returns 401");
  } else {
    fail("GET /api/devices without token should return 401", `Got ${withoutToken.status}`);
  }
}

// ─── runner ───────────────────────────────────────────────────────────────────

async function runAll() {
  console.log("═══════════════════════════════════════════════════");
  console.log("   NexusFlow Authentication Test Suite");
  console.log(`   Server: ${BASE}`);
  console.log(`   Test email: ${TEST_EMAIL}`);
  console.log("═══════════════════════════════════════════════════");

  // First check server is reachable
  const health = await get("/health");
  if (health.status !== 200) {
    console.error(`\n❌ CANNOT REACH SERVER at ${BASE}/health (status ${health.status})`);
    console.error("   Make sure the backend is running: npm run dev (in backend/ folder)");
    process.exit(1);
  }
  console.log(`\n🟢 Server is healthy — running tests...\n`);

  await test1_register();
  await test2_duplicateRegistration();
  await test3_passwordValidation();
  await test4_loginSuccess();
  await test5_loginWrongPassword();
  await test6_loginUnknownEmail();
  await test7_protectedRouteWithToken();
  await test8_protectedRouteWithoutToken();
  await test9_protectedRouteWithBadToken();
  await test10_tokenJWTStructure();
  await test11_emailCaseInsensitiveLogin();
  await test12_devicesProtectedRoute();

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`   Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
