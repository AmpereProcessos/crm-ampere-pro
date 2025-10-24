import axios from "axios";
import type { TProject } from "../schemas/project.schema";

export async function updateAppProject(projectId: string, changes: Partial<TProject>) {
	const { data } = await axios.put(`/api/integration/app-ampere/projects?id=${projectId}`, changes);
	return data.message as string;
}
