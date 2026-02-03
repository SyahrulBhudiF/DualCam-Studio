import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		env: loadEnv(mode, process.cwd(), ""),
		include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
		exclude: ["node_modules", "dist"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules",
				"dist",
				"tests",
				"**/*.d.ts",
				"**/*.test.ts",
				"**/*.spec.ts",
			],
		},
	},
}));
