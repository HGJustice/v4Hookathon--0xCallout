/**
 * Page backdrop, fixed behind all content: soft light in the brand colours on the dark
 * background. Styles live in globals.css (`.page-glow`).
 */
export default function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-background">
      <div className="page-glow absolute inset-0" />
    </div>
  );
}
