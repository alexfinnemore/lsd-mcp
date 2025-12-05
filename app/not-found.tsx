export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>404 - Not Found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <p>
        <a href="/">Go back home</a>
      </p>
    </main>
  );
}
