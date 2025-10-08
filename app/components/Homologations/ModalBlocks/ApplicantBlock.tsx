import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { useUsers } from "@/utils/queries/users";
import type { THomologation } from "@/utils/schemas/homologation.schema";
import { UserRound } from "lucide-react";
import type React from "react";
import { useState } from "react";
import SelectWithImages from "../../../../components/Inputs/SelectWithImages";

type ApplicantBlockProps = {
	infoHolder: THomologation;
	setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
};
function ApplicantBlock({ infoHolder, setInfoHolder }: ApplicantBlockProps) {
	const { data: users, isLoading, isError, isSuccess } = useUsers();
	function handleSelect(selected: string) {
		const equivalentUser = users?.find((u) => u._id === selected);
		if (!equivalentUser) return;
		setInfoHolder((prev) => ({
			...prev,
			requerente: {
				id: equivalentUser._id,
				nome: equivalentUser.nome,
				apelido: equivalentUser.nome,
				contato: equivalentUser.telefone || "",
				avatar_url: equivalentUser.avatar_url,
			},
		}));
	}

	return (
		<ResponsiveDialogDrawerSection
			sectionTitleText="REQUERENTE"
			sectionTitleIcon={<UserRound className="w-4 h-4 min-w-4 min-h-4" />}
		>
			<div className="flex w-full items-center justify-center">
				<SelectWithImages
					label={"REQUERENTE"}
					editable={true}
					showLabel={false}
					value={infoHolder.requerente.id}
					options={
						users?.map((resp) => ({
							id: resp._id,
							label: resp.nome,
							value: resp._id,
							url: resp.avatar_url || undefined,
							fallback: formatNameAsInitials(resp.nome),
						})) || []
					}
					handleChange={(value) => handleSelect(value)}
					onReset={() =>
						setInfoHolder((prev) => ({
							...prev,
							requerente: {
								id: "",
								nome: "",
								apelido: "",
								contato: "",
								avatar_url: "",
							},
						}))
					}
					resetOptionLabel={"USUÁRIO NÃO DEFINIDO"}
				/>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}

export default ApplicantBlock;
