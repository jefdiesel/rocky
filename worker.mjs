// Cloudflare Worker entry: runs the existing Express app via cloudflare:node.
// Static client (client/dist) is served by Workers assets; /api/* and /health hit this Worker.
import { httpServerHandler } from "cloudflare:node";
import app from "./server/src/index.js";

app.listen(3001);
export default httpServerHandler({ port: 3001 });
