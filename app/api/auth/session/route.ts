import { getCurrentSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getCurrentSession();

		return NextResponse.json({
			success: true,
			session: session.session,
			user: session.user,
		});
	} catch (error) {
		console.error("Error validating session:", error);
		return NextResponse.json(
			{
				success: false,
				session: null,
				user: null,
			},
			{ status: 401 },
		);
	}
}
