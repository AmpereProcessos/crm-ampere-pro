import React, { useState } from 'react'
import Image from 'next/image'
import Logo from '../../utils/svgs/vertical-white-logo-with-text.svg'
import { signIn } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { AiFillThunderbolt } from 'react-icons/ai'
import TextInput from '@/components/Inputs/TextInput'
import PasswordInput from '@/components/Inputs/PasswordInput'
import GoogleLogo from '@/utils/svgs/google-logo.svg'
type LoginTypes = {
  email: string
  password: string
}

function SignIn() {
  const { push } = useRouter()

  const [user, setUser] = useState<LoginTypes>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState<boolean>(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault() // Prevent the default form submission
    setLoading(true)
    let signInResponse = await signIn('credentials', {
      email: user.email,
      password: user.password,
      redirect: false,
    })

    console.log('SIGNIN', signInResponse)
    if (!signInResponse?.ok) {
      toast.error(signInResponse?.error ? signInResponse?.error : 'Erro ao fazer login.')
      setLoading(false)
    }

    if (signInResponse?.ok) {
      push('/')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#15599a] p-3 lg:flex-row">
      <div className="flex h-fit w-full flex-col items-center justify-center px-2 py-4 lg:h-full lg:w-2/3 lg:px-4 lg:py-6">
        <div className="relative h-[100px] w-[100px] lg:h-[250px] lg:w-[250px]">
          <Image src={Logo} fill={true} alt="Logo CRM" />
        </div>
        <h1 className="w-full text-center text-xl font-black text-white lg:text-4xl">Sua experiência completa de vendas.</h1>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center gap-8 rounded-md bg-[#fff] p-6 py-4 lg:w-1/3 lg:py-10">
        <div className="flex w-full items-center justify-center gap-2 font-Inter">
          <h1 className="text-3xl font-bold tracking-tight">
            Acesse o <strong className="text-cyan-500">CRM Ampère !</strong>
          </h1>
          <AiFillThunderbolt size={27} color="#fead41" />
        </div>
        <form
          className="flex w-full flex-col items-center justify-center"
          onSubmit={(e) => {
            e.preventDefault()

            handleLogin(e)
          }}
        >
          <div className="flex w-full flex-col">
            <h1 className="w-full text-start font-Inter text-sm leading-none tracking-tight text-gray-500">Seja bem vindo !</h1>
            <h1 className="w-full text-start font-Inter text-sm leading-none tracking-tight text-gray-500">
              Acesse já sua conta preenchendo suas credenciais de acesso abaixo.
            </h1>
          </div>

          <div className="mt-4 flex w-full flex-col gap-4">
            <TextInput
              label="EMAIL"
              placeholder="seuemail@provedor.com"
              value={user.email}
              handleChange={(value) => setUser((prev) => ({ ...prev, email: value }))}
              width="100%"
            />
            <PasswordInput
              label="SENHA"
              placeholder="sua123senha"
              value={user.password}
              handleChange={(value) => setUser((prev) => ({ ...prev, password: value }))}
              width="100%"
            />
          </div>
          <div className="mt-4 flex w-full flex-col items-center justify-end gap-2">
            <button
              type="submit"
              className="w-full rounded border border-black bg-black px-6 py-2 font-medium text-white duration-300 ease-in-out hover:bg-gray-800"
            >
              ACESSAR
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignIn
