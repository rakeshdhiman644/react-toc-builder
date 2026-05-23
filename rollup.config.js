import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

/**
 * Fix #11: Custom Rollup plugin that prepends the "use client" directive to
 * every output chunk. This is necessary because Rollup treats bare string
 * expressions at the top of a module as dead code and strips them during
 * bundling. The plugin re-adds the directive as a banner so Next.js App Router
 * correctly identifies the bundle as a Client Component.
 */
const preserveUseClient = {
  name: "preserve-use-client",
  renderChunk(code) {
    return { code: `"use client";\n${code}`, map: null };
  },
};

export default {
  input: "src/index.js",
  output: [
    { file: "dist/index.cjs.js", format: "cjs", sourcemap: true },
    { file: "dist/index.esm.js", format: "esm", sourcemap: true },
  ],
  external: ["react", "react-dom"],
  plugins: [
    resolve({ extensions: [".js", ".jsx"] }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: ["@babel/preset-env", "@babel/preset-react"],
    }),
    preserveUseClient,
  ],
};
