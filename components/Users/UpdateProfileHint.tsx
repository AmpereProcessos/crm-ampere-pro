"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TUserSession } from "@/lib/auth/session";
import { XIcon } from "lucide-react";
import { useState } from "react";
import EditUserProfile from "../Modals/User/EditProfile";

interface UpdateProfileHintProps {
	required: boolean;
	session: TUserSession;
}

const UpdateProfileHint = ({ required, session }: UpdateProfileHintProps) => {
	const [updateProfileModalOpen, setUpdateProfileModalOpen] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);
	const isOpen = required && !isDismissed;

	if (!required) {
		return null;
	}

	const handleDismiss = () => {
		setIsDismissed(true);
	};

	const handleUpdateProfile = () => {
		setUpdateProfileModalOpen(true);
	};

	return (
		<div className="fixed bottom-6 right-6 z-50">
			<Popover open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
				<PopoverTrigger asChild>
					<div className="w-0 h-0" aria-hidden="true" />
				</PopoverTrigger>
				<PopoverContent className="w-80 p-5 relative flex flex-col" align="end" side="top" sideOffset={10}>
					<button
						type="button"
						onClick={handleDismiss}
						className="absolute top-3 right-3 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						aria-label="Dismiss update profile hint"
					>
						<XIcon className="h-4 w-4" />
					</button>
					<div className="w-full flex flex-col">
						<h4 className="font-semibold text-lg mb-2 text-start">Complete seu perfil</h4>
						<p className="text-sm text-muted-foreground mb-4">Mantenha suas informações atualizadas para uma melhor experiência no sistema.</p>
					</div>

					<Button type="button" onClick={handleUpdateProfile} className="w-full" size="sm">
						ATUALIZAR PERFIL
					</Button>
				</PopoverContent>
			</Popover>

			{updateProfileModalOpen && (
				<EditUserProfile closeModal={() => setUpdateProfileModalOpen(false)} userId={session.user.id} partnerId={session.user.idParceiro} session={session} />
			)}
		</div>
	);
};

export default UpdateProfileHint;
