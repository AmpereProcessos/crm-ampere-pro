import { apiHandler, validateAuthentication } from "@/utils/api";
import { NextApiHandler } from "next";
import query from "../kits/query";
import axios from "axios";
import AdmZip from "adm-zip";

type PostResponse = {
	data: any;
};

const getProposal: NextApiHandler<PostResponse> = async (req, res) => {
	await validateAuthentication(req, res);
	const proposal = req.body;
	const { templateId } = req.query;
	console.log("TEMPLATE", templateId);
	try {
		console.log(proposal);
		// Make the external request
		const response = await axios.post(`https://app.useanvil.com/api/v1/fill/${templateId ? templateId : "LPHl6ETXfSmY3QsHJqAW"}.pdf`, proposal, {
			auth: {
				username: process.env.ANVIL_KEY ? process.env.ANVIL_KEY : "",
				password: "",
			},
			responseType: "arraybuffer",
		});
		console.log("RESPOSTA", response);
		// Due to API size limits, gotta zip the pdf file to send it, and then unzip it in the front end
		var zip = new AdmZip();
		zip.addFile("proposta.pdf", response.data);
		const zipContent = zip.toBuffer();
		const fileName = "proposta.zip";
		const fileType = "application/zip";

		res.setHeader("Content-Type", fileType);
		res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

		res.end(zipContent);
	} catch (error) {
		throw error;
	}

	//   // Generate PDF

	//   console.log(proposal);
	//   const response = await axios.post(
	//     "https://app.useanvil.com/api/v1/fill/vkEqERFPJNqGM7mM1cVe.pdf",
	//     proposal,
	//     {
	//       auth: {
	//         username: process.env.ANVIL_KEY ? process.env.ANVIL_KEY : "",
	//         password: "",
	//       },
	//     }
	//   );

	//   const stream = response.data.createReadStream();
	//   res.json(response.data);
};

export default apiHandler({
	POST: getProposal,
});
export const config = {
	api: {
		responseLimit: false,
	},
};
