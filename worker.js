const PBKDF2_ITERATIONS = 100000;

const SESSION_COOKIE_NAME = "ymir_session";
const SESSION_LENGTH_SECONDS = 60 * 60 * 24 * 7;

const MAX_MOD_FILE_SIZE = 100 * 1024 * 1024;
const MAX_ICON_FILE_SIZE = 5 * 1024 * 1024;


/* =========================================================
   YMIR MODS WORKER
   ========================================================= */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);


    /* =====================================================
       BACKEND TEST
       ===================================================== */

    if (
      url.pathname === "/api/test" &&
      request.method === "GET"
    ) {
      return handleTest(env);
    }


    /* =====================================================
       REGISTER
       ===================================================== */

    if (
      url.pathname === "/api/register" &&
      request.method === "POST"
    ) {
      return handleRegister(
        request,
        env
      );
    }


    /* =====================================================
       LOGIN
       ===================================================== */

    if (
      url.pathname === "/api/login" &&
      request.method === "POST"
    ) {
      return handleLogin(
        request,
        env
      );
    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    if (
      url.pathname === "/api/logout" &&
      request.method === "POST"
    ) {
      return handleLogout(
        request,
        env
      );
    }


    /* =====================================================
       CURRENT USER
       ===================================================== */

    if (
      url.pathname === "/api/me" &&
      request.method === "GET"
    ) {
      return handleCurrentUser(
        request,
        env
      );
    }


    /* =====================================================
       PUBLIC MOD LIST
       ===================================================== */

    if (
      url.pathname === "/api/mods" &&
      request.method === "GET"
    ) {
      return handlePublicMods(
        env
      );
    }


    /* =====================================================
       CURRENT USER'S MODS
       ===================================================== */

    if (
      url.pathname === "/api/my-mods" &&
      request.method === "GET"
    ) {
      return handleMyMods(
        request,
        env
      );
    }


    /* =====================================================
       SINGLE PUBLIC MOD API

       Example:
       /api/mod/toolofthetrade
       ===================================================== */

    if (
      url.pathname.startsWith("/api/mod/") &&
      request.method === "GET"
    ) {
      const slug =
        decodeURIComponent(
          url.pathname.slice(
            "/api/mod/".length
          )
        )
          .trim()
          .toLowerCase();


      return handlePublicMod(
        env,
        slug
      );
    }


    /* =====================================================
       PUBLIC CREATOR API

       Example:
       /api/creator/Yggdrah
       ===================================================== */

    if (
      url.pathname.startsWith("/api/creator/") &&
      request.method === "GET"
    ) {
      const username =
        decodeURIComponent(
          url.pathname.slice(
            "/api/creator/".length
          )
        ).trim();


      return handlePublicCreator(
        env,
        username
      );
    }


    /* =====================================================
       UPLOAD MOD
       ===================================================== */

    if (
      url.pathname === "/api/mods/upload" &&
      request.method === "POST"
    ) {
      return handleModUpload(
        request,
        env
      );
    }


    /* =====================================================
       CLEAN MOD PAGE URL

       Example:
       /mod/toolofthetrade
       ===================================================== */

    if (
      url.pathname.startsWith("/mod/") &&
      request.method === "GET"
    ) {
      const slug =
        decodeURIComponent(
          url.pathname.slice(
            "/mod/".length
          )
        )
          .trim()
          .toLowerCase();


      if (
        slug &&
        /^[a-z0-9-]+$/.test(slug)
      ) {
        const pageUrl =
          new URL(
            "/mod",
            request.url
          );


        const pageRequest =
          new Request(
            pageUrl.toString(),
            {
              method: "GET",
              headers: request.headers
            }
          );


        return env.ASSETS.fetch(
          pageRequest
        );
      }
    }


    /* =====================================================
       CLEAN CREATOR PAGE URL

       Example:
       /creator/Yggdrah
       ===================================================== */

    if (
      url.pathname.startsWith("/creator/") &&
      request.method === "GET"
    ) {
      const username =
        decodeURIComponent(
          url.pathname.slice(
            "/creator/".length
          )
        ).trim();


      if (
        username &&
        /^[A-Za-z0-9_-]+$/.test(
          username
        )
      ) {
        const pageUrl =
          new URL(
            "/creator",
            request.url
          );


        const pageRequest =
          new Request(
            pageUrl.toString(),
            {
              method: "GET",
              headers: request.headers
            }
          );


        return env.ASSETS.fetch(
          pageRequest
        );
      }
    }


    /* =====================================================
       SERVE R2 FILES
       ===================================================== */

    if (
      url.pathname.startsWith("/files/") &&
      request.method === "GET"
    ) {
      return handleStoredFile(
        request,
        env,
        url
      );
    }


    /* =====================================================
       API METHOD ERRORS
       ===================================================== */

    if (
      url.pathname === "/api/register" ||
      url.pathname === "/api/login" ||
      url.pathname === "/api/logout" ||
      url.pathname === "/api/mods" ||
      url.pathname === "/api/my-mods" ||
      url.pathname === "/api/mods/upload" ||
      url.pathname.startsWith("/api/mod/") ||
      url.pathname.startsWith("/api/creator/")
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Method not allowed."
        },
        405
      );
    }


    /* =====================================================
       NORMAL WEBSITE FILES
       ===================================================== */

    return env.ASSETS.fetch(
      request
    );
  }
};


/* =========================================================
   BACKEND TEST
   ========================================================= */

async function handleTest(env) {
  try {

    const userResult =
      await env.DB
        .prepare(
          "SELECT COUNT(*) AS count FROM users"
        )
        .first();


    return jsonResponse({
      success: true,

      message:
        "YMIR Mods backend is running",

      database:
        "connected",

      r2:
        env.MOD_FILES
          ? "connected"
          : "missing",

      users:
        userResult?.count ?? 0
    });

  } catch (error) {

    console.error(
      "Backend test error:",
      error
    );


    return jsonResponse(
      {
        success: false,

        message:
          "Backend or database connection failed."
      },
      500
    );
  }
}


/* =========================================================
   PUBLIC MOD LIST
   ========================================================= */

async function handlePublicMods(env) {
  try {

    const result =
      await env.DB
        .prepare(`
          SELECT
            mods.id,
            mods.name,
            mods.slug,
            mods.version,
            mods.category,
            mods.short_description,
            mods.full_description,
            mods.icon_url,
            mods.download_url,
            mods.changelog,
            mods.is_published,
            mods.created_at,
            mods.updated_at,

            users.id AS author_id,
            users.username AS author

          FROM mods

          LEFT JOIN users
            ON users.id = mods.owner_user_id

          WHERE mods.is_published = 1

          ORDER BY
            datetime(mods.updated_at) DESC,
            mods.id DESC

          LIMIT 50
        `)
        .all();


    return jsonResponse({
      success: true,

      mods:
        result.results || []
    });

  } catch (error) {

    console.error(
      "Public mods error:",
      error
    );


    return jsonResponse(
      {
        success: false,

        message:
          "Unable to load mods.",

        error:
          error.message
      },
      500
    );
  }
}


/* =========================================================
   SINGLE PUBLIC MOD
   ========================================================= */

async function handlePublicMod(
  env,
  slug
) {
  try {

    if (
      !slug ||
      slug.length > 100 ||
      !/^[a-z0-9-]+$/.test(slug)
    ) {
      return jsonResponse(
        {
          success: false,

          message:
            "Invalid mod."
        },
        400
      );
    }


    const mod =
      await env.DB
        .prepare(`
          SELECT
            mods.id,
            mods.owner_user_id,
            mods.name,
            mods.slug,
            mods.version,
            mods.category,
            mods.short_description,
            mods.full_description,
            mods.icon_url,
            mods.download_url,
            mods.changelog,
            mods.is_published,
            mods.created_at,
            mods.updated_at,

            users.id AS author_id,
            users.username AS author

          FROM mods

          LEFT JOIN users
            ON users.id = mods.owner_user_id

          WHERE mods.slug = ?
            AND mods.is_published = 1

          LIMIT 1
        `)
        .bind(
          slug
        )
        .first();


    if (!mod) {

      return jsonResponse(
        {
          success: false,

          message:
            "Mod not found."
        },
        404
      );
    }


    const versionsResult =
      await env.DB
        .prepare(`
          SELECT
            id,
            version,
            file_url,
            changelog,
            file_size,
            downloads,
            created_at

          FROM mod_versions

          WHERE mod_id = ?

          ORDER BY
            datetime(created_at) DESC,
            id DESC
        `)
        .bind(
          mod.id
        )
        .all();


    return jsonResponse({
      success: true,

      mod: {
        ...mod,

        versions:
          versionsResult.results ||
          []
      }
    });

  } catch (error) {

    console.error(
      "Single mod error:",
      error
    );


    return jsonResponse(
      {
        success: false,

        message:
          "Unable to load mod.",

        error:
          error.message
      },
      500
    );
  }
}


/* =========================================================
   PUBLIC CREATOR
   ========================================================= */

async function handlePublicCreator(
  env,
  username
) {
  try {

    if (
      !username ||
      username.length > 24 ||
      !/^[A-Za-z0-9_-]+$/.test(
        username
      )
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Invalid creator."
        },
        400
      );
    }


    const creator =
      await env.DB
        .prepare(`
          SELECT
            id,
            username,
            role,
            created_at

          FROM users

          WHERE LOWER(username) =
                LOWER(?)

          LIMIT 1
        `)
        .bind(
          username
        )
        .first();


    if (!creator) {

      return jsonResponse(
        {
          success: false,

          message:
            "Creator not found."
        },
        404
      );
    }


    const modsResult =
      await env.DB
        .prepare(`
          SELECT
            mods.id,
            mods.name,
            mods.slug,
            mods.version,
            mods.category,
            mods.short_description,
            mods.full_description,
            mods.icon_url,
            mods.download_url,
            mods.changelog,
            mods.created_at,
            mods.updated_at

          FROM mods

          WHERE mods.owner_user_id = ?
            AND mods.is_published = 1

          ORDER BY
            datetime(mods.updated_at) DESC,
            mods.id DESC
        `)
        .bind(
          creator.id
        )
        .all();


    const mods =
      modsResult.results ||
      [];


    return jsonResponse({
      success: true,

      creator: {
        id:
          creator.id,

        username:
          creator.username,

        role:
          creator.role,

        created_at:
          creator.created_at,

        mod_count:
          mods.length
      },

      mods:
        mods
    });

  } catch (error) {

    console.error(
      "Creator page error:",
      error
    );


    return jsonResponse(
      {
        success: false,

        message:
          "Unable to load creator.",

        error:
          error.message
      },
      500
    );
  }
}


/* =========================================================
   CURRENT USER'S MODS
   ========================================================= */

async function handleMyMods(
  request,
  env
) {
  try {

    const user =
      await getAuthenticatedUser(
        request,
        env
      );


    if (!user) {

      return jsonResponse(
        {
          success: false,

          message:
            "You must be logged in."
        },
        401
      );
    }


    const result =
      await env.DB
        .prepare(`
          SELECT
            id,
            name,
            slug,
            version,
            category,
            short_description,
            full_description,
            icon_url,
            download_url,
            changelog,
            is_published,
            created_at,
            updated_at

          FROM mods

          WHERE owner_user_id = ?

          ORDER BY
            datetime(updated_at) DESC,
            id DESC
        `)
        .bind(
          user.id
        )
        .all();


    return jsonResponse({
      success: true,

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
      },

      mods:
        result.results ||
        []
    });

  } catch (error) {

    console.error(
      "My mods error:",
      error
    );


    return jsonResponse(
      {
        success: false,

        message:
          "Unable to load your mods.",

        error:
          error.message
      },
      500
    );
  }
}


/* =========================================================
   REGISTER
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
      !isValidEmail(email)
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


    if (existingUser) {

      return jsonResponse(
        {
          success: false,

          message:
            "That username or email is already registered."
        },
        409
      );
    }


    const passwordHash =
      await hashPassword(
        password
      );


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

    const user =
      await getAuthenticatedUser(
        request,
        env
      );


    if (!user) {

      return jsonResponse({
        success: true,

        authenticated:
          false,

        user:
          null
      });
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
      "Current user error:",
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


    if (sessionToken) {

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
   UPLOAD MOD
   ========================================================= */

async function handleModUpload(
  request,
  env
) {
  let packageKey =
    null;

  let iconKey =
    null;

  let modId =
    null;


  try {

    const user =
      await getAuthenticatedUser(
        request,
        env
      );


    if (!user) {

      return jsonResponse(
        {
          success: false,

          message:
            "You must be logged in."
        },
        401
      );
    }


    if (
      !Boolean(
        user.can_upload
      )
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Your account does not have upload permission."
        },
        403
      );
    }


    if (!env.MOD_FILES) {

      return jsonResponse(
        {
          success: false,

          message:
            "YMIR file storage is not connected."
        },
        500
      );
    }


    const form =
      await request.formData();


    const name =
      String(
        form.get(
          "name"
        ) ?? ""
      ).trim();


    const version =
      String(
        form.get(
          "version"
        ) ?? ""
      ).trim();


    const category =
      String(
        form.get(
          "category"
        ) ?? ""
      ).trim();


    const shortDescription =
      String(
        form.get(
          "short_description"
        ) ?? ""
      ).trim();


    const fullDescription =
      String(
        form.get(
          "full_description"
        ) ?? ""
      ).trim();


    const changelog =
      String(
        form.get(
          "changelog"
        ) ?? ""
      ).trim();


    const modFile =
      form.get(
        "mod_file"
      );


    const iconFile =
      form.get(
        "icon_file"
      );


    /* -----------------------------------------------------
       VALIDATE TEXT
       ----------------------------------------------------- */

    if (
      name.length < 2 ||
      name.length > 80
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Mod name must be between 2 and 80 characters."
        },
        400
      );
    }


    if (
      version.length < 1 ||
      version.length > 32
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Please enter a valid mod version."
        },
        400
      );
    }


    if (
      category.length < 2 ||
      category.length > 60
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Please select a mod category."
        },
        400
      );
    }


    if (
      shortDescription.length < 10 ||
      shortDescription.length > 250
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Short description must be between 10 and 250 characters."
        },
        400
      );
    }


    if (
      fullDescription.length >
      10000
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Full description is too long."
        },
        400
      );
    }


    if (
      changelog.length >
      10000
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Changelog is too long."
        },
        400
      );
    }


    /* -----------------------------------------------------
       VALIDATE MOD FILE
       ----------------------------------------------------- */

    if (
      !(modFile instanceof File) ||
      modFile.size === 0
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Please choose a mod ZIP file."
        },
        400
      );
    }


    if (
      modFile.size >
      MAX_MOD_FILE_SIZE
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Mod package is too large."
        },
        413
      );
    }


    if (
      !modFile.name
        .toLowerCase()
        .endsWith(".zip")
    ) {

      return jsonResponse(
        {
          success: false,

          message:
            "Mod package must be a ZIP file."
        },
        400
      );
    }


    /* -----------------------------------------------------
       VALIDATE ICON
       ----------------------------------------------------- */

    if (
      iconFile instanceof File &&
      iconFile.size > 0
    ) {

      if (
        iconFile.size >
        MAX_ICON_FILE_SIZE
      ) {

        return jsonResponse(
          {
            success: false,

            message:
              "Mod icon is too large."
          },
          413
        );
      }


      const allowedIconTypes =
        [
          "image/png",
          "image/jpeg",
          "image/webp"
        ];


      if (
        !allowedIconTypes.includes(
          iconFile.type
        )
      ) {

        return jsonResponse(
          {
            success: false,

            message:
              "Mod icon must be PNG, JPG or WebP."
          },
          400
        );
      }
    }


    /* -----------------------------------------------------
       CREATE SLUG
       ----------------------------------------------------- */

    let slug =
      createSlug(
        name
      );


    if (!slug) {

      return jsonResponse(
        {
          success: false,

          message:
            "Unable to create a valid mod URL."
        },
        400
      );
    }


    const existingSlug =
      await env.DB
        .prepare(`
          SELECT id

          FROM mods

          WHERE slug = ?

          LIMIT 1
        `)
        .bind(
          slug
        )
        .first();


    if (existingSlug) {

      slug =
        slug +
        "-" +
        Date.now()
          .toString()
          .slice(-6);
    }


    /* -----------------------------------------------------
       R2 KEYS
       ----------------------------------------------------- */

    const timestamp =
      Date.now();


    const cleanPackageName =
      sanitizeFilename(
        modFile.name
      );


    packageKey =
      `mods/${user.id}/${slug}/${version}/${timestamp}-${cleanPackageName}`;


    /* -----------------------------------------------------
       UPLOAD MOD ZIP
       ----------------------------------------------------- */

    await env.MOD_FILES.put(
      packageKey,
      modFile.stream(),
      {
        httpMetadata: {

          contentType:
            modFile.type ||
            "application/zip",

          contentDisposition:
            `attachment; filename="${cleanPackageName}"`
        },

        customMetadata: {

          uploader:
            user.username,

          mod:
            name,

          version:
            version
        }
      }
    );


    /* -----------------------------------------------------
       UPLOAD ICON
       ----------------------------------------------------- */

    if (
      iconFile instanceof File &&
      iconFile.size > 0
    ) {

      const iconExtension =
        getImageExtension(
          iconFile.type
        );


      iconKey =
        `mods/${user.id}/${slug}/icon-${timestamp}.${iconExtension}`;


      await env.MOD_FILES.put(
        iconKey,
        iconFile.stream(),
        {
          httpMetadata: {

            contentType:
              iconFile.type,

            contentDisposition:
              "inline"
          }
        }
      );
    }


    /* -----------------------------------------------------
       FILE URLS
       ----------------------------------------------------- */

    const packageUrl =
      "/files/" +
      encodeURI(
        packageKey
      );


    const iconUrl =
      iconKey
        ? "/files/" +
          encodeURI(
            iconKey
          )
        : null;


    /* -----------------------------------------------------
       INSERT MOD
       ----------------------------------------------------- */

    const modInsert =
      await env.DB
        .prepare(`
          INSERT INTO mods (
            owner_user_id,
            name,
            slug,
            version,
            category,
            short_description,
            full_description,
            icon_url,
            download_url,
            changelog,
            is_published,
            created_at,
            updated_at
          )

          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            1,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `)
        .bind(
          user.id,
          name,
          slug,
          version,
          category,
          shortDescription,
          fullDescription,
          iconUrl,
          packageUrl,
          changelog
        )
        .run();


    modId =
      modInsert?.meta
        ?.last_row_id;


    if (!modId) {

      throw new Error(
        "Unable to determine new mod ID."
      );
    }


    /* -----------------------------------------------------
       INSERT VERSION
       ----------------------------------------------------- */

    await env.DB
      .prepare(`
        INSERT INTO mod_versions (
          mod_id,
          version,
          file_url,
          changelog,
          file_size,
          downloads,
          created_at
        )

        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          0,
          CURRENT_TIMESTAMP
        )
      `)
      .bind(
        modId,
        version,
        packageUrl,
        changelog,
        modFile.size
      )
      .run();


    /* -----------------------------------------------------
       SUCCESS
       ----------------------------------------------------- */

    return jsonResponse(
      {
        success: true,

        message:
          "Mod uploaded successfully.",

        mod: {
          id:
            modId,

          name:
            name,

          slug:
            slug,

          version:
            version,

          category:
            category,

          icon_url:
            iconUrl,

          download_url:
            packageUrl
        }
      },
      201
    );


  } catch (error) {

    console.error(
      "Mod upload error:",
      error
    );


    /* -----------------------------------------------------
       BEST-EFFORT CLEANUP
       ----------------------------------------------------- */

    try {

      if (modId) {

        await env.DB
          .prepare(`
            DELETE FROM mods

            WHERE id = ?
          `)
          .bind(
            modId
          )
          .run();
      }


      if (
        packageKey &&
        env.MOD_FILES
      ) {

        await env.MOD_FILES
          .delete(
            packageKey
          );
      }


      if (
        iconKey &&
        env.MOD_FILES
      ) {

        await env.MOD_FILES
          .delete(
            iconKey
          );
      }

    } catch (
      cleanupError
    ) {

      console.error(
        "Upload cleanup error:",
        cleanupError
      );
    }


    return jsonResponse(
      {
        success: false,

        message:
          "Unable to upload mod."
      },
      500
    );
  }
}


/* =========================================================
   SERVE R2 FILE
   ========================================================= */

async function handleStoredFile(
  request,
  env,
  url
) {
  try {

    if (!env.MOD_FILES) {

      return new Response(
        "Storage unavailable.",
        {
          status: 500
        }
      );
    }


    const encodedKey =
      url.pathname.slice(
        "/files/".length
      );


    const key =
      decodeURIComponent(
        encodedKey
      );


    if (
      !key ||
      key.includes("..")
    ) {

      return new Response(
        "Invalid file.",
        {
          status: 400
        }
      );
    }


    const object =
      await env.MOD_FILES.get(
        key
      );


    if (!object) {

      return new Response(
        "File not found.",
        {
          status: 404
        }
      );
    }


    const headers =
      new Headers();


    object.writeHttpMetadata(
      headers
    );


    headers.set(
      "etag",
      object.httpEtag
    );


    headers.set(
      "Cache-Control",
      "public, max-age=3600"
    );


    return new Response(
      object.body,
      {
        headers
      }
    );

  } catch (error) {

    console.error(
      "R2 file error:",
      error
    );


    return new Response(
      "Unable to load file.",
      {
        status: 500
      }
    );
  }
}


/* =========================================================
   AUTHENTICATED USER
   ========================================================= */

async function getAuthenticatedUser(
  request,
  env
) {

  const sessionToken =
    getCookie(
      request,
      SESSION_COOKIE_NAME
    );


  if (!sessionToken) {

    return null;
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


  return user || null;
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


  return [
    "pbkdf2_sha256",

    PBKDF2_ITERATIONS,

    bytesToBase64(
      salt
    ),

    bytesToBase64(
      new Uint8Array(
        derivedBits
      )
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


    return constantTimeEqual(
      new Uint8Array(
        derivedBits
      ),

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

  return bytesToBase64Url(
    crypto.getRandomValues(
      new Uint8Array(32)
    )
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
   MOD HELPERS
   ========================================================= */

function createSlug(
  value
) {

  return String(
    value
  )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(
      0,
      80
    );
}


function sanitizeFilename(
  filename
) {

  return String(
    filename
  )
    .replace(
      /[^A-Za-z0-9._-]/g,
      "_"
    )
    .replace(
      /_+/g,
      "_"
    )
    .slice(
      -120
    );
}


function getImageExtension(
  mime
) {

  if (
    mime ===
    "image/jpeg"
  ) {

    return "jpg";
  }


  if (
    mime ===
    "image/webp"
  ) {

    return "webp";
  }


  return "png";
}


/* =========================================================
   ENCODING HELPERS
   ========================================================= */

function bytesToBase64(
  bytes
) {

  let binary =
    "";


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


  let difference =
    0;


  for (
    let i = 0;
    i < first.length;
    i++
  ) {

    difference |=
      first[i] ^
      second[i];
  }


  return difference ===
    0;
}


/* =========================================================
   EMAIL
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
