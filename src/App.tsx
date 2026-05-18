import { Button } from '@/components/ui/button';

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-amber-50 p-8 text-center">
      <div className="text-7xl" aria-hidden>
        🥋
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-stone-800">
        Fraction Dojo
      </h1>
      <p className="max-w-md text-lg text-stone-600">
        Learn fraction equivalence — one karate chop at a time.
      </p>
      <Button disabled>Begin Training (coming soon)</Button>
      <p className="text-sm text-stone-400">PR 1 · project scaffold</p>
    </main>
  );
}

export default App;
