import type { NavItem } from './nav-item';
import { NavLink } from './nav-link';

type SidebarNavProps = { items: readonly NavItem[] };

/** O ícone é renderizado aqui, no servidor, porque componentes não atravessam para o cliente. */
export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <nav aria-label="Principal" className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map(({ href, label, icon: Icon }) => (
        <NavLink
          key={href}
          href={href}
          label={label}
          icon={<Icon className="size-4" aria-hidden />}
        />
      ))}
    </nav>
  );
}
