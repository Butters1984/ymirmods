export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test API route
    if (url.pathname === "/api/test") {
      return Response.json({
        success: true,
        message: "YMIR Mods backend is running"
      });
    }

    // Everything else continues to use the normal website files
    return env.ASSETS.fetch(request);
  }
};
