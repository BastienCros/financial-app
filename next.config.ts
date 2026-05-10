import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Import .sql files as raw strings (used for Drizzle migrations).
    // Turbopack's built-in 'raw' module type handles this without an external loader.
    // turbopack: {
    //     rules: {
    //         "*.sql": {
    //             type: "raw",
    //         },
    //     },
    // },
    turbopack: {
        rules: {
            "*.sql": {
                // TODO built-in Turbopack raw loader have issue with parsing raw module - so use external 'raw-loader'
                // Issue analyse ongoing - when resolved revert to use built-in module
                // type: "raw",
                loaders: ["raw-loader"],
                as: "*.js",
            },
        },
    },

    async headers() {
        return [
            {
                source: "/:path*", // apply to all routes
                headers: [
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "same-origin",
                    },
                    {
                        key: "Cross-Origin-Embedder-Policy",
                        value: "require-corp",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
