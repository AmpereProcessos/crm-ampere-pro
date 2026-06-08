import { sendMetaLeadConversion } from '@/lib/leads/meta-conversions';
import connectToDatabase from '@/services/mongodb/crm-db-connection';
import dayjs from 'dayjs';

export async function GET(request: Request) {
  const db = await connectToDatabase();
  const metaLeadsEnrichedCollection = db.collection('meta_leads_enriched');
  const sixDaysAgo = dayjs().subtract(6, 'days').toISOString();
  const metaLeadsEnriched = await metaLeadsEnrichedCollection
    .find({
      aiParsed: { $ne: null },
      created_time: { $gte: sixDaysAgo },
    })
    .toArray();
  console.log(`[${metaLeadsEnriched.length}] Meta leads enriched found`);
  const accessToken = process.env.META_SYSTEM_USER_TOKEN as string;
  const pixelId = process.env.META_PIXEL_ID as string;
  const conversionsToken = (process.env.META_CONVERSIONS_API_TOKEN || accessToken) as string;

  for (const lead of metaLeadsEnriched) {
    const leadGenId = lead.leadgen_id;
    const opportunityId = lead.idOportunidade || lead.opportunityId;
    const email = lead.aiParsed?.client.email;
    const phone = lead.aiParsed?.client.telefonePrimario;
    const clientName = lead.aiParsed?.client.nome;
    const city = lead.aiParsed?.client.cidade;
    const state = lead.aiParsed?.client.uf;
    const postalCode = lead.aiParsed?.client.cep;
    const eventTime = lead.created_time;
    console.log(`[${leadGenId}] Sending conversion event to Meta`, {
      clientName,
      email,
      phone,
      city,
      state,
      postalCode,
      eventTime,
    });
    const conversionResponse = await sendMetaLeadConversion({
      pixelId,
      accessToken: conversionsToken,
      leadgenId: leadGenId,
      eventId: opportunityId,
      email: email || undefined,
      phone: phone || undefined,
      clientName: clientName || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
      testEventCode: process.env.META_TEST_EVENT_CODE,
      eventTime: eventTime ? new Date(eventTime) : undefined,
    });
    console.log(`[${leadGenId}] Conversion event sent to Meta:`, conversionResponse);
  }

  return new Response('Conversion events sent to Meta', { status: 200 });
}
