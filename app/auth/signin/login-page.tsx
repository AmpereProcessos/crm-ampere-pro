"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import { login } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import AmpereWhiteLogo from "@/utils/svgs/blue-logo-borders-only.svg";
import AmpereHorizontalLogo from "@/utils/svgs/horizontal-blue-logo-with-text.svg";
import Image from "next/image";
import { useActionState } from "react";

function Login() {
	const [actionResult, actionMethod] = useActionState(login, {});

	const fieldErrorMessage =
		actionResult.fieldError?.email ?? actionResult.fieldError?.password ?? null;

	return (
		<FullScreenWrapper>
			<div className="w-full h-full grid lg:grid-cols-2">
				<div className="flex flex-col gap-4 p-6 md:p-10">
					<div className="flex justify-center gap-2 md:justify-start">
						<div className="relative w-24 h-24">
							<Image src={AmpereHorizontalLogo} alt="Logo da Ampère Energias" fill className="object-contain" />
						</div>
					</div>
					<div className="flex flex-1 items-center justify-center">
						<div className="w-full max-w-xs lg:max-w-md">
							<form action={actionMethod} className={cn("flex flex-col gap-6")}>
								<div className="flex flex-col items-center gap-2 text-center">
									<h1 className="text-2xl font-bold">Acesse sua conta Ampère Energias</h1>
									<p className="text-muted-foreground text-sm text-balance">Preencha as suas credenciais para acessar ao app.</p>
								</div>
								<div className="grid gap-6">
									<div className="grid gap-3">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											name="email"
											type="email"
											placeholder="seu@email.com"
											required
											className="dark:bg-background dark:border-primary/30 dark:placeholder:text-primary/70 dark:text-primary"
										/>
									</div>
									<div className="grid gap-3">
										<div className="flex items-center">
											<Label htmlFor="password">Senha</Label>
										</div>
										<Input id="password" name="password" type="password" placeholder="suasenha123" required className="dark:bg-background" />
									</div>
									{actionResult.formError ? (
										<p className="text-red-500 w-full text-center">{actionResult.formError}</p>
									) : fieldErrorMessage ? (
										<p className="text-red-500 w-full text-center">{fieldErrorMessage}</p>
									) : null}
									<Button type="submit" className="w-full font-bold">
										Acessar
									</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
				<div className="bg-muted hidden lg:flex items-center justify-center">
					<div className="relative w-64 h-64">
						<Image src={AmpereWhiteLogo} alt="Logo da Ampère Energias" fill className="object-contain" />
					</div>
				</div>
			</div>
		</FullScreenWrapper>
	);
}

export default Login;
