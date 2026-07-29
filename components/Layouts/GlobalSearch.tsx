'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { TUserSession } from '@/lib/auth/session';
import { cn } from '@/lib/utils';
import { useGlobalSearch } from '@/utils/queries/global-search';
import type { TGlobalSearchEntity, TGlobalSearchResultItem } from '@/utils/schemas/global-search.schema';
import {
  Boxes,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderKanban,
  FolderOpen,
  Gauge,
  LoaderCircle,
  Search,
  Settings,
  UsersRound,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ElementType } from 'react';

type PermissionKey = keyof Pick<
  TUserSession['user']['permissoes'],
  'clientes' | 'oportunidades' | 'propostas' | 'projetos' | 'analisesTecnicas' | 'homologacoes'
>;

type EntityConfig = {
  label: string;
  groupLabel: string;
  icon: ElementType;
  permission: PermissionKey;
  accent: string;
};

const ENTITY_CONFIG: Record<TGlobalSearchEntity, EntityConfig> = {
  clients: {
    label: 'Clientes',
    groupLabel: 'Clientes',
    icon: UsersRound,
    permission: 'clientes',
    accent: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300',
  },
  opportunities: {
    label: 'Oportunidades',
    groupLabel: 'Oportunidades',
    icon: FolderKanban,
    permission: 'oportunidades',
    accent: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  },
  proposals: {
    label: 'Propostas',
    groupLabel: 'Propostas comerciais',
    icon: FileText,
    permission: 'propostas',
    accent: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300',
  },
  projects: {
    label: 'Projetos',
    groupLabel: 'Projetos operacionais',
    icon: FolderOpen,
    permission: 'projetos',
    accent: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  technicalAnalysis: {
    label: 'Análises',
    groupLabel: 'Análises técnicas',
    icon: ClipboardCheck,
    permission: 'analisesTecnicas',
    accent: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-300',
  },
  homologations: {
    label: 'Homologações',
    groupLabel: 'Homologações',
    icon: Wrench,
    permission: 'homologacoes',
    accent: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
  },
};

const QUICK_NAVIGATION = [
  { label: 'Dashboard', href: '/', icon: Gauge },
  { label: 'Oportunidades', href: '/comercial/oportunidades', icon: FolderKanban },
  { label: 'Clientes', href: '/clientes', icon: UsersRound },
  { label: 'Projetos', href: '/operacional/projetos', icon: FolderOpen },
  { label: 'Análises técnicas', href: '/operacional/analises-tecnicas', icon: ClipboardCheck },
  { label: 'Kits', href: '/kits', icon: Boxes },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
] as const;

export default function GlobalSearch({ session }: { session: TUserSession }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeEntities, setActiveEntities] = useState<TGlobalSearchEntity[]>([]);
  const router = useRouter();
  const availableEntities = useMemo(
    () =>
      (Object.keys(ENTITY_CONFIG) as TGlobalSearchEntity[]).filter((entity) => {
        const permission = ENTITY_CONFIG[entity].permission;
        return session.user.permissoes[permission].visualizar;
      }),
    [session.user.permissoes]
  );
  const { data, isLoading, isFetching, isError, shouldSearch, debouncedSearch } = useGlobalSearch({ open, search, entities: activeEntities });
  const hasMinimumInput = search.trim().length >= 2;
  const isWaitingForDebounce = open && hasMinimumInput && debouncedSearch !== search.trim();
  const hasResults = data ? Object.values(data.results).some((items) => items.length > 0) : false;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setActiveEntities([]);
    }
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );
  const toggleEntity = useCallback((entity: TGlobalSearchEntity) => {
    setActiveEntities((current) => (current.includes(entity) ? current.filter((item) => item !== entity) : [...current, entity]));
  }, []);

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => setOpen(true)}
        aria-label='Abrir busca global'
        aria-keyshortcuts='Control+K Meta+K'
        className='group h-9 shrink-0 gap-2 border-border/80 bg-background/80 px-2.5 text-muted-foreground shadow-xs backdrop-blur-sm hover:border-primary/35 hover:bg-primary/5 hover:text-foreground sm:min-w-52 sm:justify-start'
      >
        <Search className='size-4 text-primary/80' />
        <span className='hidden flex-1 text-left text-xs sm:inline'>Buscar no sistema</span>
        <kbd className='hidden h-5 items-center rounded border border-border bg-muted/70 px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex'>
          Ctrl K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='top-[12vh] block max-h-[78vh] w-[calc(100%_-_1rem)] max-w-2xl translate-y-0 overflow-hidden border-border/80 bg-background/98 p-0 shadow-2xl sm:rounded-2xl'>
          <DialogTitle className='sr-only'>Busca global</DialogTitle>
          <DialogDescription className='sr-only'>Busque clientes, oportunidades, propostas e registros operacionais.</DialogDescription>
          <Command shouldFilter={!hasMinimumInput} className='rounded-none bg-transparent'>
            <div className='border-b border-border/70 bg-muted/20 px-1 pt-1'>
              <CommandInput placeholder='Busque por nome, documento, telefone ou código...' value={search} onValueChange={setSearch} />
              <div className='flex gap-1.5 overflow-x-auto px-2 pb-3 pt-2'>
                {availableEntities.map((entity) => {
                  const config = ENTITY_CONFIG[entity];
                  const Icon = config.icon;
                  const active = activeEntities.includes(entity);
                  return (
                    <button
                      type='button'
                      key={entity}
                      onClick={() => toggleEntity(entity)}
                      aria-pressed={active}
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                        active ? config.accent : 'border-border/80 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      )}
                    >
                      <Icon className='size-3.5' />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <CommandList className='max-h-[52vh] min-h-72 px-1 py-2'>
              {!hasMinimumInput ? <QuickNavigation navigate={navigate} /> : null}
              {isWaitingForDebounce || (isLoading && shouldSearch) ? <SearchStatus label='Buscando em toda a operação...' /> : null}
              {isError && shouldSearch && !isWaitingForDebounce ? (
                <div className='mx-2 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-6 text-center'>
                  <p className='text-sm font-medium text-destructive'>Não foi possível concluir a busca.</p>
                  <p className='mt-1 text-xs text-muted-foreground'>Tente novamente em alguns instantes.</p>
                </div>
              ) : null}
              {shouldSearch && !isLoading && !isWaitingForDebounce && !isError && !hasResults ? (
                <CommandEmpty>Nenhum registro encontrado para “{debouncedSearch}”.</CommandEmpty>
              ) : null}
              {shouldSearch && data && !isWaitingForDebounce ? <SearchResults results={data.results} navigate={navigate} /> : null}
            </CommandList>

            <div className='flex items-center justify-between border-t border-border/70 bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground'>
              <span>{isFetching && !isLoading ? 'Atualizando resultados...' : 'Busca protegida pelo seu escopo de acesso'}</span>
              <span className='hidden items-center gap-2 sm:flex'>
                <kbd className='rounded border bg-background px-1.5 py-0.5 font-mono'>↑↓</kbd> navegar
                <kbd className='rounded border bg-background px-1.5 py-0.5 font-mono'>Enter</kbd> abrir
              </span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

function QuickNavigation({ navigate }: { navigate: (href: string) => void }) {
  return (
    <>
      <div className='px-3 pb-2 pt-1'>
        <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70'>Mesa de operações</p>
        <p className='mt-1 text-xs text-muted-foreground'>Digite ao menos dois caracteres ou use um atalho de navegação.</p>
      </div>
      <CommandGroup heading='Navegação rápida'>
        {QUICK_NAVIGATION.map((item) => {
          const Icon = item.icon;
          return (
            <CommandItem key={item.href} value={item.label} onSelect={() => navigate(item.href)} className='group/item gap-3 py-2.5'>
              <span className='grid size-8 place-items-center rounded-lg border border-border/70 bg-muted/45 text-muted-foreground group-data-[selected=true]/item:border-primary/20 group-data-[selected=true]/item:bg-primary/10 group-data-[selected=true]/item:text-primary'>
                <Icon className='size-4' />
              </span>
              <span>{item.label}</span>
              <ChevronRight className='ml-auto size-4 text-muted-foreground/50' />
            </CommandItem>
          );
        })}
      </CommandGroup>
    </>
  );
}

function SearchResults({ results, navigate }: { results: Record<TGlobalSearchEntity, TGlobalSearchResultItem[]>; navigate: (href: string) => void }) {
  return (Object.entries(results) as [TGlobalSearchEntity, TGlobalSearchResultItem[]][]).map(([entity, items]) => {
    if (items.length === 0) return null;
    const config = ENTITY_CONFIG[entity];
    const Icon = config.icon;
    return (
      <CommandGroup key={entity} heading={`${config.groupLabel} · ${items.length}`}>
        {items.map((item) => (
          <CommandItem
            key={`${entity}-${item.id}`}
            value={`${entity}-${item.id}-${item.label}-${item.description ?? ''}`}
            onSelect={() => navigate(item.href)}
            className='group/item gap-3 py-2.5'
          >
            <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl border', config.accent)}>
              <Icon className='size-4' />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-sm font-semibold text-foreground'>{item.label}</span>
              {item.description ? <span className='mt-0.5 block truncate text-xs font-normal text-muted-foreground'>{item.description}</span> : null}
            </span>
            <ChevronRight className='size-4 shrink-0 text-muted-foreground/40 transition-transform group-data-[selected=true]/item:translate-x-0.5 group-data-[selected=true]/item:text-primary' />
          </CommandItem>
        ))}
      </CommandGroup>
    );
  });
}

function SearchStatus({ label }: { label: string }) {
  return (
    <div className='flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground'>
      <span className='grid size-10 place-items-center rounded-full border border-primary/15 bg-primary/5 text-primary'>
        <LoaderCircle className='size-5 animate-spin' />
      </span>
      <p className='text-xs font-medium'>{label}</p>
    </div>
  );
}
