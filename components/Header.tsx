import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from '../utils/images/logo.png';

function Header() {
    const { pathname } = useRouter();
    if (pathname.includes('/auth/signin')) {
        return null;
    }

    return (
        <div className='sticky top-0 z-[1] grid h-[70px] w-full max-w-full grid-cols-3 items-center border-gray-300 border-b bg-[#fff] px-3 lg:px-12'>
            <div />
            <div className='flex h-[60px] cursor-pointer items-center justify-center'>
                <Link href='/'>
                    <Image alt='LOGO' height={60} src={Logo} width={60} />
                </Link>
            </div>
            <div className='flex items-center justify-end' />
        </div>
    );
}

export default Header;
