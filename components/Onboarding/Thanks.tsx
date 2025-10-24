import Link from "next/link";

function Thanks() {
	return (
		<div className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center space-y-4 text-center">
					<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">Configurações concluídas !</h1>
					<p className="mt-4 w-full text-center text-primary/70 dark:text-primary/40 md:text-xl">Tudo certo para começarmos a vender juntos.</p>

					<div className="flex w-full items-center justify-center">
						<Link href="/auth/signin">
							<button className="rounded bg-black p-2 px-4 text-lg font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/60">
								Vamos começar
							</button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Thanks;
