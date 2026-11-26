import { Dumbbell } from 'lucide-react';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-24">
      <div className="flex items-center gap-3">
        <Dumbbell className="size-8 text-primary" aria-hidden />
        <h1 className="text-3xl font-semibold tracking-tight">gymflow</h1>
      </div>
      <p className="max-w-md text-lg text-muted">
        Gestão de academias: planos, fichas de treino, aulas coletivas e frequência.
      </p>
      <section className="flex flex-col gap-4 rounded-xl border bg-surface p-6">
        <h2 className="font-medium">Prévia do tema</h2>
        <p className="text-sm text-muted">Texto secundário sobre card.</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-success">Matrícula ativa</span>
          <span className="text-danger">Mensalidade em atraso</span>
        </div>
        <button
          type="button"
          className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Contratar plano
        </button>
      </section>
    </main>
  );
}
