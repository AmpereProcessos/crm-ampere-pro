import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars } from "react-icons/fa";
import { MdOutlineLogout, MdOutlineKeyboardArrowDown } from "react-icons/md";
import Logo from "../utils/images/logo.png";
import { useRouter } from "next/router";
import { useSession } from "@/app/providers/SessionProvider";

function Header() {
	const { session, status } = useSession({ required: true });
	const { pathname } = useRouter();
	if (pathname.includes("/auth/signin")) return null;

	return (
		<div className="sticky top-0 z-[1] grid h-[70px] w-full  max-w-full grid-cols-3 items-center border-b border-gray-200 bg-[#fff] px-3 lg:px-12">
			{/* <div
          onClick={toggleSidebar}
          className="flex w-fit cursor-pointer items-center rounded-full p-2 text-[#15599a] duration-200 ease-in-out hover:scale-110"
        >
          <FaBars style={{ fontSize: "25px" }} />
        </div> */}
			<div></div>
			<div className="flex h-[60px] cursor-pointer items-center justify-center">
				<Link href="/">
					<Image alt="LOGO" height={60} width={60} src={Logo} />
				</Link>
			</div>
			<div className="flex items-center justify-end">
				{/* {session?.user?.image ? (
            <div className="mr-2 flex items-center gap-2 rounded-lg border border-[#15599a] p-1 px-2">
              <div className="relative h-[35px] w-[35px]">
                <Image
                  style={{ borderRadius: "100%" }}
                  src={session.user.image}
                  alt="USUÁRIO"
                  title="CONFIGURAÇÕES"
                  fill={true}
                />
              </div>
            </div>
          ) : null} */}
				{/* 
          <MdOutlineLogout
            onClick={() => {
              signOut();
            }}
            style={{
              cursor: "pointer",
              color: "#fead61",
              fontSize: "25px",
            }}
          /> */}
			</div>
		</div>
	);
}

export default Header;
