'use server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FullScreenWrapper from '@/components/Wrappers/FullScreenWrapper';
import { login } from '@/lib/auth/actions';
import { cn } from '@/lib/utils';

import AmpereWhiteLogo from '@/utils/svgs/blue-logo-borders-only.svg';
import AmpereHorizontalLogo from '@/utils/svgs/horizontal-blue-logo-with-text.svg';
import Image from 'next/image';
type LoginProps = {
  searchParams?: {
    error?: string;
  };
};

function Login({ searchParams }: LoginProps) {
  return (
    <FullScreenWrapper>
      <div className='w-full h-full grid lg:grid-cols-2'>
        <div className='flex flex-col gap-4 p-6 md:p-10'>
          <div className='flex justify-center gap-2 md:justify-start'>
            <div className='relative w-24 h-24'>
              <Image src={AmpereHorizontalLogo} alt='Logo da Ampère Energias' fill className='object-contain' />
            </div>
          </div>
          <div className='flex flex-1 items-center justify-center'>
            <div className='w-full max-w-xs lg:max-w-md'>
              <form action={login} className={cn('flex flex-col gap-6')}>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <h1 className='text-2xl font-bold'>Acesse sua conta Ampère Energias</h1>
                  <p className='text-muted-foreground text-sm text-balance'>Preencha as suas credenciais para acessar ao app.</p>
                </div>
                <div className='grid gap-6'>
                  <div className='grid gap-3'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      placeholder='seu@email.com'
                      required
                      className='dark:bg-background dark:border-primary/30 dark:placeholder:text-primary/70 dark:text-primary'
                    />
                  </div>
                  <div className='grid gap-3'>
                    <div className='flex items-center'>
                      <Label htmlFor='password'>Senha</Label>
                    </div>
                    <Input id='password' name='password' type='password' placeholder='suasenha123' required className='dark:bg-background' />
                  </div>
                  {searchParams?.error && <p className='text-red-500 w-full text-center'>{searchParams.error}</p>}
                  <Button type='submit' className='w-full font-bold'>
                    Acessar
                  </Button>
                  {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
										<span className="bg-background text-muted-foreground relative z-10 px-2">Ou continue com</span>
									</div>
									<Button variant="outline" className="w-full flex items-center justify-center gap-2 font-medium">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
											<title>Login com Google</title>
											<path
												d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
												fill="currentColor"
											/>
										</svg>
										Acessar com Google
									</Button> */}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className='bg-muted hidden lg:flex items-center justify-center'>
          <div className='relative w-64 h-64'>
            <Image src={AmpereWhiteLogo} alt='Logo da Ampère Energias' fill className='object-contain' />
          </div>
        </div>
      </div>
    </FullScreenWrapper>
  );
}

export default Login;
