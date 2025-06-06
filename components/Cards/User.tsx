import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/router";
import { TUserDTO, TUserEntity } from "@/utils/schemas/user.schema";
import { BsFillCalendarFill } from "react-icons/bs";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { AiFillEdit } from "react-icons/ai";
type CardUserControlProps = {
	userInfo: TUserDTO;
	admin: boolean;
	openModal: (id: string) => void;
};
function CardUserControl({ userInfo, admin, openModal }: CardUserControlProps) {
	const router = useRouter();
	const ref = useRef<any>(null);
	const [dropdownVisible, setDropDownVisible] = useState(false);

	function onClickOutside() {
		setDropDownVisible(false);
	}
	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (ref.current && !ref.current.contains(event.target)) {
				onClickOutside();
			}
		};
		document.addEventListener("click", (e) => handleClickOutside(e), true);
		return () => {
			document.removeEventListener("click", (e) => handleClickOutside(e), true);
		};
	}, [onClickOutside]);

	return (
		<div ref={ref} className="flex min-h-[100px] w-full flex-col gap-2 rounded-md border border-gray-300 shadow-sm lg:flex-row">
			<div className={`h-[4px] w-full lg:h-full lg:w-[4px] ${userInfo.ativo ? "bg-blue-500" : "bg-gray-500"} rounded-bl-md rounded-tl-md`}></div>
			<div className="flex grow flex-col items-center lg:flex-row">
				<div className="flex h-full min-w-[60px] flex-col items-center justify-center gap-2">
					{userInfo.avatar_url ? (
						<div className="relative h-[50px] w-[50px]">
							<Image
								alt="Mountains"
								src={userInfo.avatar_url}
								quality={100}
								fill
								sizes="100vw"
								style={{
									borderRadius: "100%",
									objectFit: "cover",
								}}
							/>
						</div>
					) : (
						<div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gray-600">
							<FaUser style={{ color: "white", fontSize: "25px" }} />
						</div>
					)}
				</div>
				<div className="flex h-full grow flex-col justify-center p-3">
					<h5 className="font-Raleway font-black leading-none tracking-tight">{userInfo.nome}</h5>
					<span className="text-[0.65rem] text-gray-500 lg:text-sm">{userInfo.email}</span>
					<div className="mt-2 flex w-full items-center justify-between">
						<div className="flex items-center gap-1 text-xs">
							<BsFillCalendarFill />
							<p className="leading-none tracking-tight text-gray-500">{userInfo.dataInsercao ? formatDateAsLocale(userInfo.dataInsercao) : "NÃO DEFINIDO"}</p>
						</div>
						<button onClick={() => openModal(userInfo._id.toString())} className="text-sm text-gray-500 duration-300 ease-in-out hover:text-cyan-500">
							<AiFillEdit />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CardUserControl;
