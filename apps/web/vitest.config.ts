import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
	// biome-ignore lint/suspicious/noExplicitAny: vite/vitest Plugin type mismatch
	plugins: [tsconfigPaths() as any],
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
