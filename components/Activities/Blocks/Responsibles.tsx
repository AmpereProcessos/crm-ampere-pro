import MultipleSelectWithImages from "@/components/Inputs/MultipleSelectWithImages";
import { useUsers } from "@/utils/queries/users";
import { useActivityStore } from "@/utils/stores/activity-store";
import { UserRound } from "lucide-react";

function ActivityResponsiblesBlock() {
	const { data: users } = useUsers();
	const responsibles = useActivityStore((s) => s.activity.responsaveis);
	const defineResponsibles = useActivityStore((s) => s.defineResponsibles);

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
				<UserRound size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">RESPONSÁVEIS</h1>
			</div>
			<MultipleSelectWithImages
				label="RESPONSÁVEIS"
				selected={responsibles.map((responsible) => responsible.id)}
				resetOptionLabel="REMOVER RESPONSÁVEL"
				options={
					users?.map((user) => ({
						id: user._id,
						label: user.nome,
						value: user._id,
						url: user.avatar_url ?? undefined,
					})) || []
				}
				handleChange={(value) => {
					const selectedUsers = users?.filter((user) => value.includes(user._id)) || [];
					const newResponsibles = selectedUsers?.map((user) => ({
						id: user._id,
						nome: user.nome,
						avatar_url: user.avatar_url ?? undefined,
					}));
					defineResponsibles(newResponsibles);
				}}
				onReset={() => {
					defineResponsibles([]);
				}}
				width="100%"
			/>
		</div>
	);
}

export default ActivityResponsiblesBlock;
