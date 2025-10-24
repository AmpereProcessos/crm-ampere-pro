import { apiHandler, validateAuthentication } from "@/utils/api";
import { NextApiHandler } from "next";
import { getDownloadURL } from "firebase/storage";
import query from "../kits/query";
import axios from "axios";
import fs from "fs";
import getBucket from "@/services/firebase/bucket-config";

type PostResponse = {
	data: any;
};

const uploadDocument: NextApiHandler<PostResponse> = async (req, res) => {
	await validateAuthentication(req, res);
	const { filePath } = req.query;
	try {
		if (typeof filePath === "string") {
			const bucket = await getBucket();
			const file = bucket.file(filePath);
			// Get the file metadata to retrieve the MIME type
			const [metadata] = await file.getMetadata();
			const mimeType = metadata.contentType;
			// Create a buffer to store the file data
			const buffers: any = [];
			// Create a read stream to read the file data
			const stream = file.createReadStream();
			// Stream the file data into the buffer
			stream.on("data", (data) => {
				buffers.push(data);
			});
			// Resolve the promise with the base64 encoding when the file stream ends
			const fileBase64 = await new Promise((resolve, reject) => {
				stream.on("end", () => {
					const fileData = Buffer.concat(buffers);
					const fileBase64 = `data:${mimeType};base64,${fileData.toString("base64")}`;
					resolve(fileBase64);
				});

				// Handle any errors that occur during the file stream
				stream.on("error", (error) => {
					reject(error);
				});
			});
			const { data: documentUploadResponse } = await axios.post(
				"https://sandbox.clicksign.com/api/v1/documents?access_token=9686cf5e-a687-4b6e-85de-17d9d40da3f0",
				{
					document: {
						path: "/teste3.pdf",
						content_base64: fileBase64,
						deadline_at: null,
						auto_close: true,
						locale: "pt-BR",
						sequence_enabled: false,
						block_after_refusal: true,
					},
				},
			);
			const documentKey = documentUploadResponse.key;
			console.log(documentUploadResponse);
			res.json({ data: documentKey });
		} else {
			throw "FILE PATH INVALID";
		}
	} catch (error) {
		throw "Houve um erro.";
	}
};
//   if (file) {
//     try {
//       const reader = new FileReader();
//       reader.onloadend = async () => {
//         const base64Data = reader.result;
//         // Use the base64Data as needed (e.g., send it to the external service)
//         const response = await axios.post(
//           `https://sandbox.clicksign.com/api/v1/documents?access_token=9686cf5e-a687-4b6e-85de-17d9d40da3f0`,
//           {
//             document: {
//               path: `/${name}`,
//               content_base64: base64Data,
//               deadline_at: "2023-06-29T14:30:59-03:00",
//               auto_close: true,
//               locale: "pt-BR",
//               sequence_enabled: false,
//               block_after_refusal: true,
//             },
//           }
//         );
//         console.log(response);
//       };
//       reader.readAsDataURL(file);
//       res.json({ data: "Deu certo!" });
//     } catch (error) {
//       console.log(error);
//       throw error;
//     }
//   }

export default apiHandler({
	POST: uploadDocument,
});
