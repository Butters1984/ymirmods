const PBKDF2_ITERATIONS = 100000;

const SESSION_COOKIE_NAME =
  "ymir_session";

const SESSION_LENGTH_SECONDS =
  60 * 60 * 24 * 7;

const DISCORD_STATE_COOKIE_NAME =
  "ymir_discord_state";

const DISCORD_STATE_LENGTH_SECONDS =
  60 * 10;

const GITHUB_STATE_COOKIE_NAME =
  "ymir_github_state";

const GITHUB_STATE_LENGTH_SECONDS =
  60 * 10;

const MAX_MOD_FILE_SIZE =
  100 * 1024 * 1024;

const MAX_ICON_FILE_SIZE =
  5 * 1024 * 1024;

const MAX_FULL_DESCRIPTION_LENGTH =
  100000;

const MAX_CHANGELOG_LENGTH =
  50000;


/* =========================================================
   YMIR MODS WORKER
   ========================================================= */

export default {

  async fetch(
    request,
    env
  ) {

    const url =
      new URL(
        request.url
      );


    /* =====================================================
       BACKEND TEST
       ===================================================== */

    if (
      url.pathname ===
        "/api/test" &&
      request.method ===
        "GET"
    ) {

      return handleTest(
        env
      );
    }


    /* =====================================================
       DISCORD LOGIN
       ===================================================== */

    if (
      url.pathname ===
        "/api/auth/discord" &&
      request.method ===
        "GET"
    ) {

      return handleDiscordLogin(
        request,
        env
      );
    }


    /* =====================================================
       DISCORD CALLBACK
       ===================================================== */

    if (
      url.pathname ===
        "/api/auth/discord/callback" &&
      request.method ===
        "GET"
    ) {

      return handleDiscordCallback(
        request,
        env
      );
    }


    /* =====================================================
       GITHUB LOGIN
       ===================================================== */

    if (
      url.pathname ===
        "/api/auth/github" &&
      request.method ===
        "GET"
    ) {

      return handleGitHubLogin(
        request,
        env
      );
    }


    /* =====================================================
       GITHUB CALLBACK
       ===================================================== */

    if (
      url.pathname ===
        "/api/auth/github/callback" &&
      request.method ===
        "GET"
    ) {

      return handleGitHubCallback(
        request,
        env
      );
    }


    /* =====================================================
       LEGACY REGISTER
       ===================================================== */

    if (
      url.pathname ===
        "/api/register" &&
      request.method ===
        "POST"
    ) {

      return handleRegister(
        request,
        env
      );
    }


    /* =====================================================
       LEGACY LOGIN
       ===================================================== */

    if (
      url.pathname ===
        "/api/login" &&
      request.method ===
        "POST"
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
      url.pathname ===
        "/api/logout" &&
      request.method ===
        "POST"
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
      url.pathname ===
        "/api/me" &&
      request.method ===
        "GET"
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
      url.pathname ===
        "/api/mods" &&
      request.method ===
        "GET"
    ) {

      return handlePublicMods(
        env
      );
    }


    /* =====================================================
       CURRENT USER'S MODS
       ===================================================== */

    if (
      url.pathname ===
        "/api/my-mods" &&
      request.method ===
        "GET"
    ) {

      return handleMyMods(
        request,
        env
      );
    }


    /* =====================================================
       API KEYS - LIST
       ===================================================== */

    if (
      url.pathname ===
        "/api/api-keys" &&
      request.method ===
        "GET"
    ) {

      return handleListApiKeys(
        request,
        env
      );
    }


    /* =====================================================
       API KEYS - GENERATE
       ===================================================== */

    if (
      url.pathname ===
        "/api/api-keys" &&
      request.method ===
        "POST"
    ) {

      return handleGenerateApiKey(
        request,
        env
      );
    }


    /* =====================================================
       API KEYS - REVOKE
       ===================================================== */

    if (
      url.pathname.match(
        /^\/api\/api-keys\/\d+\/revoke$/
      ) &&
      request.method ===
        "POST"
    ) {

      const keyId =
        Number(
          url.pathname.split("/")[3]
        );


      return handleRevokeApiKey(
        request,
        env,
        keyId
      );
    }


    /* =====================================================
       CREATOR API - WHO AM I
       ===================================================== */

    if (
      url.pathname ===
        "/api/v1/me" &&
      request.method ===
        "GET"
    ) {

      return handleApiV1Me(
        request,
        env
      );
    }


    /* =====================================================
       CREATOR API - PUBLISH RELEASE
       ===================================================== */

    if (
      url.pathname.match(
        /^\/api\/v1\/mods\/[a-z0-9-]+\/releases$/
      ) &&
      request.method ===
        "POST"
    ) {

      const parts =
        url.pathname
          .split("/")
          .filter(Boolean);


      const slug =
        String(
          parts[3] ||
          ""
        )
          .trim()
          .toLowerCase();


      return handleApiV1PublishRelease(
        request,
        env,
        slug
      );
    }


    /* =====================================================
       SINGLE PUBLIC MOD
       ===================================================== */

    if (
      url.pathname.startsWith(
        "/api/mod/"
      ) &&
      request.method ===
        "GET"
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
       PUBLIC CREATOR
       ===================================================== */

    if (
      url.pathname.startsWith(
        "/api/creator/"
      ) &&
      request.method ===
        "GET"
    ) {

      const username =
        decodeURIComponent(
          url.pathname.slice(
            "/api/creator/".length
          )
        )
          .trim();


      return handlePublicCreator(
        env,
        username
      );
    }


    /* =====================================================
       UPLOAD MOD
       ===================================================== */

    if (
      url.pathname ===
        "/api/mods/upload" &&
      request.method ===
        "POST"
    ) {

      return handleModUpload(
        request,
        env
      );
    }


    /* =====================================================
       CLEAN MOD PAGE
       ===================================================== */

    if (
      url.pathname.startsWith(
        "/mod/"
      ) &&
      request.method ===
        "GET"
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
        /^[a-z0-9-]+$/.test(
          slug
        )
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
              method:
                "GET",

              headers:
                request.headers
            }
          );


        return env.ASSETS.fetch(
          pageRequest
        );
      }
    }


    /* =====================================================
       CLEAN CREATOR PAGE
       ===================================================== */

    if (
      url.pathname.startsWith(
        "/creator/"
      ) &&
      request.method ===
        "GET"
    ) {

      const username =
        decodeURIComponent(
          url.pathname.slice(
            "/creator/".length
          )
        )
          .trim();


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
              method:
                "GET",

              headers:
                request.headers
            }
          );


        return env.ASSETS.fetch(
          pageRequest
        );
      }
    }


    /* =====================================================
       R2 FILES
       ===================================================== */

    if (
      url.pathname.startsWith(
        "/files/"
      ) &&
      request.method ===
        "GET"
    ) {

      return handleStoredFile(
        request,
        env,
        url
      );
    }


    /* =====================================================
       METHOD ERRORS
       ===================================================== */

    if (
      url.pathname ===
        "/api/register" ||

      url.pathname ===
        "/api/login" ||

      url.pathname ===
        "/api/logout" ||

      url.pathname ===
        "/api/mods" ||

      url.pathname ===
        "/api/my-mods" ||

      url.pathname ===
        "/api/mods/upload" ||

      url.pathname ===
        "/api/api-keys" ||

      url.pathname.startsWith(
        "/api/api-keys/"
      ) ||

      url.pathname ===
        "/api/v1/me" ||

      url.pathname.startsWith(
        "/api/v1/mods/"
      ) ||

      url.pathname ===
        "/api/auth/discord" ||

      url.pathname ===
        "/api/auth/discord/callback" ||

      url.pathname ===
        "/api/auth/github" ||

      url.pathname ===
        "/api/auth/github/callback" ||

      url.pathname.startsWith(
        "/api/mod/"
      ) ||

      url.pathname.startsWith(
        "/api/creator/"
      )
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Method not allowed."
        },
        405
      );
    }


    /* =====================================================
       WEBSITE FILES
       ===================================================== */

    return env.ASSETS.fetch(
      request
    );
  }
};


/* =========================================================
   BACKEND TEST
   ========================================================= */

async function handleTest(
  env
) {

  try {

    const result =
      await env.DB
        .prepare(
          `
          SELECT
            COUNT(*) AS count

          FROM users
          `
        )
        .first();


    return jsonResponse({
      success:
        true,

      message:
        "YMIR Mods backend is running",

      database:
        "connected",

      r2:
        env.MOD_FILES
          ? "connected"
          : "missing",

      discord:
        (
          env.DISCORD_CLIENT_ID &&
          env.DISCORD_CLIENT_SECRET &&
          env.DISCORD_REDIRECT_URI
        )
          ? "configured"
          : "missing",

      github:
        (
          env.GITHUB_CLIENT_ID &&
          env.GITHUB_CLIENT_SECRET &&
          env.GITHUB_REDIRECT_URI
        )
          ? "configured"
          : "missing",

      users:
        result?.count ??
        0
    });

  } catch (error) {

    console.error(
      "Backend test error:",
      error
    );


    return jsonResponse(
      {
        success:
          false,

        message:
          "Backend or database connection failed."
      },
      500
    );
  }
}


/* =========================================================
   DISCORD LOGIN
   ========================================================= */

async function handleDiscordLogin(
  request,
  env
) {

  try {

    if (
      !env.DISCORD_CLIENT_ID ||
      !env.DISCORD_CLIENT_SECRET ||
      !env.DISCORD_REDIRECT_URI
    ) {

      return new Response(
        "Discord login is not configured.",
        {
          status:
            500
        }
      );
    }


    const state =
      generateSessionToken();


    const authorizeUrl =
      new URL(
        "https://discord.com/oauth2/authorize"
      );


    authorizeUrl
      .searchParams
      .set(
        "client_id",
        env.DISCORD_CLIENT_ID
      );


    authorizeUrl
      .searchParams
      .set(
        "response_type",
        "code"
      );


    authorizeUrl
      .searchParams
      .set(
        "redirect_uri",
        env.DISCORD_REDIRECT_URI
      );


    authorizeUrl
      .searchParams
      .set(
        "scope",
        "identify email"
      );


    authorizeUrl
      .searchParams
      .set(
        "state",
        state
      );


    const headers =
      new Headers();


    headers.set(
      "Location",
      authorizeUrl.toString()
    );


    headers.set(
      "Cache-Control",
      "no-store"
    );


    headers.append(
      "Set-Cookie",
      createDiscordStateCookie(
        state
      )
    );


    return new Response(
      null,
      {
        status:
          302,

        headers:
          headers
      }
    );

  } catch (error) {

    console.error(
      "Discord login error:",
      error
    );


    return new Response(
      "Unable to start Discord login.",
      {
        status:
          500
      }
    );
  }
}


/* =========================================================
   DISCORD CALLBACK
   ========================================================= */

async function handleDiscordCallback(
  request,
  env
) {

  try {

    const url =
      new URL(
        request.url
      );


    const discordError =
      url.searchParams.get(
        "error"
      );


    if (
      discordError
    ) {

      return redirectResponse(
        "/login?error=discord_cancelled",
        {
          "Set-Cookie":
            clearDiscordStateCookie()
        }
      );
    }


    const code =
      url.searchParams.get(
        "code"
      );


    const returnedState =
      url.searchParams.get(
        "state"
      );


    const storedState =
      getCookie(
        request,
        DISCORD_STATE_COOKIE_NAME
      );


    if (
      !code ||
      !returnedState ||
      !storedState ||
      returnedState !==
        storedState
    ) {

      return redirectResponse(
        "/login?error=discord_state",
        {
          "Set-Cookie":
            clearDiscordStateCookie()
        }
      );
    }


    /* -----------------------------------------------------
       EXCHANGE CODE FOR TOKEN
       ----------------------------------------------------- */

    const tokenBody =
      new URLSearchParams();


    tokenBody.set(
      "client_id",
      env.DISCORD_CLIENT_ID
    );


    tokenBody.set(
      "client_secret",
      env.DISCORD_CLIENT_SECRET
    );


    tokenBody.set(
      "grant_type",
      "authorization_code"
    );


    tokenBody.set(
      "code",
      code
    );


    tokenBody.set(
      "redirect_uri",
      env.DISCORD_REDIRECT_URI
    );


    const tokenResponse =
      await fetch(
        "https://discord.com/api/v10/oauth2/token",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body:
            tokenBody
        }
      );


    if (
      !tokenResponse.ok
    ) {

      console.error(
        "Discord token exchange failed:",
        tokenResponse.status
      );


      return redirectResponse(
        "/login?error=discord_token",
        {
          "Set-Cookie":
            clearDiscordStateCookie()
        }
      );
    }


    const tokenData =
      await tokenResponse.json();


    const accessToken =
      tokenData.access_token;


    if (
      !accessToken
    ) {

      return redirectResponse(
        "/login?error=discord_token",
        {
          "Set-Cookie":
            clearDiscordStateCookie()
        }
      );
    }


    /* -----------------------------------------------------
       GET DISCORD USER
       ----------------------------------------------------- */

    const discordResponse =
      await fetch(
        "https://discord.com/api/v10/users/@me",
        {
          headers: {
            "Authorization":
              `Bearer ${accessToken}`
          }
        }
      );


    if (
      !discordResponse.ok
    ) {

      console.error(
        "Discord user request failed:",
        discordResponse.status
      );


      return redirectResponse(
        "/login?error=discord_user",
        {
          "Set-Cookie":
            clearDiscordStateCookie()
        }
      );
    }


    const discordUser =
      await discordResponse.json();


    const discordId =
      String(
        discordUser.id ??
        ""
      )
        .trim();


    const discordUsername =
      String(
        discordUser.username ??
        ""
      )
        .trim();


    const displayName =
      String(
        discordUser.global_name ||
        discordUser.username ||
        ""
      )
        .trim();


    const discordEmail =
      String(
        discordUser.email ??
        ""
      )
        .trim()
        .toLowerCase();


    const emailVerified =
      Boolean(
        discordUser.verified
      );


    const avatarUrl =
      buildDiscordAvatarUrl(
        discordUser
      );


    if (
      !discordId
    ) {

      return redirectResponse(
        "/login?error=discord_user",
        {
          "Set-Cookie":
            clearDiscordStateCookie()
        }
      );
    }


    /* -----------------------------------------------------
       FIND EXISTING DISCORD LINK
       ----------------------------------------------------- */

    let user =
      await env.DB
        .prepare(
          `
          SELECT
            id,
            username,
            email,
            role,
            can_upload,
            discord_id,
            discord_username,
            display_name,
            avatar_url

          FROM users

          WHERE discord_id = ?

          LIMIT 1
          `
        )
        .bind(
          discordId
        )
        .first();


    /* -----------------------------------------------------
       LINK EXISTING YMIR ACCOUNT BY VERIFIED EMAIL
       ----------------------------------------------------- */

    if (
      !user &&
      discordEmail &&
      emailVerified
    ) {

      const emailUser =
        await env.DB
          .prepare(
            `
            SELECT
              id,
              username,
              email,
              role,
              can_upload,
              discord_id,
              discord_username,
              display_name,
              avatar_url

            FROM users

            WHERE LOWER(email) =
                  LOWER(?)

            LIMIT 1
            `
          )
          .bind(
            discordEmail
          )
          .first();


      if (
        emailUser
      ) {

        if (
          emailUser.discord_id &&
          String(
            emailUser.discord_id
          ) !==
            discordId
        ) {

          return redirectResponse(
            "/login?error=discord_conflict",
            {
              "Set-Cookie":
                clearDiscordStateCookie()
            }
          );
        }


        await env.DB
          .prepare(
            `
            UPDATE users

            SET
              discord_id = ?,
              discord_username = ?,
              display_name = ?,
              avatar_url = ?

            WHERE id = ?
            `
          )
          .bind(
            discordId,
            discordUsername,
            displayName,
            avatarUrl,
            emailUser.id
          )
          .run();


        user = {
          ...emailUser,

          discord_id:
            discordId,

          discord_username:
            discordUsername,

          display_name:
            displayName,

          avatar_url:
            avatarUrl
        };
      }
    }


    /* -----------------------------------------------------
       CREATE NEW YMIR USER
       ----------------------------------------------------- */

    if (
      !user
    ) {

      const username =
        await createUniqueDiscordUsername(
          env,
          discordUsername,
          discordId
        );


      const email =
        (
          discordEmail &&
          emailVerified
        )
          ? discordEmail
          : `discord_${discordId}@users.ymirmods.invalid`;


      const randomPassword =
        generateSessionToken() +
        generateSessionToken();


      const passwordHash =
        await hashPassword(
          randomPassword
        );


      const insert =
        await env.DB
          .prepare(
            `
            INSERT INTO users (
              username,
              email,
              password_hash,
              role,
              can_upload,
              discord_id,
              discord_username,
              display_name,
              avatar_url
            )

            VALUES (
              ?,
              ?,
              ?,
              'member',
              1,
              ?,
              ?,
              ?,
              ?
            )
            `
          )
          .bind(
            username,
            email,
            passwordHash,
            discordId,
            discordUsername,
            displayName,
            avatarUrl
          )
          .run();


      const userId =
        insert?.meta
          ?.last_row_id;


      if (
        !userId
      ) {

        throw new Error(
          "Unable to create Discord user."
        );
      }


      user = {
        id:
          userId,

        username:
          username,

        email:
          email,

        role:
          "member",

        can_upload:
          1,

        discord_id:
          discordId,

        discord_username:
          discordUsername,

        display_name:
          displayName,

        avatar_url:
          avatarUrl
      };

    } else {

      /* ---------------------------------------------------
         REFRESH DISCORD PROFILE EACH LOGIN
         --------------------------------------------------- */

      await env.DB
        .prepare(
          `
          UPDATE users

          SET
            discord_username = ?,
            display_name = ?,
            avatar_url = ?

          WHERE id = ?
          `
        )
        .bind(
          discordUsername,
          displayName,
          avatarUrl,
          user.id
        )
        .run();


      user.discord_username =
        discordUsername;


      user.display_name =
        displayName;


      user.avatar_url =
        avatarUrl;
    }


    /* -----------------------------------------------------
       CREATE SESSION
       ----------------------------------------------------- */

    const sessionToken =
      await createUserSession(
        env,
        user.id
      );


    const headers =
      new Headers();


    headers.set(
      "Location",
      "/dashboard"
    );


    headers.set(
      "Cache-Control",
      "no-store"
    );


    headers.append(
      "Set-Cookie",
      createSessionCookie(
        sessionToken
      )
    );


    headers.append(
      "Set-Cookie",
      clearDiscordStateCookie()
    );


    return new Response(
      null,
      {
        status:
          302,

        headers:
          headers
      }
    );

  } catch (error) {

    console.error(
      "Discord callback error:",
      error
    );


    return redirectResponse(
      "/login?error=discord_failed",
      {
        "Set-Cookie":
          clearDiscordStateCookie()
      }
    );
  }
}


/* =========================================================
   GITHUB LOGIN
   ========================================================= */

async function handleGitHubLogin(
  request,
  env
) {

  try {

    if (
      !env.GITHUB_CLIENT_ID ||
      !env.GITHUB_CLIENT_SECRET ||
      !env.GITHUB_REDIRECT_URI
    ) {

      return new Response(
        "GitHub login is not configured.",
        {
          status:
            500
        }
      );
    }


    const state =
      generateSessionToken();


    const authorizeUrl =
      new URL(
        "https://github.com/login/oauth/authorize"
      );


    authorizeUrl
      .searchParams
      .set(
        "client_id",
        env.GITHUB_CLIENT_ID
      );


    authorizeUrl
      .searchParams
      .set(
        "redirect_uri",
        env.GITHUB_REDIRECT_URI
      );


    authorizeUrl
      .searchParams
      .set(
        "scope",
        "read:user user:email"
      );


    authorizeUrl
      .searchParams
      .set(
        "state",
        state
      );


    const headers =
      new Headers();


    headers.set(
      "Location",
      authorizeUrl.toString()
    );


    headers.set(
      "Cache-Control",
      "no-store"
    );


    headers.append(
      "Set-Cookie",
      createGitHubStateCookie(
        state
      )
    );


    return new Response(
      null,
      {
        status:
          302,

        headers:
          headers
      }
    );

  } catch (error) {

    console.error(
      "GitHub login error:",
      error
    );


    return new Response(
      "Unable to start GitHub login.",
      {
        status:
          500
      }
    );
  }
}


/* =========================================================
   GITHUB CALLBACK
   ========================================================= */

async function handleGitHubCallback(
  request,
  env
) {

  try {

    const url =
      new URL(
        request.url
      );


    const githubError =
      url.searchParams.get(
        "error"
      );


    if (
      githubError
    ) {

      return redirectResponse(
        "/login?error=github_cancelled",
        {
          "Set-Cookie":
            clearGitHubStateCookie()
        }
      );
    }


    const code =
      url.searchParams.get(
        "code"
      );


    const returnedState =
      url.searchParams.get(
        "state"
      );


    const storedState =
      getCookie(
        request,
        GITHUB_STATE_COOKIE_NAME
      );


    if (
      !code ||
      !returnedState ||
      !storedState ||
      returnedState !==
        storedState
    ) {

      return redirectResponse(
        "/login?error=github_state",
        {
          "Set-Cookie":
            clearGitHubStateCookie()
        }
      );
    }


    const tokenBody =
      new URLSearchParams();


    tokenBody.set(
      "client_id",
      env.GITHUB_CLIENT_ID
    );


    tokenBody.set(
      "client_secret",
      env.GITHUB_CLIENT_SECRET
    );


    tokenBody.set(
      "code",
      code
    );


    tokenBody.set(
      "redirect_uri",
      env.GITHUB_REDIRECT_URI
    );


    const tokenResponse =
      await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method:
            "POST",

          headers: {
            "Accept":
              "application/json",

            "Content-Type":
              "application/x-www-form-urlencoded",

            "User-Agent":
              "YMIR-Mods"
          },

          body:
            tokenBody
        }
      );


    if (
      !tokenResponse.ok
    ) {

      console.error(
        "GitHub token exchange failed:",
        tokenResponse.status
      );


      return redirectResponse(
        "/login?error=github_token",
        {
          "Set-Cookie":
            clearGitHubStateCookie()
        }
      );
    }


    const tokenData =
      await tokenResponse.json();


    const accessToken =
      String(
        tokenData.access_token ||
        ""
      )
        .trim();


    if (
      !accessToken
    ) {

      return redirectResponse(
        "/login?error=github_token",
        {
          "Set-Cookie":
            clearGitHubStateCookie()
        }
      );
    }


    const githubHeaders = {
      "Accept":
        "application/vnd.github+json",

      "Authorization":
        `Bearer ${accessToken}`,

      "User-Agent":
        "YMIR-Mods",

      "X-GitHub-Api-Version":
        "2022-11-28"
    };


    const githubUserResponse =
      await fetch(
        "https://api.github.com/user",
        {
          headers:
            githubHeaders
        }
      );


    if (
      !githubUserResponse.ok
    ) {

      console.error(
        "GitHub user request failed:",
        githubUserResponse.status
      );


      return redirectResponse(
        "/login?error=github_user",
        {
          "Set-Cookie":
            clearGitHubStateCookie()
        }
      );
    }


    const githubUser =
      await githubUserResponse.json();


    const githubId =
      String(
        githubUser.id ??
        ""
      )
        .trim();


    const githubUsername =
      String(
        githubUser.login ??
        ""
      )
        .trim();


    const githubDisplayName =
      String(
        githubUser.name ||
        githubUser.login ||
        ""
      )
        .trim();


    const githubAvatarUrl =
      String(
        githubUser.avatar_url ||
        ""
      )
        .trim() ||
      null;


    if (
      !githubId ||
      !githubUsername
    ) {

      return redirectResponse(
        "/login?error=github_user",
        {
          "Set-Cookie":
            clearGitHubStateCookie()
        }
      );
    }


    let githubEmail =
      "";


    const githubEmailResponse =
      await fetch(
        "https://api.github.com/user/emails?per_page=100",
        {
          headers:
            githubHeaders
        }
      );


    if (
      githubEmailResponse.ok
    ) {

      const emails =
        await githubEmailResponse.json();


      if (
        Array.isArray(
          emails
        )
      ) {

        const primaryVerified =
          emails.find(
            email =>
              email &&
              email.primary ===
                true &&
              email.verified ===
                true &&
              email.email
          );


        const anyVerified =
          emails.find(
            email =>
              email &&
              email.verified ===
                true &&
              email.email
          );


        githubEmail =
          String(
            (
              primaryVerified ||
              anyVerified
            )
              ?.email ||
            ""
          )
            .trim()
            .toLowerCase();
      }
    }


    if (
      !githubEmail
    ) {

      const publicEmail =
        String(
          githubUser.email ||
          ""
        )
          .trim()
          .toLowerCase();


      if (
        publicEmail
      ) {

        githubEmail =
          publicEmail;
      }
    }


    let user =
      await env.DB
        .prepare(
          `
          SELECT
            id,
            username,
            email,
            role,
            can_upload,
            discord_id,
            discord_username,
            display_name,
            avatar_url,
            github_id,
            github_username,
            github_avatar_url

          FROM users

          WHERE github_id = ?

          LIMIT 1
          `
        )
        .bind(
          githubId
        )
        .first();


    if (
      !user &&
      githubEmail
    ) {

      const emailUser =
        await env.DB
          .prepare(
            `
            SELECT
              id,
              username,
              email,
              role,
              can_upload,
              discord_id,
              discord_username,
              display_name,
              avatar_url,
              github_id,
              github_username,
              github_avatar_url

            FROM users

            WHERE LOWER(email) =
                  LOWER(?)

            LIMIT 1
            `
          )
          .bind(
            githubEmail
          )
          .first();


      if (
        emailUser
      ) {

        if (
          emailUser.github_id &&
          String(
            emailUser.github_id
          ) !==
            githubId
        ) {

          return redirectResponse(
            "/login?error=github_conflict",
            {
              "Set-Cookie":
                clearGitHubStateCookie()
            }
          );
        }


        await env.DB
          .prepare(
            `
            UPDATE users

            SET
              github_id = ?,
              github_username = ?,
              github_avatar_url = ?,
              display_name =
                CASE
                  WHEN display_name IS NULL
                    OR TRIM(display_name) = ''
                  THEN ?
                  ELSE display_name
                END,
              avatar_url =
                CASE
                  WHEN avatar_url IS NULL
                    OR TRIM(avatar_url) = ''
                  THEN ?
                  ELSE avatar_url
                END

            WHERE id = ?
            `
          )
          .bind(
            githubId,
            githubUsername,
            githubAvatarUrl,
            githubDisplayName,
            githubAvatarUrl,
            emailUser.id
          )
          .run();


        user = {
          ...emailUser,

          github_id:
            githubId,

          github_username:
            githubUsername,

          github_avatar_url:
            githubAvatarUrl,

          display_name:
            emailUser.display_name ||
            githubDisplayName,

          avatar_url:
            emailUser.avatar_url ||
            githubAvatarUrl
        };
      }
    }


    if (
      !user
    ) {

      const username =
        await createUniqueGitHubUsername(
          env,
          githubUsername,
          githubId
        );


      const email =
        githubEmail ||
        `github_${githubId}@users.ymirmods.invalid`;


      const randomPassword =
        generateSessionToken() +
        generateSessionToken();


      const passwordHash =
        await hashPassword(
          randomPassword
        );


      const insert =
        await env.DB
          .prepare(
            `
            INSERT INTO users (
              username,
              email,
              password_hash,
              role,
              can_upload,
              display_name,
              avatar_url,
              github_id,
              github_username,
              github_avatar_url
            )

            VALUES (
              ?,
              ?,
              ?,
              'member',
              1,
              ?,
              ?,
              ?,
              ?,
              ?
            )
            `
          )
          .bind(
            username,
            email,
            passwordHash,
            githubDisplayName,
            githubAvatarUrl,
            githubId,
            githubUsername,
            githubAvatarUrl
          )
          .run();


      const userId =
        insert?.meta
          ?.last_row_id;


      if (
        !userId
      ) {

        throw new Error(
          "Unable to create GitHub user."
        );
      }


      user = {
        id:
          userId,

        username:
          username,

        email:
          email,

        role:
          "member",

        can_upload:
          1,

        discord_id:
          null,

        discord_username:
          null,

        display_name:
          githubDisplayName,

        avatar_url:
          githubAvatarUrl,

        github_id:
          githubId,

        github_username:
          githubUsername,

        github_avatar_url:
          githubAvatarUrl
      };

    } else {

      await env.DB
        .prepare(
          `
          UPDATE users

          SET
            github_username = ?,
            github_avatar_url = ?,
            display_name =
              CASE
                WHEN display_name IS NULL
                  OR TRIM(display_name) = ''
                THEN ?
                ELSE display_name
              END,
            avatar_url =
              CASE
                WHEN avatar_url IS NULL
                  OR TRIM(avatar_url) = ''
                THEN ?
                ELSE avatar_url
              END

          WHERE id = ?
          `
        )
        .bind(
          githubUsername,
          githubAvatarUrl,
          githubDisplayName,
          githubAvatarUrl,
          user.id
        )
        .run();


      user.github_username =
        githubUsername;


      user.github_avatar_url =
        githubAvatarUrl;


      user.display_name =
        user.display_name ||
        githubDisplayName;


      user.avatar_url =
        user.avatar_url ||
        githubAvatarUrl;
    }


    const sessionToken =
      await createUserSession(
        env,
        user.id
      );


    const headers =
      new Headers();


    headers.set(
      "Location",
      "/dashboard"
    );


    headers.set(
      "Cache-Control",
      "no-store"
    );


    headers.append(
      "Set-Cookie",
      createSessionCookie(
        sessionToken
      )
    );


    headers.append(
      "Set-Cookie",
      clearGitHubStateCookie()
    );


    return new Response(
      null,
      {
        status:
          302,

        headers:
          headers
      }
    );

  } catch (error) {

    console.error(
      "GitHub callback error:",
      error
    );


    return redirectResponse(
      "/login?error=github_failed",
      {
        "Set-Cookie":
          clearGitHubStateCookie()
      }
    );
  }
}


/* =========================================================
   UNIQUE GITHUB USERNAME
   ========================================================= */

async function createUniqueGitHubUsername(
  env,
  githubUsername,
  githubId
) {

  let base =
    String(
      githubUsername ||
      "GitHubUser"
    )
      .trim()
      .replace(
        /[^A-Za-z0-9_-]/g,
        "_"
      )
      .replace(
        /_+/g,
        "_"
      );


  if (
    base.length <
      3
  ) {

    base =
      "GitHubUser";
  }


  base =
    base.slice(
      0,
      24
    );


  let candidate =
    base;


  let attempt =
    0;


  while (
    true
  ) {

    const existing =
      await env.DB
        .prepare(
          `
          SELECT id

          FROM users

          WHERE LOWER(username) =
                LOWER(?)

          LIMIT 1
          `
        )
        .bind(
          candidate
        )
        .first();


    if (
      !existing
    ) {

      return candidate;
    }


    attempt++;


    const suffix =
      attempt ===
        1
        ? "_" +
          githubId.slice(
            -4
          )
        : "_" +
          attempt;


    candidate =
      base.slice(
        0,
        Math.max(
          3,
          24 -
          suffix.length
        )
      ) +
      suffix;
  }
}


/* =========================================================
   DISCORD AVATAR
   ========================================================= */

function buildDiscordAvatarUrl(
  discordUser
) {

  const id =
    String(
      discordUser?.id ??
      ""
    );


  const avatar =
    String(
      discordUser?.avatar ??
      ""
    );


  if (
    !id ||
    !avatar
  ) {

    return null;
  }


  return (
    "https://cdn.discordapp.com/avatars/" +
    encodeURIComponent(
      id
    ) +
    "/" +
    encodeURIComponent(
      avatar
    ) +
    ".png?size=256"
  );
}


/* =========================================================
   UNIQUE DISCORD USERNAME
   ========================================================= */

async function createUniqueDiscordUsername(
  env,
  discordUsername,
  discordId
) {

  let base =
    String(
      discordUsername ||
      "DiscordUser"
    )
      .trim()
      .replace(
        /[^A-Za-z0-9_-]/g,
        "_"
      )
      .replace(
        /_+/g,
        "_"
      );


  if (
    base.length <
    3
  ) {

    base =
      "DiscordUser";
  }


  base =
    base.slice(
      0,
      24
    );


  let candidate =
    base;


  let attempt =
    0;


  while (
    true
  ) {

    const existing =
      await env.DB
        .prepare(
          `
          SELECT id

          FROM users

          WHERE LOWER(username) =
                LOWER(?)

          LIMIT 1
          `
        )
        .bind(
          candidate
        )
        .first();


    if (
      !existing
    ) {

      return candidate;
    }


    attempt++;


    const suffix =
      attempt ===
        1
        ? "_" +
          discordId.slice(
            -4
          )
        : "_" +
          attempt;


    candidate =
      base.slice(
        0,
        Math.max(
          3,
          24 -
          suffix.length
        )
      ) +
      suffix;
  }
}


/* =========================================================
   PUBLIC MOD LIST
   ========================================================= */

async function handlePublicMods(
  env
) {

  try {

    const result =
      await env.DB
        .prepare(
          `
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
            users.username AS author,
            users.display_name AS author_display_name,
            users.avatar_url AS author_avatar_url

          FROM mods

          LEFT JOIN users
            ON users.id =
               mods.owner_user_id

          WHERE
            mods.is_published = 1

          ORDER BY
            datetime(
              mods.updated_at
            ) DESC,
            mods.id DESC

          LIMIT 500
          `
        )
        .all();


    return jsonResponse({
      success:
        true,

      mods:
        result.results ||
        []
    });

  } catch (error) {

    console.error(
      "Public mods error:",
      error
    );


    return jsonResponse(
      {
        success:
          false,

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
      slug.length >
        100 ||
      !/^[a-z0-9-]+$/.test(
        slug
      )
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Invalid mod."
        },
        400
      );
    }


    const mod =
      await env.DB
        .prepare(
          `
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
            users.username AS author,
            users.display_name AS author_display_name,
            users.avatar_url AS author_avatar_url

          FROM mods

          LEFT JOIN users
            ON users.id =
               mods.owner_user_id

          WHERE
            mods.slug = ?
            AND
            mods.is_published = 1

          LIMIT 1
          `
        )
        .bind(
          slug
        )
        .first();


    if (
      !mod
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Mod not found."
        },
        404
      );
    }


    const versions =
      await env.DB
        .prepare(
          `
          SELECT
            id,
            version,
            file_url,
            changelog,
            file_size,
            downloads,
            created_at

          FROM mod_versions

          WHERE
            mod_id = ?

          ORDER BY
            datetime(
              created_at
            ) DESC,
            id DESC
          `
        )
        .bind(
          mod.id
        )
        .all();


    return jsonResponse({
      success:
        true,

      mod: {
        ...mod,

        versions:
          versions.results ||
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
        success:
          false,

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
      username.length >
        24 ||
      !/^[A-Za-z0-9_-]+$/.test(
        username
      )
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Invalid creator."
        },
        400
      );
    }


    const creator =
      await env.DB
        .prepare(
          `
          SELECT
            id,
            username,
            role,
            created_at,
            display_name,
            avatar_url,
            discord_username,
            github_username,
            github_avatar_url

          FROM users

          WHERE
            LOWER(username) =
            LOWER(?)

          LIMIT 1
          `
        )
        .bind(
          username
        )
        .first();


    if (
      !creator
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Creator not found."
        },
        404
      );
    }


    const result =
      await env.DB
        .prepare(
          `
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
            created_at,
            updated_at

          FROM mods

          WHERE
            owner_user_id = ?
            AND
            is_published = 1

          ORDER BY
            datetime(
              updated_at
            ) DESC,
            id DESC
          `
        )
        .bind(
          creator.id
        )
        .all();


    const mods =
      result.results ||
      [];


    return jsonResponse({
      success:
        true,

      creator: {
        id:
          creator.id,

        username:
          creator.username,

        display_name:
          creator.display_name ||
          creator.username,

        discord_username:
          creator.discord_username ||
          null,

        github_username:
          creator.github_username ||
          null,

        avatar_url:
          creator.avatar_url ||
          creator.github_avatar_url ||
          null,

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
        success:
          false,

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


    if (
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "You must be logged in."
        },
        401
      );
    }


    const result =
      await env.DB
        .prepare(
          `
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

          WHERE
            owner_user_id = ?

          ORDER BY
            datetime(
              updated_at
            ) DESC,
            id DESC
          `
        )
        .bind(
          user.id
        )
        .all();


    return jsonResponse({
      success:
        true,

      user:
        publicUser(
          user
        ),

      mod_count:
        result.results
          ?.length ??
        0,

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
        success:
          false,

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
   LEGACY REGISTER
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
          success:
            false,

          message:
            "Invalid request body."
        },
        400
      );
    }


    const username =
      String(
        body.username ??
        ""
      )
        .trim();


    const email =
      String(
        body.email ??
        ""
      )
        .trim()
        .toLowerCase();


    const password =
      String(
        body.password ??
        ""
      );


    if (
      username.length <
        3 ||
      username.length >
        24
    ) {

      return jsonResponse(
        {
          success:
            false,

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
          success:
            false,

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
          success:
            false,

          message:
            "Please enter a valid email address."
        },
        400
      );
    }


    if (
      password.length <
        10 ||
      password.length >
        128
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Password must be between 10 and 128 characters."
        },
        400
      );
    }


    const existing =
      await env.DB
        .prepare(
          `
          SELECT id

          FROM users

          WHERE
            LOWER(username) =
              LOWER(?)
            OR
            LOWER(email) =
              LOWER(?)

          LIMIT 1
          `
        )
        .bind(
          username,
          email
        )
        .first();


    if (
      existing
    ) {

      return jsonResponse(
        {
          success:
            false,

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
        .prepare(
          `
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
            1
          )
          `
        )
        .bind(
          username,
          email,
          passwordHash
        )
        .run();


    return jsonResponse(
      {
        success:
          true,

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
            true
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
        success:
          false,

        message:
          "Unable to create account."
      },
      500
    );
  }
}


/* =========================================================
   LEGACY LOGIN
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
          success:
            false,

          message:
            "Invalid request body."
        },
        400
      );
    }


    const identifier =
      String(
        body.identifier ??
        ""
      )
        .trim();


    const password =
      String(
        body.password ??
        ""
      );


    if (
      !identifier ||
      !password
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Username/email and password are required."
        },
        400
      );
    }


    const user =
      await env.DB
        .prepare(
          `
          SELECT
            id,
            username,
            email,
            password_hash,
            role,
            can_upload,
            discord_id,
            discord_username,
            display_name,
            avatar_url

          FROM users

          WHERE
            LOWER(username) =
              LOWER(?)
            OR
            LOWER(email) =
              LOWER(?)

          LIMIT 1
          `
        )
        .bind(
          identifier,
          identifier
        )
        .first();


    if (
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

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


    if (
      !validPassword
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Invalid username/email or password."
        },
        401
      );
    }


    const sessionToken =
      await createUserSession(
        env,
        user.id
      );


    return jsonResponse(
      {
        success:
          true,

        message:
          "Login successful.",

        user:
          publicUser(
            user
          )
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
        success:
          false,

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


    if (
      !user
    ) {

      return jsonResponse({
        success:
          true,

        authenticated:
          false,

        user:
          null
      });
    }


    return jsonResponse({
      success:
        true,

      authenticated:
        true,

      user:
        publicUser(
          user
        )
    });

  } catch (error) {

    console.error(
      "Current user error:",
      error
    );


    return jsonResponse(
      {
        success:
          false,

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
        .prepare(
          `
          DELETE FROM sessions

          WHERE
            token_hash = ?
          `
        )
        .bind(
          tokenHash
        )
        .run();
    }


    return jsonResponse(
      {
        success:
          true,

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
        success:
          false,

        message:
          "Unable to log out."
      },
      500
    );
  }
}


/* =========================================================
   API KEY MANAGEMENT
   ========================================================= */

async function handleListApiKeys(
  request,
  env
) {

  try {

    const user =
      await getAuthenticatedUser(
        request,
        env
      );


    if (
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "You must be logged in."
        },
        401
      );
    }


    const result =
      await env.DB
        .prepare(
          `
          SELECT
            id,
            name,
            key_prefix,
            scopes,
            created_at,
            last_used_at,
            revoked_at

          FROM api_keys

          WHERE user_id = ?

          ORDER BY
            id DESC
          `
        )
        .bind(
          user.id
        )
        .all();


    return jsonResponse({
      success:
        true,

      api_keys:
        result.results ||
        []
    });

  } catch (error) {

    console.error(
      "List API keys error:",
      error
    );


    return jsonResponse(
      {
        success:
          false,

        message:
          "Unable to load API keys."
      },
      500
    );
  }
}


async function handleGenerateApiKey(
  request,
  env
) {

  try {

    const user =
      await getAuthenticatedUser(
        request,
        env
      );


    if (
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "You must be logged in."
        },
        401
      );
    }


    let body = {};


    try {

      body =
        await request.json();

    } catch {

      body = {};
    }


    const name =
      String(
        body.name ||
        "GitHub Releases"
      )
        .trim()
        .slice(
          0,
          80
        );


    if (
      !name
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "API key name is required."
        },
        400
      );
    }


    const activeCount =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count

          FROM api_keys

          WHERE
            user_id = ?
            AND revoked_at IS NULL
          `
        )
        .bind(
          user.id
        )
        .first();


    if (
      Number(
        activeCount?.count ||
        0
      ) >= 10
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "You can have up to 10 active API keys."
        },
        400
      );
    }


    const rawKey =
      "ymir_live_" +
      generateSessionToken();


    const keyHash =
      await hashApiKey(
        rawKey
      );


    const keyPrefix =
      rawKey.slice(
        0,
        18
      );


    const scopes =
      "mods:read,mods:upload,mods:update";


    const insert =
      await env.DB
        .prepare(
          `
          INSERT INTO api_keys (
            user_id,
            name,
            key_prefix,
            key_hash,
            scopes,
            created_at
          )

          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            CURRENT_TIMESTAMP
          )
          `
        )
        .bind(
          user.id,
          name,
          keyPrefix,
          keyHash,
          scopes
        )
        .run();


    return jsonResponse(
      {
        success:
          true,

        message:
          "API key generated. Copy it now — YMIR will not show it again.",

        api_key: {
          id:
            insert?.meta
              ?.last_row_id ||
            null,

          name:
            name,

          key:
            rawKey,

          key_prefix:
            keyPrefix,

          scopes:
            scopes
        }
      },
      201
    );

  } catch (error) {

    console.error(
      "Generate API key error:",
      error
    );


    return jsonResponse(
      {
        success:
          false,

        message:
          "Unable to generate API key."
      },
      500
    );
  }
}


async function handleRevokeApiKey(
  request,
  env,
  keyId
) {

  try {

    const user =
      await getAuthenticatedUser(
        request,
        env
      );


    if (
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "You must be logged in."
        },
        401
      );
    }


    if (
      !Number.isInteger(
        keyId
      ) ||
      keyId < 1
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Invalid API key."
        },
        400
      );
    }


    const result =
      await env.DB
        .prepare(
          `
          UPDATE api_keys

          SET revoked_at =
            COALESCE(
              revoked_at,
              CURRENT_TIMESTAMP
            )

          WHERE
            id = ?
            AND user_id = ?
          `
        )
        .bind(
          keyId,
          user.id
        )
        .run();


    if (
      !result?.meta?.changes
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "API key not found."
        },
        404
      );
    }


    return jsonResponse({
      success:
        true,

      message:
        "API key revoked."
    });

  } catch (error) {

    console.error(
      "Revoke API key error:",
      error
    );


    return jsonResponse(
      {
        success:
          false,

        message:
          "Unable to revoke API key."
      },
      500
    );
  }
}


/* =========================================================
   API KEY AUTHENTICATION
   ========================================================= */

async function getApiKeyUser(
  request,
  env,
  requiredScope = null
) {

  const authorization =
    String(
      request.headers.get(
        "Authorization"
      ) ||
      ""
    )
      .trim();


  const match =
    authorization.match(
      /^Bearer\s+(.+)$/i
    );


  if (
    !match
  ) {

    return null;
  }


  const rawKey =
    match[1]
      .trim();


  if (
    !rawKey.startsWith(
      "ymir_live_"
    )
  ) {

    return null;
  }


  const keyHash =
    await hashApiKey(
      rawKey
    );


  const row =
    await env.DB
      .prepare(
        `
        SELECT
          api_keys.id AS api_key_id,
          api_keys.scopes AS api_key_scopes,

          users.id,
          users.username,
          users.email,
          users.role,
          users.can_upload,
          users.display_name,
          users.avatar_url,
          users.discord_id,
          users.discord_username,
          users.github_id,
          users.github_username,
          users.github_avatar_url

        FROM api_keys

        INNER JOIN users
          ON users.id =
             api_keys.user_id

        WHERE
          api_keys.key_hash = ?
          AND api_keys.revoked_at IS NULL

        LIMIT 1
        `
      )
      .bind(
        keyHash
      )
      .first();


  if (
    !row
  ) {

    return null;
  }


  const scopes =
    String(
      row.api_key_scopes ||
      ""
    )
      .split(",")
      .map(
        scope =>
          scope.trim()
      )
      .filter(Boolean);


  if (
    requiredScope &&
    !scopes.includes(
      requiredScope
    )
  ) {

    return null;
  }


  await env.DB
    .prepare(
      `
      UPDATE api_keys

      SET last_used_at =
        CURRENT_TIMESTAMP

      WHERE id = ?
      `
    )
    .bind(
      row.api_key_id
    )
    .run();


  return {
    ...row,

    scopes:
      scopes
  };
}


async function hashApiKey(
  rawKey
) {

  const digest =
    await crypto.subtle
      .digest(
        "SHA-256",

        new TextEncoder()
          .encode(
            rawKey
          )
      );


  return bytesToHex(
    new Uint8Array(
      digest
    )
  );
}


/* =========================================================
   CREATOR API V1
   ========================================================= */

async function handleApiV1Me(
  request,
  env
) {

  try {

    const user =
      await getApiKeyUser(
        request,
        env,
        "mods:read"
      );


    if (
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Invalid or revoked API key."
        },
        401
      );
    }


    return jsonResponse({
      success:
        true,

      user: {
        id:
          user.id,

        username:
          user.username,

        display_name:
          user.display_name ||
          user.username,

        role:
          user.role,

        can_upload:
          Boolean(
            user.can_upload
          )
      },

      scopes:
        user.scopes
    });

  } catch (error) {

    console.error(
      "API v1 me error:",
      error
    );


    return jsonResponse(
      {
        success:
          false,

        message:
          "Unable to authenticate API key."
      },
      500
    );
  }
}


async function handleApiV1PublishRelease(
  request,
  env,
  slug
) {

  let packageKey =
    null;

  let iconKey =
    null;


  try {

    const user =
      await getApiKeyUser(
        request,
        env,
        "mods:update"
      );


    if (
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Invalid API key or missing mods:update scope."
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
          success:
            false,

          message:
            "This creator does not have upload permission."
        },
        403
      );
    }


    if (
      !slug ||
      !/^[a-z0-9-]+$/.test(
        slug
      )
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Invalid mod slug."
        },
        400
      );
    }


    const mod =
      await env.DB
        .prepare(
          `
          SELECT
            id,
            owner_user_id,
            name,
            slug,
            version,
            full_description,
            icon_url

          FROM mods

          WHERE slug = ?

          LIMIT 1
          `
        )
        .bind(
          slug
        )
        .first();


    if (
      !mod
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Mod not found."
        },
        404
      );
    }


    if (
      Number(
        mod.owner_user_id
      ) !==
      Number(
        user.id
      )
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "This API key does not own that mod."
        },
        403
      );
    }


    if (
      !env.MOD_FILES
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "YMIR file storage is unavailable."
        },
        500
      );
    }


    const form =
      await request.formData();


    const version =
      String(
        form.get(
          "version"
        ) ||
        ""
      )
        .trim();


    const changelog =
      String(
        form.get(
          "changelog"
        ) ||
        ""
      )
        .trim();


    const fullDescriptionValue =
      form.get(
        "full_description"
      );


    const fullDescription =
      fullDescriptionValue ===
        null
        ? null
        : String(
            fullDescriptionValue
          );


    const modFile =
      form.get(
        "mod_file"
      );


    const iconFile =
      form.get(
        "icon_file"
      );


    if (
      !version ||
      version.length >
        32
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "A valid version is required."
        },
        400
      );
    }


    if (
      fullDescription !==
        null &&
      fullDescription.length >
        MAX_FULL_DESCRIPTION_LENGTH
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "README/full description is too long."
        },
        400
      );
    }


    if (
      changelog.length >
        MAX_CHANGELOG_LENGTH
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Changelog is too long."
        },
        400
      );
    }


    if (
      !(
        modFile instanceof
        File
      ) ||
      modFile.size ===
        0
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "mod_file ZIP is required."
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
          success:
            false,

          message:
            "Mod package is too large."
        },
        413
      );
    }


    if (
      !modFile.name
        .toLowerCase()
        .endsWith(
          ".zip"
        )
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "mod_file must be a ZIP file."
        },
        400
      );
    }


    if (
      iconFile instanceof
        File &&
      iconFile.size >
        0
    ) {

      if (
        iconFile.size >
          MAX_ICON_FILE_SIZE
      ) {

        return jsonResponse(
          {
            success:
              false,

            message:
              "Icon is too large."
          },
          413
        );
      }


      if (
        ![
          "image/png",
          "image/jpeg",
          "image/webp"
        ].includes(
          iconFile.type
        )
      ) {

        return jsonResponse(
          {
            success:
              false,

            message:
              "Icon must be PNG, JPG or WebP."
          },
          400
        );
      }
    }


    const existingVersion =
      await env.DB
        .prepare(
          `
          SELECT id

          FROM mod_versions

          WHERE
            mod_id = ?
            AND version = ?

          LIMIT 1
          `
        )
        .bind(
          mod.id,
          version
        )
        .first();


    if (
      existingVersion
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "That version already exists for this mod."
        },
        409
      );
    }


    const timestamp =
      Date.now();


    const cleanPackageName =
      sanitizeFilename(
        modFile.name
      );


    packageKey =
      `mods/${user.id}/${slug}/${version}/${timestamp}-${cleanPackageName}`;


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
            mod.name,

          version:
            version,

          source:
            "api"
        }
      }
    );


    if (
      iconFile instanceof
        File &&
      iconFile.size >
        0
    ) {

      const extension =
        getImageExtension(
          iconFile.type
        );


      iconKey =
        `mods/${user.id}/${slug}/icon-${timestamp}.${extension}`;


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
        : mod.icon_url;


    await env.DB
      .prepare(
        `
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
        `
      )
      .bind(
        mod.id,
        version,
        packageUrl,
        changelog,
        modFile.size
      )
      .run();


    await env.DB
      .prepare(
        `
        UPDATE mods

        SET
          version = ?,
          download_url = ?,
          changelog = ?,
          full_description =
            CASE
              WHEN ? IS NULL
              THEN full_description
              ELSE ?
            END,
          icon_url = ?,
          updated_at =
            CURRENT_TIMESTAMP

        WHERE
          id = ?
          AND owner_user_id = ?
        `
      )
      .bind(
        version,
        packageUrl,
        changelog,
        fullDescription,
        fullDescription,
        iconUrl,
        mod.id,
        user.id
      )
      .run();


    return jsonResponse(
      {
        success:
          true,

        message:
          "Release published to YMIR Mods.",

        mod: {
          id:
            mod.id,

          slug:
            slug,

          version:
            version,

          download_url:
            packageUrl,

          icon_url:
            iconUrl
        }
      },
      201
    );

  } catch (error) {

    console.error(
      "API release publish error:",
      error
    );


    try {

      if (
        packageKey &&
        env.MOD_FILES
      ) {

        await env.MOD_FILES.delete(
          packageKey
        );
      }


      if (
        iconKey &&
        env.MOD_FILES
      ) {

        await env.MOD_FILES.delete(
          iconKey
        );
      }

    } catch (cleanupError) {

      console.error(
        "API release cleanup error:",
        cleanupError
      );
    }


    return jsonResponse(
      {
        success:
          false,

        message:
          "Unable to publish release."
      },
      500
    );
  }
}


/* =========================================================
   MOD UPLOAD
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


    if (
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

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
          success:
            false,

          message:
            "Your account does not have upload permission."
        },
        403
      );
    }


    if (
      !env.MOD_FILES
    ) {

      return jsonResponse(
        {
          success:
            false,

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
        ) ??
        ""
      )
        .trim();


    const version =
      String(
        form.get(
          "version"
        ) ??
        ""
      )
        .trim();


    const category =
      String(
        form.get(
          "category"
        ) ??
        ""
      )
        .trim();


    const shortDescription =
      String(
        form.get(
          "short_description"
        ) ??
        ""
      )
        .trim();


    const fullDescription =
      String(
        form.get(
          "full_description"
        ) ??
        ""
      )
        .trim();


    const changelog =
      String(
        form.get(
          "changelog"
        ) ??
        ""
      )
        .trim();


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
      name.length <
        2 ||
      name.length >
        80
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Mod name must be between 2 and 80 characters."
        },
        400
      );
    }


    if (
      version.length <
        1 ||
      version.length >
        32
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Please enter a valid mod version."
        },
        400
      );
    }


    if (
      category.length <
        2 ||
      category.length >
        60
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Please select a mod category."
        },
        400
      );
    }


    if (
      shortDescription.length <
        10 ||
      shortDescription.length >
        250
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Short description must be between 10 and 250 characters."
        },
        400
      );
    }


    if (
      fullDescription.length >
        MAX_FULL_DESCRIPTION_LENGTH
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Full description / README must be 100,000 characters or less."
        },
        400
      );
    }


    if (
      changelog.length >
        MAX_CHANGELOG_LENGTH
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Changelog must be 50,000 characters or less."
        },
        400
      );
    }


    /* -----------------------------------------------------
       MOD FILE
       ----------------------------------------------------- */

    if (
      !(
        modFile instanceof
        File
      ) ||
      modFile.size ===
        0
    ) {

      return jsonResponse(
        {
          success:
            false,

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
          success:
            false,

          message:
            "Mod package is too large."
        },
        413
      );
    }


    if (
      !modFile.name
        .toLowerCase()
        .endsWith(
          ".zip"
        )
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Mod package must be a ZIP file."
        },
        400
      );
    }


    /* -----------------------------------------------------
       ICON
       ----------------------------------------------------- */

    if (
      iconFile instanceof
        File &&
      iconFile.size >
        0
    ) {

      if (
        iconFile.size >
        MAX_ICON_FILE_SIZE
      ) {

        return jsonResponse(
          {
            success:
              false,

            message:
              "Mod icon is too large."
          },
          413
        );
      }


      const allowedTypes =
        [
          "image/png",
          "image/jpeg",
          "image/webp"
        ];


      if (
        !allowedTypes.includes(
          iconFile.type
        )
      ) {

        return jsonResponse(
          {
            success:
              false,

            message:
              "Mod icon must be PNG, JPG or WebP."
          },
          400
        );
      }
    }


    /* -----------------------------------------------------
       SLUG
       ----------------------------------------------------- */

    let slug =
      createSlug(
        name
      );


    if (
      !slug
    ) {

      return jsonResponse(
        {
          success:
            false,

          message:
            "Unable to create a valid mod URL."
        },
        400
      );
    }


    const existingSlug =
      await env.DB
        .prepare(
          `
          SELECT id

          FROM mods

          WHERE slug = ?

          LIMIT 1
          `
        )
        .bind(
          slug
        )
        .first();


    if (
      existingSlug
    ) {

      slug =
        slug +
        "-" +
        Date.now()
          .toString()
          .slice(
            -6
          );
    }


    const timestamp =
      Date.now();


    const cleanPackageName =
      sanitizeFilename(
        modFile.name
      );


    packageKey =
      `mods/${user.id}/${slug}/${version}/${timestamp}-${cleanPackageName}`;


    /* -----------------------------------------------------
       UPLOAD ZIP
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
      iconFile instanceof
        File &&
      iconFile.size >
        0
    ) {

      const extension =
        getImageExtension(
          iconFile.type
        );


      iconKey =
        `mods/${user.id}/${slug}/icon-${timestamp}.${extension}`;


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

    const insert =
      await env.DB
        .prepare(
          `
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
          `
        )
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
      insert?.meta
        ?.last_row_id;


    if (
      !modId
    ) {

      throw new Error(
        "Unable to determine new mod ID."
      );
    }


    /* -----------------------------------------------------
       VERSION
       ----------------------------------------------------- */

    await env.DB
      .prepare(
        `
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
        `
      )
      .bind(
        modId,
        version,
        packageUrl,
        changelog,
        modFile.size
      )
      .run();


    return jsonResponse(
      {
        success:
          true,

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


    try {

      if (
        modId
      ) {

        await env.DB
          .prepare(
            `
            DELETE FROM mod_versions

            WHERE mod_id = ?
            `
          )
          .bind(
            modId
          )
          .run();


        await env.DB
          .prepare(
            `
            DELETE FROM mods

            WHERE id = ?
            `
          )
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
        success:
          false,

        message:
          "Unable to upload mod."
      },
      500
    );
  }
}


/* =========================================================
   R2 FILE
   ========================================================= */

async function handleStoredFile(
  request,
  env,
  url
) {

  try {

    if (
      !env.MOD_FILES
    ) {

      return new Response(
        "Storage unavailable.",
        {
          status:
            500
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
      key.includes(
        ".."
      )
    ) {

      return new Response(
        "Invalid file.",
        {
          status:
            400
        }
      );
    }


    const object =
      await env.MOD_FILES.get(
        key
      );


    if (
      !object
    ) {

      return new Response(
        "File not found.",
        {
          status:
            404
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
        headers:
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
        status:
          500
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


  if (
    !sessionToken
  ) {

    return null;
  }


  const tokenHash =
    await hashSessionToken(
      sessionToken
    );


  const now =
    Math.floor(
      Date.now() /
      1000
    );


  const user =
    await env.DB
      .prepare(
        `
        SELECT
          users.id,
          users.username,
          users.email,
          users.role,
          users.can_upload,
          users.discord_id,
          users.discord_username,
          users.display_name,
          users.avatar_url,
          users.github_id,
          users.github_username,
          users.github_avatar_url

        FROM sessions

        INNER JOIN users
          ON users.id =
             sessions.user_id

        WHERE
          sessions.token_hash = ?
          AND
          sessions.expires_at > ?

        LIMIT 1
        `
      )
      .bind(
        tokenHash,
        now
      )
      .first();


  return user ||
    null;
}


/* =========================================================
   PUBLIC USER
   ========================================================= */

function publicUser(
  user
) {

  return {
    id:
      user.id,

    username:
      user.username,

    display_name:
      user.display_name ||
      user.username,

    email:
      user.email,

    role:
      user.role,

    can_upload:
      Boolean(
        user.can_upload
      ),

    discord_linked:
      Boolean(
        user.discord_id
      ),

    discord_username:
      user.discord_username ||
      null,

    github_linked:
      Boolean(
        user.github_id
      ),

    github_username:
      user.github_username ||
      null,

    avatar_url:
      user.avatar_url ||
      user.github_avatar_url ||
      null
  };
}


/* =========================================================
   CREATE SESSION
   ========================================================= */

async function createUserSession(
  env,
  userId
) {

  const now =
    Math.floor(
      Date.now() /
      1000
    );


  await env.DB
    .prepare(
      `
      DELETE FROM sessions

      WHERE expires_at <= ?
      `
    )
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
    .prepare(
      `
      INSERT INTO sessions (
        user_id,
        token_hash,
        expires_at
      )

      VALUES (
        ?,
        ?,
        ?
      )
      `
    )
    .bind(
      userId,
      tokenHash,
      expiresAt
    )
    .run();


  return sessionToken;
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
      new Uint8Array(
        16
      )
    );


  const keyMaterial =
    await crypto.subtle
      .importKey(
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


  const derived =
    await crypto.subtle
      .deriveBits(
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
        derived
      )
    )
  ].join(
    "$"
  );
}


/* =========================================================
   PASSWORD VERIFY
   ========================================================= */

async function verifyPassword(
  password,
  storedHash
) {

  try {

    const parts =
      String(
        storedHash
      )
        .split(
          "$"
        );


    if (
      parts.length !==
      4
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


    const expected =
      base64ToBytes(
        parts[3]
      );


    if (
      algorithm !==
        "pbkdf2_sha256" ||
      !Number.isInteger(
        iterations
      ) ||
      iterations <
        1 ||
      iterations >
        PBKDF2_ITERATIONS
    ) {

      return false;
    }


    const encoder =
      new TextEncoder();


    const keyMaterial =
      await crypto.subtle
        .importKey(
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


    const derived =
      await crypto.subtle
        .deriveBits(
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

          expected.length *
          8
        );


    return constantTimeEqual(
      new Uint8Array(
        derived
      ),

      expected
    );

  } catch {

    return false;
  }
}


/* =========================================================
   SESSION TOKEN
   ========================================================= */

function generateSessionToken() {

  return bytesToBase64Url(
    crypto.getRandomValues(
      new Uint8Array(
        32
      )
    )
  );
}


async function hashSessionToken(
  token
) {

  const digest =
    await crypto.subtle
      .digest(
        "SHA-256",

        new TextEncoder()
          .encode(
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
   SESSION COOKIE
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
  ].join(
    "; "
  );
}


function clearSessionCookie() {

  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0"
  ].join(
    "; "
  );
}


/* =========================================================
   DISCORD STATE COOKIE
   ========================================================= */

function createDiscordStateCookie(
  state
) {

  return [
    `${DISCORD_STATE_COOKIE_NAME}=${state}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${DISCORD_STATE_LENGTH_SECONDS}`
  ].join(
    "; "
  );
}


function clearDiscordStateCookie() {

  return [
    `${DISCORD_STATE_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0"
  ].join(
    "; "
  );
}


/* =========================================================
   GITHUB STATE COOKIE
   ========================================================= */

function createGitHubStateCookie(
  state
) {

  return [
    `${GITHUB_STATE_COOKIE_NAME}=${state}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${GITHUB_STATE_LENGTH_SECONDS}`
  ].join(
    "; "
  );
}


function clearGitHubStateCookie() {

  return [
    `${GITHUB_STATE_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0"
  ].join(
    "; "
  );
}


/* =========================================================
   GET COOKIE
   ========================================================= */

function getCookie(
  request,
  name
) {

  const header =
    request.headers.get(
      "Cookie"
    );


  if (
    !header
  ) {

    return null;
  }


  const cookies =
    header.split(
      ";"
    );


  for (
    const cookie of
      cookies
  ) {

    const separator =
      cookie.indexOf(
        "="
      );


    if (
      separator ===
      -1
    ) {

      continue;
    }


    const cookieName =
      cookie
        .slice(
          0,
          separator
        )
        .trim();


    const cookieValue =
      cookie
        .slice(
          separator +
          1
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
   REDIRECT
   ========================================================= */

function redirectResponse(
  location,
  extraHeaders = {}
) {

  const headers =
    new Headers({
      "Location":
        location,

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

    headers.append(
      key,
      value
    );
  }


  return new Response(
    null,
    {
      status:
        302,

      headers:
        headers
    }
  );
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
   ENCODING
   ========================================================= */

function bytesToBase64(
  bytes
) {

  let binary =
    "";


  for (
    let i = 0;
    i <
    bytes.length;
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
    i <
    binary.length;
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

  return Array.from(
    bytes
  )
    .map(
      byte =>
        byte
          .toString(
            16
          )
          .padStart(
            2,
            "0"
          )
    )
    .join(
      ""
    );
}


/* =========================================================
   CONSTANT TIME COMPARE
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
    i <
    first.length;
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
