// Cloudflare Worker entry: runs the existing Express app via cloudflare:node.
// Static client (client/dist) is served by Workers assets; /api/* and /health hit this Worker.
// The app is loaded lazily on the first request because its module init starts timers
// (express-rate-limit), which Workers does not allow at global scope.
import { httpServerHandler } from "cloudflare:node";

const PORT = 3001;
let handler;

export default {
  async fetch(request, env, ctx) {
    if (!handler) {
      const { default: app } = await import("./server/src/index.js");
      app.listen(PORT);
      handler = httpServerHandler({ port: PORT });
    }
    return handler.fetch(request, env, ctx);
  },
};
