export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import ClientReportPage from "@/components/Clients/Report/ClientReportPage";
import { getCurrentSession } from "@/lib/auth/session";

export default async function ClientsReport() {
  const session = await getCurrentSession();
  if (!session.user || !session.session) return redirect("/auth/signin");
  if (!session.user.permissoes.clientes.visualizar) return redirect("/clientes");
  return <ClientReportPage />;
}
