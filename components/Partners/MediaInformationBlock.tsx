import { TPartner } from "@/utils/schemas/partner.schema";
import React from "react";
import TextInput from "../Inputs/TextInput";

type MediaInformationBlockProps = {
	infoHolder: TPartner;
	setInfoHolder: React.Dispatch<React.SetStateAction<TPartner>>;
};
function MediaInformationBlock({ infoHolder, setInfoHolder }: MediaInformationBlockProps) {
	return (
		<div className="flex w-full flex-col gap-2">
			<h1 className="w-full rounded-sm bg-[#fead41] p-1 text-center text-sm font-bold text-primary-foreground">MÍDIAS</h1>
			<div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="WEBSITE (LINK)"
						value={infoHolder.midias.website || ""}
						placeholder="Preencha aqui endereço do seu website."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								midias: {
									...prev.midias,
									website: value,
								},
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="INSTAGRAM"
						value={infoHolder.midias.instagram || ""}
						placeholder="Preencha aqui o seu usuário no instagram."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								midias: {
									...prev.midias,
									instagram: value,
								},
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="FACEBOOK"
						value={infoHolder.midias.facebook || ""}
						placeholder="Preencha aqui algum facebook do endereço."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								midias: {
									...prev.midias,
									facebook: value,
								},
							}))
						}
						width="100%"
					/>
				</div>
			</div>
		</div>
	);
}

export default MediaInformationBlock;
