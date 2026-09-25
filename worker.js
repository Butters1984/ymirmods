export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/test") {
      try {
        const result = await env.DB
          .prepare("SELECT COUNT(*) AS count FROM users")
          .first();

        return Response.json({
          success: true,
          message: "YMIR Mods backend is running",
          database: "connected",
          users: result.count
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            message: "Backend is running, but database connection failed",
            error: error.message
          },
          {
            status: 500
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
