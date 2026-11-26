type PageHeaderProps = { title: string; description?: string };

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description !== undefined && <p className="text-muted">{description}</p>}
    </header>
  );
}
