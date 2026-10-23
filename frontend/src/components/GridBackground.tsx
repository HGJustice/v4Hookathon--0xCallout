/**
 * Full-screen square mesh backdrop, fixed behind all page content.
 * Styling lives in the `.grid-mesh` class in globals.css; tweak
 * --grid-cell, --grid-line and --grid-dot there to change the look.
 */
export default function GridBackground() {
  return (
    <div
      aria-hidden="true"
      className="grid-mesh pointer-events-none fixed inset-0 -z-10"
    />
  );
}
