// Stand-in for optional dependencies we never load at runtime (see next.config.ts).
// CommonJS so named imports from it resolve to undefined instead of failing the build.
module.exports = {};
