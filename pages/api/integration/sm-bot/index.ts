import { apiHandler } from "@/utils/api";
import axios from "axios";
import { NextApiHandler } from "next";

const smbotLead = {
	_id: {
		$oid: "6556406b9a6f8f5e3879db8f",
	},
	text: "34 996626855",
	type: null,
	contact: {
		type: "SITE",
		name: "TESTE",
		uid: 124465714,
		key: "kphq69c5yde",
		fields: {
			email: "teste@gmail.com",
			telefone: "34 996626855",
		},
	},
	data: null,
	headers: null,
	id: 6590036,
	clienteId: 28268,
	origin: "MENU",
};
type PostResponse = {
	type: string;
	departmentUUID: string;
	text: string;
};
const getOpportunities: NextApiHandler<PostResponse> = async (req, res) => {
	const info = req.body;
	const rdLead = {
		event_type: "CONVERSION",
		event_family: "CDP",
		payload: {
			conversion_identifier: "SMBOT",
			email: info.contact.fields.email,
			personal_phone: info.contact.fields.telefone,
			name: info.contact.name,
		},
	};
	const { data: rdResponse } = await axios.post(`https://api.rd.services/platform/conversions?api_key=${process.env.RD_API_KEY}`, rdLead);
	console.log(rdResponse);
	return res.status(201).json({
		type: "CREATE_CUSTOMER_SERVICE",
		departmentUUID: "f191433e-0d40-40f4-97ed-2abc52477c36",
		text: "",
	});
};

export default apiHandler({ POST: getOpportunities });
