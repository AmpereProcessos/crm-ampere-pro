import { Code } from "lucide-react";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";

type ClientIdBlockProps = {
	clientId: string | null;
};
export default function ClientIdBlock({ clientId }: ClientIdBlockProps) {
	if (!clientId) return null;
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="IDENTIFICADOR" sectionTitleIcon={<Code size={15} />}>
			<h1 className="text-sm text-primary/80 tracking-tight">
				ID DO CLIENTE: <strong className="text-primary">{clientId}</strong>
			</h1>
		</ResponsiveDialogDrawerSection>
	);
}
