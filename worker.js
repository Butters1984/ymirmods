const PBKDF2_ITERATIONS = 210000;

/* =========================================================
   YMIR MODS WORKER
   ========================================================= */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /* =======================================================
       TEST BACKEND + DATABASE
       ======================================================= */

    if (url.pathname === "/api/test") {
      try {
        const result = await env.DB
          .prepare("SELECT COUNT(*) AS count FROM users")
          .first();

        return jsonResponse({
          success: true,
          message: "YMIR Mods backend is running",
          database: "connected",
          users: result?.count ?? 0
        });

      } catch (error) {
        return jsonResponse(
          {
            success: false,
            message: "Backend is running, but database connection failed",
            error: error?.message || String(error)
          },
          500
        );
      }
    }


    /* =======================================================
       REGISTER ACCOUNT
       ======================================================= */

    if (
      url.pathname === "/api/register" &&
      request.method === "POST"
    ) {
      return handleRegister(request, env);
    }


    /* =======================================================
       BLOCK WRONG REGISTER METHOD
       ======================================================= */

    if (
      url.pathname === "/api/register" &&
      request.method !== "POST"
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Registration requires POST."
        },
        405
      );
    }


    /* =======================================================
       NORMAL WEBSITE FILES
       ======================================================= */

    return env.ASSETS.fetch(request);
  }
};


/* =========================================================
   REGISTER USER
   ========================================================= */

async function handleRegister(request, env) {
  try {
    let body;

    /* -------------------------
       READ JSON
       ------------------------- */

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message: "Invalid request body."
        },
        400
      );
    }


    /* -------------------------
       NORMALIZE INPUT
       ------------------------- */

    const username =
      String(body.username ?? "")
        .trim();

    const email =
      String(body.email ?? "")
        .trim()
        .toLowerCase();

    const password =
      String(body.password ?? "");


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
          message: "Username must be between 3 and 24 characters."
        },
        400
      );
    }


    if (
      !/^[A-Za-z0-9_-]+$/.test(username)
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


    if (!isValidEmail(email)) {
      return jsonResponse(
        {
          success: false,
          message: "Please enter a valid email address."
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
          message: "Password must be between 10 and 128 characters."
        },
        400
      );
    }


    /* =======================================================
       CHECK EXISTING USERNAME / EMAIL
       ======================================================= */

    const existingUser = await env.DB
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


    if (existingUser) {
      return jsonResponse(
        {
          success: false,
          message: "That username or email is already registered."
        },
        409
      );
    }


    /* =======================================================
       HASH PASSWORD
       ======================================================= */

    const passwordHash =
      await hashPassword(password);


    /* =======================================================
       CREATE ACCOUNT
       ======================================================= */

    const result = await env.DB
      .prepare(`
        INSERT INTO users (
          username,
          email,
          password_hash,
          role,
          can_upload
        )
        VALUES (?, ?, ?, 'member', 0)
      `)
      .bind(
        username,
        email,
        passwordHash
      )
      .run();


    /* =======================================================
       SUCCESS RESPONSE
       ======================================================= */

    return jsonResponse(
      {
        success: true,
        message: "YMIR Mods account created successfully.",
        user: {
          id: result?.meta?.last_row_id ?? null,
          username: username,
          role: "member",
          can_upload: false
        }
      },
      201
    );

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    /* TEMPORARY DEBUG MESSAGE */
    return jsonResponse(
      {
        success: false,

        message:
          "Unable to create account: " +
          (
            error?.message ||
            String(error)
          )
      },
      500
    );
  }
}


/* =========================================================
   PASSWORD HASHING
   ========================================================= */

async function hashPassword(password) {
  const encoder =
    new TextEncoder();


  const salt =
    crypto.getRandomValues(
      new Uint8Array(16)
    );


  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",

      encoder.encode(password),

      {
        name: "PBKDF2"
      },

      false,

      [
        "deriveBits"
      ]
    );


  const derivedBits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",

        salt: salt,

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
   BASE64 HELPER
   ========================================================= */

function bytesToBase64(bytes) {
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

  return btoa(binary);
}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}


/* =========================================================
   JSON RESPONSE HELPER
   ========================================================= */

function jsonResponse(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(data),

    {
      status: status,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store"
      }
    }
  );
}
