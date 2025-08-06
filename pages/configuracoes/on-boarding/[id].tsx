import Funnel from "@/components/Onboarding/Funnel";
import Partner from "@/components/Onboarding/Partner";
import PaymentMethod from "@/components/Onboarding/PaymentMethod";
import PricingMethod from "@/components/Onboarding/PricingMethod";
import Thanks from "@/components/Onboarding/Thanks";
import User from "@/components/Onboarding/User";
import ErrorComponent from "@/components/utils/ErrorComponent";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { TPartner, TPartnerDTO } from "@/utils/schemas/partner.schema";
import { TAuthor } from "@/utils/schemas/user.schema";
import { Collection, ObjectId } from "mongodb";
import { GetServerSidePropsContext } from "next";
import React, { useState } from "react";

type OnBoardingProps = {
	partnerJSON: string;
	error: string | null | undefined;
};
function OnBoarding({ partnerJSON, error }: OnBoardingProps) {
	if (error) return <ErrorComponent msg={error} />;
	const partner: TPartnerDTO = JSON.parse(partnerJSON);
	const [stage, setStage] = useState<number>(1);
	const [authorHolder, setAuthorHolder] = useState<TAuthor>({
		id: "",
		nome: "",
		avatar_url: null,
	});

	return (
		<div className="flex h-full w-full max-w-full flex-col items-center justify-center bg-[#264653] p-6 font-Inter">
			<div className="flex h-full w-[98%]  flex-col rounded-md bg-[#fff] lg:h-[90%] lg:w-[70%]">
				<h1 className="w-full rounded-tl-md rounded-tr-md border border-gray-300 px-2 py-4 text-center text-2xl font-black text-[#fead41]">
					Onboarding <strong className="text-[#264653]">{partner.nome}</strong>
				</h1>
				<div className="flex w-full grow flex-col overflow-y-auto overscroll-y-auto px-0 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
					{stage == 1 ? <Partner partner={partner} goToNextStage={() => setStage(2)} /> : null}
					{stage == 2 ? <User partnerId={partner._id} setAuthorHolder={setAuthorHolder} goToNextStage={() => setStage(3)} goToPreviousStage={() => setStage(1)} /> : null}
					{stage == 3 ? <Funnel partnerId={partner._id} author={authorHolder} goToNextStage={() => setStage(4)} goToPreviousStage={() => setStage(2)} /> : null}
					{stage == 4 ? <PricingMethod partnerId={partner._id} author={authorHolder} goToNextStage={() => setStage(5)} goToPreviousStage={() => setStage(3)} /> : null}
					{stage == 5 ? <PaymentMethod partnerId={partner._id} author={authorHolder} goToNextStage={() => setStage(6)} goToPreviousStage={() => setStage(4)} /> : null}
					{stage == 6 ? <Thanks /> : null}
				</div>
			</div>
		</div>
	);
}

export default OnBoarding;

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const { query } = context;
	const { id } = query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id))
		return {
			props: {
				error: "ID inválido.",
			},
		};
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const partnersCollection: Collection<TPartner> = db.collection("partners");

	const partner = await partnersCollection.findOne({ _id: new ObjectId(id) });
	if (!partner)
		return {
			props: {
				error: "Empresa não encontrada.",
			},
		};
	const onboardingDone = !!partner.onboarding.dataConclusao;

	if (onboardingDone)
		return {
			props: {
				error: "Oops, parece que o onboarding da sua empresa já foi concluído.",
			},
		};
	return {
		props: {
			partnerJSON: JSON.stringify(partner),
		},
	};
}
