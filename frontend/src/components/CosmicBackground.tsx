/**
 * Full-screen deep-space backdrop, fixed behind all page content: nebula light plus two
 * star layers (the near one twinkles). Styles live in globals.css (`.cosmos-*`).
 */
export default function CosmicBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-background">
      <div className="cosmos-nebula absolute inset-0" />
      <div className="cosmos-stars-far absolute inset-0" />
      <div className="cosmos-stars-near absolute inset-0" />
    </div>
  );
}
