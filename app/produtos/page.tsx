import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import ProductsPage from "./products-page";

export default async function Products() {
	const session = await getCurrentSession();
	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	return <ProductsPage session={session} />;
}
