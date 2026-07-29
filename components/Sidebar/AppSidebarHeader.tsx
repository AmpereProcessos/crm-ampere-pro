import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import Link from "next/link";

type AppSidebarHeaderProps = {
  partner: {
    nome: string;
    logo_url?: string | null;
  };
};

export default function AppSidebarHeader({ partner }: AppSidebarHeaderProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          asChild
          className="group-data-[collapsible=icon]:justify-center bg-[#15599a] text-white"
        >
          <Link href="/">
            <Avatar className="size-8 shrink-0 rounded-lg ">
              <AvatarImage
                src={partner.logo_url ?? undefined}
                alt={partner.nome}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg text-xs font-semibold">
                {formatNameAsInitials(partner.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{partner.nome}</span>
              <span className="truncate text-xs">CRM Ampère</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
