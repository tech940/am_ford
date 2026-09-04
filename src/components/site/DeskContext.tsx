import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Vehicle } from "@/lib/vehicles";

/**
 * What the desk is currently looking at.
 *
 * 26 of 27 routes have no vehicle to attach, and the lead dialog requires one. Rather than
 * degrade into a fifth general contact form on those pages, the desk changes what it offers by
 * context: a vehicle page publishes its vehicle, a model page publishes its model name, and
 * everywhere else the desk routes to the pages that already do the job.
 *
 * Published from an effect rather than during render: this sets state owned by a parent
 * provider, and doing that in a child's render body is what React warns about. The tab's
 * status line is server-rendered regardless, and the subject only changes panel contents,
 * which sit behind a click.
 */
type DeskSubject = { kind: "vehicle"; vehicle: Vehicle } | { kind: "model"; model: string } | null;

const DeskContext = createContext<{
  subject: DeskSubject;
  setSubject: (s: DeskSubject) => void;
}>({ subject: null, setSubject: () => {} });

export function DeskProvider({ children }: { children: ReactNode }) {
  const [subject, setSubject] = useState<DeskSubject>(null);
  const value = useMemo(() => ({ subject, setSubject }), [subject]);
  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export function useDesk() {
  return useContext(DeskContext);
}

/**
 * Declarative publisher. A page renders `<DeskSubject vehicle={v} />` and the desk picks it up.
 * Rendering null keeps it out of the layout entirely.
 */
export function PublishDeskSubject({ vehicle, model }: { vehicle?: Vehicle; model?: string }) {
  const { setSubject } = useDesk();
  const id = vehicle ? `v:${vehicle.id}` : model ? `m:${model}` : "none";

  useEffect(() => {
    setSubject(vehicle ? { kind: "vehicle", vehicle } : model ? { kind: "model", model } : null);
    return () => setSubject(null);
    // `id` collapses the two inputs into one primitive so a new object identity per render
    // cannot retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
