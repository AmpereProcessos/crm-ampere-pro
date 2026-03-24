import { createHash } from "node:crypto";

const META_GRAPH_API_VERSION = "v21.0";

function normalizeEmail(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return value.trim().toLowerCase();
}

function normalizePhone(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const onlyDigits = value.replace(/\D/g, "");
  return onlyDigits || undefined;
}

function sha256(value?: string) {
  if (!value) {
    return undefined;
  }

  return createHash("sha256").update(value).digest("hex");
}

type TSendMetaLeadConversionParams = {
  pixelId: string;
  accessToken: string;
  leadgenId: string;
  eventId: string;
  email?: string | null;
  phone?: string | null;
  clientName?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  testEventCode?: string | null;
  eventTime?: Date;
};

export async function sendMetaLeadConversion({
  pixelId,
  accessToken,
  leadgenId,
  eventId,
  email,
  phone,
  clientName,
  fbc,
  fbp,
  testEventCode,
  eventTime,
}: TSendMetaLeadConversionParams) {
  const url = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  const emailHash = sha256(normalizeEmail(email));
  const phoneHash = sha256(normalizePhone(phone));
  const externalIdHash = sha256(leadgenId);
  const leadEventId = `${eventId}-lead`;
  const qualifiedEventId = `${eventId}-qualified`;

  const baseUserData = {
    em: emailHash ? [emailHash] : undefined,
    ph: phoneHash ? [phoneHash] : undefined,
    external_id: externalIdHash ? [externalIdHash] : undefined,
    fbc: fbc || undefined,
    fbp: fbp || undefined,
  };

  const baseCustomData = {
    currency: "BRL",
    value: 0,
    content_name: clientName || "Meta Lead",
    content_category: "lead",
  };

  const sendingEventTime = eventTime
    ? Math.floor(eventTime.getTime() / 1000)
    : Math.floor(Date.now() / 1000);
  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: sendingEventTime,
        event_id: leadEventId,
        action_source: "system_generated",
        user_data: baseUserData,
        custom_data: baseCustomData,
      },
      {
        event_name: "QUALIFIED",
        event_time: sendingEventTime,
        event_id: qualifiedEventId,
        action_source: "system_generated",
        user_data: baseUserData,
        custom_data: baseCustomData,
      },
    ],
    test_event_code: testEventCode || undefined,
  };
  console.log(`Sending conversion event to Meta for lead ${leadgenId}:`, payload);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta Conversions API error: ${errorText}`);
  }

  return response.json();
}
