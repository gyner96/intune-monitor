// Netlify Function – Graph API Proxy
// Verhindert CORS-Fehler im Browser
// Credentials werden als Environment Variables gespeichert (nicht im Code)

exports.handler = async function(event, context) {
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Preflight OPTIONS Request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { endpoint, method, postBody } = body;

    // Credentials aus Netlify Environment Variables
    const tenantId     = process.env.TENANT_ID;
    const clientId     = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Server-Konfiguration fehlt. Bitte Netlify Environment Variables setzen." })
      };
    }

    // Token holen
    const tokenResp = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id:     clientId,
          client_secret: clientSecret,
          scope:         "https://graph.microsoft.com/.default",
          grant_type:    "client_credentials"
        })
      }
    );

    const tokenData = await tokenResp.json();
    if (tokenData.error) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: `Token Fehler: ${tokenData.error_description || tokenData.error}` })
      };
    }

    const token = tokenData.access_token;

    // Graph API Anfrage
    const graphUrl = endpoint.startsWith("https://")
      ? endpoint
      : `https://graph.microsoft.com/v1.0/${endpoint}`;

    const graphResp = await fetch(graphUrl, {
      method: method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: method === "POST" ? JSON.stringify(postBody) : undefined
    });

    const graphData = await graphResp.json();

    return {
      statusCode: graphResp.status,
      headers: CORS_HEADERS,
      body: JSON.stringify(graphData)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
