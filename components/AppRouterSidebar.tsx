"use client";

import type { ComponentType } from "react";
import { ChevronRight } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import AmpereBlueLogo from "@/utils/images/ampere-logo-azul.png";
import type { TUserSession } from "@/lib/auth/session";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { BiStats } from "react-icons/bi";
import { BsBookmarksFill, BsCart, BsFillFunnelFill } from "react-icons/bs";
import { FaTag, FaUser } from "react-icons/fa";
import { MdOutlineMiscellaneousServices } from "react-icons/md";
import type { IconType } from "react-icons";
import { renderIcon } from "@/lib/methods/rendering";
import { Inbox } from "@novu/nextjs";
import { NOVU_APPLICATION_IDENTIFIER } from "@/services/novu/config";

type AppRouterSidebarProps = {
	session: TUserSession;
};
export function AppRouterSidebar({ session, ...props }: AppRouterSidebarProps) {
	const principalItems = [
		{
			title: "Dashboard",
			url: "/",
			icon: BiStats,
			isActive: false,
		},
		{
			title: "Oportunidades",
			url: "/comercial/oportunidades",
			icon: BsFillFunnelFill,
			isActive: false,
		},
		{
			title: "Clientes",
			url: "/clientes",
			icon: FaUser,
			isActive: false,
		},
	];
	const compositionItems = [
		{
			title: "Kits",
			url: "/kits",
			icon: FaTag,
		},
		{
			title: "Planos de assinatura",
			url: "/planos",
			icon: BsBookmarksFill,
		},
		{
			title: "Produtos",
			url: "/produtos",
			icon: BsCart,
		},
		{
			title: "Serviços",
			url: "/servicos",
			icon: MdOutlineMiscellaneousServices,
		},
	];
	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className="relative h-[37px] w-[37px]">
					<Image src={AmpereBlueLogo} alt="LOGO" title="LOGO" fill={true} />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={principalItems} />
				<NavComposition items={compositionItems} />
			</SidebarContent>
			<SidebarFooter>
				<Inbox applicationIdentifier={NOVU_APPLICATION_IDENTIFIER} subscriber={session.user.id} />
				<NavUser user={session.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

type NavUserProps = {
	user: TUserSession["user"];
};
function NavUser({ user }: NavUserProps) {
	return (
		<div className="flex w-full items-center justify-center">
			<Link href={`/auth/perfil?id=${user.id}`}>
				<Avatar className="w-6 h-6 rounded-lg">
					<AvatarImage src={user.avatar_url || undefined} />
					<AvatarFallback>{formatNameAsInitials(user.nome)}</AvatarFallback>
				</Avatar>
			</Link>
		</div>
	);
}

type NavMainProps = {
	items: {
		title: string;
		url: string;
		icon: ComponentType | IconType;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
};
function NavMain({ items }: NavMainProps) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>PRINCIPAL</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={item.isActive}>
								<a href={item.url}>{item.title}</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

type NavCompositionProps = {
	items: {
		title: string;
		url: string;
		icon: ComponentType | IconType;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
};
function NavComposition({ items }: NavCompositionProps) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>COMPOSIÇÕES</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={item.isActive}>
								<a href={item.url}>{item.title}</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
