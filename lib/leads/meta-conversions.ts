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

  const digitsOnly = value.replace(/\D/g, "");
  const normalized = digitsOnly.replace(/^0+/, "");
  if (!normalized) {
    return undefined;
  }

  // Meta recomenda enviar telefone com código do país.
  // Para leads locais, se vier apenas número nacional BR (10/11 dígitos), prefixa 55.
  if (normalized.length === 10 || normalized.length === 11) {
    return `55${normalized}`;
  }

  return normalized;
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
  testEventCode?: string | null;
  eventTime?: Date;
  actionSource?:
    | "email"
    | "website"
    | "app"
    | "phone_call"
    | "chat"
    | "physical_store"
    | "system_generated"
    | "business_messaging"
    | "other";
  eventSourceUrl?: string | null;
  clientUserAgent?: string | null;
  clientIpAddress?: string | null;
};

export async function sendMetaLeadConversion({
  pixelId,
  accessToken,
  leadgenId,
  eventId,
  email,
  phone,
  clientName,
  testEventCode,
  eventTime,
  actionSource = "system_generated",
  eventSourceUrl,
  clientUserAgent,
  clientIpAddress,
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
    client_user_agent: clientUserAgent || undefined,
    client_ip_address: clientIpAddress || undefined,
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

  if (actionSource === "website") {
    if (!eventSourceUrl) {
      throw new Error("Meta Conversions API: event_source_url is required for website events");
    }
    if (!clientUserAgent) {
      throw new Error("Meta Conversions API: client_user_agent is required for website events");
    }
  }

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: sendingEventTime,
        event_id: leadEventId,
        action_source: actionSource,
        event_source_url: eventSourceUrl || undefined,
        user_data: baseUserData,
        custom_data: baseCustomData,
      },
      {
        event_name: "QUALIFIED",
        event_time: sendingEventTime,
        event_id: qualifiedEventId,
        action_source: actionSource,
        event_source_url: eventSourceUrl || undefined,
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
