/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import path from "path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

// Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Config.setLambdaMemory(2048);
// Config.setLambdaTimeout(120);

Config.overrideWebpackConfig((currentConfiguration) => {
    const withTailwind = enableTailwind(currentConfiguration);
    return {
        ...withTailwind,
        resolve: {
            ...withTailwind.resolve,
            alias: {
                ...(withTailwind.resolve?.alias ?? {}),
                "@": path.resolve(process.cwd(), "src"),
            },
        },
    };
});

