import { Body, Button, Column, Container, Head, Html, Preview, Row, Section, Tailwind, Text } from "@react-email/components";

interface ReactivateOpportunityEmailProps {
	clientName: string;
	consultantName?: string;
	ctaUrl: string;
	companyName?: string;
	primaryColor?: string;
}

export const ReactivateOpportunityVariantOne = ({
	clientName,
	consultantName = "Gihad",
	ctaUrl,
	companyName = "Ampère Energias",
	primaryColor = "#fead41",
}: ReactivateOpportunityEmailProps) => {
	const previewText = `${clientName}, condições especiais em energia solar para você!`;

	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className="bg-gray-100 font-sans">
					<Container className="max-w-2xl mx-auto">
						{/* Header - Branding */}
						<Section className="bg-white px-6 py-6">
							<Row>
								<Column>
									<Text className="text-2xl font-bold text-gray-900 m-0">{companyName}</Text>
									<Text className="text-xs text-gray-500 m-0 mt-1">Soluções em Energia Solar</Text>
								</Column>
							</Row>
						</Section>
						{/* Main Content */}
						<Section className="bg-white px-8 py-8 mt-4">
							{/* Greeting */}
							<Row className="mb-6">
								<Column>
									<Text className="text-2xl font-bold text-gray-900 m-0">Bem-vindo de volta, {clientName}! 🌞</Text>
									<Text className="text-gray-600 m-0 mt-4 text-base leading-relaxed">
										Percebemos que você teve interesse em seu projeto solar conosco. Agora, temos uma oportunidade especial com condições muito atrativas que
										não queremos que você perca.
									</Text>
								</Column>
							</Row>

							{/* Offer Details */}
							<Row className="mb-8">
								<Column>
									<div
										style={{
											borderLeft: `4px solid ${primaryColor}`,
											backgroundColor: "#f0fdf4",
											padding: "20px",
											borderRadius: "8px",
										}}
									>
										<Text className="text-base font-bold text-gray-900 m-0">✓ Destaques da Oferta</Text>
										<Text className="text-sm text-gray-700 m-0 mt-3">• Condições especiais e muito competitivas</Text>
										<Text className="text-sm text-gray-700 m-0 mt-2">• Opções de financiamento com excelentes prazos</Text>
										<Text className="text-sm text-gray-700 m-0 mt-2">• Atendimento prioritário do nosso time especializado</Text>
										<Text className="text-sm text-gray-700 m-0 mt-2">• Suporte completo e garantia de qualidade</Text>
									</div>
								</Column>
							</Row>

							{/* Value Proposition */}
							<Row className="mb-8">
								<Column>
									<Text className="text-lg font-bold text-gray-900 m-0">Por que agir agora?</Text>
									<Text className="text-gray-600 m-0 mt-3 text-sm leading-relaxed">
										As tarifas de energia aumentam continuamente no Brasil. Quanto mais rápido você instalar seu sistema solar, mais cedo começará a economizar.
										Cada mês de atraso significa mais meses pagando as tarifas atuais. Não deixe essa oportunidade passar!
									</Text>
								</Column>
							</Row>
						</Section>

						{/* CTA Section */}
						<Section className="bg-white px-8 py-8 mt-4 text-center">
							<Text className="text-base font-bold text-gray-900 m-0 mb-6">Fale com nosso especialista agora</Text>
							<Button
								href={ctaUrl}
								style={{
									backgroundColor: primaryColor,
									padding: "14px 56px",
									borderRadius: "6px",
									textDecoration: "none",
									fontWeight: "bold",
									color: "white",
									display: "inline-block",
									fontSize: "16px",
									border: "none",
									cursor: "pointer",
								}}
							>
								FALAR COM O ESPECIALISTA
							</Button>
							<Text className="text-xs text-gray-500 m-0 mt-4">Responderemos em até 2 horas úteis</Text>
						</Section>

						{/* FAQ Section */}
						<Section className="bg-gray-50 px-8 py-8 mt-4">
							<Text className="text-lg font-bold text-gray-900 m-0 mb-4">Dúvidas Frequentes</Text>

							<Row className="mb-4">
								<Column>
									<Text className="text-sm font-bold text-gray-900 m-0">Quanto custa a avaliação?</Text>
									<Text className="text-sm text-gray-600 m-0 mt-2">Completamente gratuita! Você receberá um orçamento personalizado sem compromisso.</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="text-sm font-bold text-gray-900 m-0">Como funciona o processo?</Text>
									<Text className="text-sm text-gray-600 m-0 mt-2">
										Nosso time especializado fará uma análise completa do seu projeto, oferecendo a melhor solução com as melhores condições disponíveis.
									</Text>
								</Column>
							</Row>
						</Section>

						{/* Footer */}
						<Section className="bg-gray-900 px-8 py-8 mt-4">
							<Row className="mb-6">
								<Column>
									<Text className="text-white font-bold m-0">{companyName}</Text>
									<Text className="text-gray-400 text-xs m-0 mt-2">A energia que move o mundo, vem de você !</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="text-xs text-gray-500 m-0 mb-2">Consultor: {consultantName}</Text>
									<Text className="text-xs text-gray-500 m-0">© 2025 {companyName}. Todos os direitos reservados.</Text>
									<Text className="text-xs text-gray-500 m-0 mt-3">Clique no botão acima para agendar sua avaliação gratuita. Não responda este email.</Text>
								</Column>
							</Row>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default ReactivateOpportunityVariantOne;
