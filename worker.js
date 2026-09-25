const PBKDF2_ITERATIONS = 100000;

const SESSION_COOKIE_NAME = "ymir_session";
const SESSION_LENGTH_SECONDS = 60 * 60 * 24 * 7;


/* =========================================================
   YMIR MODS WORKER
   ========================================================= */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);


    /* =======================================================
       TEST BACKEND + DATABASE
       ======================================================= */

    if (
      url.pathname === "/api/test" &&
      request.method === "GET"
    ) {
      try {
        const result = await env.DB
          .prepare(
            "SELECT COUNT(*) AS count FROM users"
          )
          .first();

        return jsonResponse({
          success: true,
          message: "YMIR Mods backend is running",
          database: "connected",
          users: result?.count ?? 0
        });

      } catch (error) {

        console.error(
          "Database test error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            message:
              "Backend is running, but database connection failed"
          },
          500
        );
      }
    }


    /* =======================================================
       REGISTER
       ======================================================= */

    if (
      url.pathname === "/api/register" &&
      request.method === "POST"
    ) {
      return handleRegister(
        request,
        env
      );
    }


    /* =======================================================
       LOGIN
       ======================================================= */

    if (
      url.pathname === "/api/login" &&
      request.method === "POST"
    ) {
      return handleLogin(
        request,
        env
      );
    }


    /* =======================================================
       LOGOUT
       ======================================================= */

    if (
      url.pathname === "/api/logout" &&
      request.method === "POST"
    ) {
      return handleLogout(
        request,
        env
      );
    }


    /* =======================================================
       CURRENT USER
       ======================================================= */

    if (
      url.pathname === "/api/me" &&
      request.method === "GET"
    ) {
      return handleCurrentUser(
        request,
        env
      );
    }


    /* =======================================================
       API METHOD ERRORS
       ======================================================= */

    if (
      url.pathname === "/api/register" ||
      url.pathname === "/api/login" ||
      url.pathname === "/api/logout"
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Method not allowed."
        },
        405
      );
    }


    /* =======================================================
       NORMAL WEBSITE FILES
       ======================================================= */

    return env.ASSETS.fetch(
      request
    );
  }
};


/* =========================================================
   REGISTER USER
   ========================================================= */

async function handleRegister(
  request,
  env
) {
  try {
    let body;

    try {
      body =
        await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message:
            "Invalid request body."
        },
        400
      );
    }


    const username =
      String(
        body.username ?? ""
      ).trim();


    const email =
      String(
        body.email ?? ""
      )
        .trim()
        .toLowerCase();


    const password =
      String(
        body.password ?? ""
      );


    /* =======================================================
       VALIDATION
       ======================================================= */

    if (
      username.length < 3 ||
      username.length > 24
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Username must be between 3 and 24 characters."
        },
        400
      );
    }


    if (
      !/^[A-Za-z0-9_-]+$/.test(
        username
      )
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Username can only contain letters, numbers, underscores and hyphens."
        },
        400
      );
    }


    if (
      !isValidEmail(
        email
      )
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Please enter a valid email address."
        },
        400
      );
    }


    if (
      password.length < 10 ||
      password.length > 128
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Password must be between 10 and 128 characters."
        },
        400
      );
    }


    /* =======================================================
       EXISTING ACCOUNT CHECK
       ======================================================= */

    const existingUser =
      await env.DB
        .prepare(`
          SELECT id
          FROM users
          WHERE LOWER(username) = LOWER(?)
             OR LOWER(email) = LOWER(?)
          LIMIT 1
        `)
        .bind(
          username,
          email
        )
        .first();


    if (
      existingUser
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "That username or email is already registered."
        },
        409
      );
    }


    /* =======================================================
       HASH PASSWORD
       ======================================================= */

    const passwordHash =
      await hashPassword(
        password
      );


    /* =======================================================
       CREATE ACCOUNT
       ======================================================= */

    const result =
      await env.DB
        .prepare(`
          INSERT INTO users (
            username,
            email,
            password_hash,
            role,
            can_upload
          )
          VALUES (
            ?,
            ?,
            ?,
            'member',
            0
          )
        `)
        .bind(
          username,
          email,
          passwordHash
        )
        .run();


    return jsonResponse(
      {
        success: true,

        message:
          "YMIR Mods account created successfully.",

        user: {
          id:
            result?.meta
              ?.last_row_id ??
            null,

          username:
            username,

          role:
            "member",

          can_upload:
            false
        }
      },
      201
    );

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    return jsonResponse(
      {
        success: false,
        message:
          "Unable to create account."
      },
      500
    );
  }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(
  request,
  env
) {
  try {
    let body;

    try {
      body =
        await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message:
            "Invalid request body."
        },
        400
      );
    }


    const identifier =
      String(
        body.identifier ?? ""
      ).trim();


    const password =
      String(
        body.password ?? ""
      );


    if (
      !identifier ||
      !password
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Username/email and password are required."
        },
        400
      );
    }


    /* =======================================================
       FIND USER
       ======================================================= */

    const user =
      await env.DB
        .prepare(`
          SELECT
            id,
            username,
            email,
            password_hash,
            role,
            can_upload
          FROM users
          WHERE LOWER(username) = LOWER(?)
             OR LOWER(email) = LOWER(?)
          LIMIT 1
        `)
        .bind(
          identifier,
          identifier
        )
        .first();


    if (!user) {
      return jsonResponse(
        {
          success: false,
          message:
            "Invalid username/email or password."
        },
        401
      );
    }


    /* =======================================================
       VERIFY PASSWORD
       ======================================================= */

    const validPassword =
      await verifyPassword(
        password,
        user.password_hash
      );


    if (!validPassword) {
      return jsonResponse(
        {
          success: false,
          message:
            "Invalid username/email or password."
        },
        401
      );
    }


    /* =======================================================
       CLEAN EXPIRED SESSIONS
       ======================================================= */

    const now =
      Math.floor(
        Date.now() / 1000
      );


    await env.DB
      .prepare(`
        DELETE FROM sessions
        WHERE expires_at <= ?
      `)
      .bind(
        now
      )
      .run();


    /* =======================================================
       CREATE SESSION TOKEN
       ======================================================= */

    const sessionToken =
      generateSessionToken();


    const tokenHash =
      await hashSessionToken(
        sessionToken
      );


    const expiresAt =
      now +
      SESSION_LENGTH_SECONDS;


    await env.DB
      .prepare(`
        INSERT INTO sessions (
          user_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?)
      `)
      .bind(
        user.id,
        tokenHash,
        expiresAt
      )
      .run();


    /* =======================================================
       LOGIN SUCCESS
       ======================================================= */

    return jsonResponse(
      {
        success: true,

        message:
          "Login successful.",

        user: {
          id:
            user.id,

          username:
            user.username,

          email:
            user.email,

          role:
            user.role,

          can_upload:
            Boolean(
              user.can_upload
            )
        }
      },
      200,
      {
        "Set-Cookie":
          createSessionCookie(
            sessionToken
          )
      }
    );

  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    return jsonResponse(
      {
        success: false,
        message:
          "Unable to log in."
      },
      500
    );
  }
}


/* =========================================================
   CURRENT USER
   ========================================================= */

async function handleCurrentUser(
  request,
  env
) {
  try {
    const sessionToken =
      getCookie(
        request,
        SESSION_COOKIE_NAME
      );


    if (!sessionToken) {
      return jsonResponse(
        {
          success: true,
          authenticated: false,
          user: null
        }
      );
    }


    const tokenHash =
      await hashSessionToken(
        sessionToken
      );


    const now =
      Math.floor(
        Date.now() / 1000
      );


    const user =
      await env.DB
        .prepare(`
          SELECT
            users.id,
            users.username,
            users.email,
            users.role,
            users.can_upload
          FROM sessions

          INNER JOIN users
            ON users.id =
               sessions.user_id

          WHERE sessions.token_hash = ?
            AND sessions.expires_at > ?

          LIMIT 1
        `)
        .bind(
          tokenHash,
          now
        )
        .first();


    if (!user) {
      return jsonResponse(
        {
          success: true,
          authenticated: false,
          user: null
        },
        200,
        {
          "Set-Cookie":
            clearSessionCookie()
        }
      );
    }


    return jsonResponse({
      success: true,

      authenticated:
        true,

      user: {
        id:
          user.id,

        username:
          user.username,

        email:
          user.email,

        role:
          user.role,

        can_upload:
          Boolean(
            user.can_upload
          )
      }
    });

  } catch (error) {

    console.error(
      "Current-user error:",
      error
    );


    return jsonResponse(
      {
        success: false,
        message:
          "Unable to check login."
      },
      500
    );
  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function handleLogout(
  request,
  env
) {
  try {
    const sessionToken =
      getCookie(
        request,
        SESSION_COOKIE_NAME
      );


    if (
      sessionToken
    ) {
      const tokenHash =
        await hashSessionToken(
          sessionToken
        );


      await env.DB
        .prepare(`
          DELETE FROM sessions
          WHERE token_hash = ?
        `)
        .bind(
          tokenHash
        )
        .run();
    }


    return jsonResponse(
      {
        success: true,
        message:
          "Logged out successfully."
      },
      200,
      {
        "Set-Cookie":
          clearSessionCookie()
      }
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    return jsonResponse(
      {
        success: false,
        message:
          "Unable to log out."
      },
      500
    );
  }
}


/* =========================================================
   PASSWORD HASHING
   ========================================================= */

async function hashPassword(
  password
) {
  const encoder =
    new TextEncoder();


  const salt =
    crypto.getRandomValues(
      new Uint8Array(16)
    );


  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",

      encoder.encode(
        password
      ),

      {
        name:
          "PBKDF2"
      },

      false,

      [
        "deriveBits"
      ]
    );


  const derivedBits =
    await crypto.subtle.deriveBits(
      {
        name:
          "PBKDF2",

        salt:
          salt,

        iterations:
          PBKDF2_ITERATIONS,

        hash:
          "SHA-256"
      },

      keyMaterial,

      256
    );


  const hashBytes =
    new Uint8Array(
      derivedBits
    );


  return [
    "pbkdf2_sha256",

    PBKDF2_ITERATIONS,

    bytesToBase64(
      salt
    ),

    bytesToBase64(
      hashBytes
    )
  ].join("$");
}


/* =========================================================
   PASSWORD VERIFICATION
   ========================================================= */

async function verifyPassword(
  password,
  storedHash
) {
  try {
    const parts =
      String(
        storedHash
      ).split("$");


    if (
      parts.length !== 4
    ) {
      return false;
    }


    const algorithm =
      parts[0];


    const iterations =
      Number(
        parts[1]
      );


    const salt =
      base64ToBytes(
        parts[2]
      );


    const expectedHash =
      base64ToBytes(
        parts[3]
      );


    if (
      algorithm !==
        "pbkdf2_sha256" ||
      !Number.isInteger(
        iterations
      ) ||
      iterations < 1 ||
      iterations > 100000
    ) {
      return false;
    }


    const encoder =
      new TextEncoder();


    const keyMaterial =
      await crypto.subtle.importKey(
        "raw",

        encoder.encode(
          password
        ),

        {
          name:
            "PBKDF2"
        },

        false,

        [
          "deriveBits"
        ]
      );


    const derivedBits =
      await crypto.subtle.deriveBits(
        {
          name:
            "PBKDF2",

          salt:
            salt,

          iterations:
            iterations,

          hash:
            "SHA-256"
        },

        keyMaterial,

        expectedHash.length * 8
      );


    const actualHash =
      new Uint8Array(
        derivedBits
      );


    return constantTimeEqual(
      actualHash,
      expectedHash
    );

  } catch (error) {

    console.error(
      "Password verification error:",
      error
    );

    return false;
  }
}


/* =========================================================
   SESSION TOKEN
   ========================================================= */

function generateSessionToken() {
  const bytes =
    crypto.getRandomValues(
      new Uint8Array(32)
    );


  return bytesToBase64Url(
    bytes
  );
}


async function hashSessionToken(
  token
) {
  const encoder =
    new TextEncoder();


  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(
        token
      )
    );


  return bytesToHex(
    new Uint8Array(
      digest
    )
  );
}


/* =========================================================
   COOKIE HELPERS
   ========================================================= */

function createSessionCookie(
  token
) {
  return [
    `${SESSION_COOKIE_NAME}=${token}`,

    "Path=/",

    "HttpOnly",

    "Secure",

    "SameSite=Lax",

    `Max-Age=${SESSION_LENGTH_SECONDS}`
  ].join("; ");
}


function clearSessionCookie() {
  return [
    `${SESSION_COOKIE_NAME}=`,

    "Path=/",

    "HttpOnly",

    "Secure",

    "SameSite=Lax",

    "Max-Age=0"
  ].join("; ");
}


function getCookie(
  request,
  name
) {
  const cookieHeader =
    request.headers.get(
      "Cookie"
    );


  if (!cookieHeader) {
    return null;
  }


  const cookies =
    cookieHeader.split(";");


  for (
    const cookie of cookies
  ) {
    const separatorIndex =
      cookie.indexOf("=");


    if (
      separatorIndex === -1
    ) {
      continue;
    }


    const cookieName =
      cookie
        .slice(
          0,
          separatorIndex
        )
        .trim();


    const cookieValue =
      cookie
        .slice(
          separatorIndex + 1
        )
        .trim();


    if (
      cookieName ===
      name
    ) {
      return cookieValue;
    }
  }


  return null;
}


/* =========================================================
   ENCODING HELPERS
   ========================================================= */

function bytesToBase64(
  bytes
) {
  let binary = "";


  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {
    binary +=
      String.fromCharCode(
        bytes[i]
      );
  }


  return btoa(
    binary
  );
}


function base64ToBytes(
  value
) {
  const binary =
    atob(
      value
    );


  const bytes =
    new Uint8Array(
      binary.length
    );


  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(
        i
      );
  }


  return bytes;
}


function bytesToBase64Url(
  bytes
) {
  return bytesToBase64(
    bytes
  )
    .replace(
      /\+/g,
      "-"
    )
    .replace(
      /\//g,
      "_"
    )
    .replace(
      /=+$/g,
      ""
    );
}


function bytesToHex(
  bytes
) {
  return Array
    .from(
      bytes
    )
    .map(
      byte =>
        byte
          .toString(16)
          .padStart(
            2,
            "0"
          )
    )
    .join("");
}


/* =========================================================
   CONSTANT-TIME COMPARISON
   ========================================================= */

function constantTimeEqual(
  first,
  second
) {
  if (
    first.length !==
    second.length
  ) {
    return false;
  }


  let difference = 0;


  for (
    let i = 0;
    i < first.length;
    i++
  ) {
    difference |=
      first[i] ^
      second[i];
  }


  return difference === 0;
}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(
  email
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      email
    );
}


/* =========================================================
   JSON RESPONSE
   ========================================================= */

function jsonResponse(
  data,
  status = 200,
  extraHeaders = {}
) {
  const headers =
    new Headers({
      "Content-Type":
        "application/json; charset=utf-8",

      "Cache-Control":
        "no-store"
    });


  for (
    const [
      key,
      value
    ] of Object.entries(
      extraHeaders
    )
  ) {
    headers.set(
      key,
      value
    );
  }


  return new Response(
    JSON.stringify(
      data
    ),

    {
      status:
        status,

      headers:
        headers
    }
  );
}
