import { NextApiHandler } from "next";
import getBucket from "../../../services/firebase/bucket-config";
import { apiHandler } from "@/utils/api";
import AdmZip from "adm-zip";
import { basename } from "path";
type GetResponse = {
	data: any;
};

const getDistance: NextApiHandler<GetResponse> = async (req, res) => {
	const { filePath } = req.query;
	if (typeof filePath === "string") {
		try {
			const bucket = await getBucket();
			console.log(filePath);
			const file = bucket.file(filePath);
			const fileBuffer = await file.download();
			// //
			// const stream = file.createReadStream();
			// stream.pipe(res);
			// //
			var zip = new AdmZip();
			zip.addFile(basename(file.name), fileBuffer[0]);
			const zipContent = zip.toBuffer();
			const fileName = "proposta.zip";
			const fileType = "application/zip";

			res.setHeader("Content-Type", fileType);
			res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

			res.end(zipContent);
		} catch (error) {
			console.log(error);
			throw "Houve um erro no download do arquivo.";
		}
	}
};
export default apiHandler({
	GET: getDistance,
});
export const config = {
	api: {
		responseLimit: false,
	},
};
