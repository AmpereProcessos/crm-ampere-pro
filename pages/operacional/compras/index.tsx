import PurchaseCard from "@/components/Cards/PurchaseCard";
import ControlPurchase from "@/components/Modals/Purchase/ControlPurchase";
import PurchasesPage from "@/components/Purchases/PurchasesPage";
import { Sidebar } from "@/components/Sidebar";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import LoadingPage from "@/components/utils/LoadingPage";
import { usePurchases } from "@/utils/queries/purchases";
import React, { useState } from "react";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { useSession } from "@/app/providers/SessionProvider";

function PurchasesMainPage() {
	const { session, status } = useSession({ required: true });
	if (status !== "authenticated") return <LoadingPage />;
	return <PurchasesPage session={session} />;
}

export default PurchasesMainPage;
