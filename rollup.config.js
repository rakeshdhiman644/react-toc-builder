import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

export default {
  input: "src/index.js",
  output: [
    { file: "dist/index.cjs.js", format: "cjs", sourcemap: true },
    { file: "dist/index.esm.js", format: "esm", sourcemap: true }
  ],
  external: ["react", "react-dom"],
  plugins: [
    resolve({ extensions: [".js", ".jsx"] }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: ["@babel/preset-env", "@babel/preset-react"]
    })
  ]
};