/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Output defaults for `npx remotion render`: H.264 MP4, good quality.
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");

// Remotion normally downloads its own Chrome Headless Shell automatically.
// In restricted/offline environments, point it at an existing Chromium instead:
//   REMOTION_BROWSER_EXECUTABLE=/path/to/chrome npx remotion render
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
