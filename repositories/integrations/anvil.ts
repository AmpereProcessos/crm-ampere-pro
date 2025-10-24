import axios from "axios";

type GetPDFByAnvil = {
	info: {
		title: string;
		fontSize: number;
		textColor: string;
		data: { [key: string]: any };
	};
	idAnvil: string;
};
export async function getPDFByAnvil({ info, idAnvil }: GetPDFByAnvil) {
	try {
		const anvilResponse = await axios.post(`https://app.useanvil.com/api/v1/fill/${idAnvil}.pdf`, info, {
			auth: {
				username: process.env.ANVIL_KEY || "",
				password: "",
			},
			responseType: "arraybuffer",
		});
		return anvilResponse.data;
	} catch (error) {
		throw error;
	}
}
