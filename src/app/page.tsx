export default function PageHome() {
  return (
    <main className="h-screen text-neutral-800 flex flex-col items-center gap-2 justify-center bg-neutral-100">
      <h1 className="text-5xl font-semibold">
        Template <span className="font-bold">next.js</span>
      </h1>
      <p className="text-lg text-neutral-600">
        Created by{' '}
        <a
          href="https://github.com/MatheusPalmieri"
          target="_blank"
          className="text-neutral-700 hover:text-neutral-800 active:text-neutral-900 transition-colors duration-300"
        >
          @matheuspalmieri
        </a>
      </p>
    </main>
  );
}
