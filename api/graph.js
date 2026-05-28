exports.handler = async function(event, context) {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST" || !event.body) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "POST mit JSON Body erforderlich" }) };
  }

  try {
    const { endpoint, method, postBody } = JSON.parse(event.body);
    const tenantId     = process.env.TENANT_ID;
    const clientId     = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Environment Variables fehlen – bitte TENANT_ID, CLIENT_ID, CLIENT_SECRET in Netlify setzen" }) };
    }

    const tokenResp = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials"
        })
      }
    );

    const tokenData = await tokenResp.json();
    if (tokenData.error) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: tokenData.error_description || tokenData.error }) };
    }

    // URL bestimmen: vollstaendige URL, beta/ Prefix, oder v1.0
    let graphUrl;
    if (endpoint.startsWith("https://")) {
      graphUrl = endpoint;
    } else if (endpoint.startsWith("beta/") || endpoint.startsWith("beta ")) {
      graphUrl = `https://graph.microsoft.com/${endpoint}`;
    } else {
      graphUrl = `https://graph.microsoft.com/v1.0/${endpoint}`;
    }

    const graphResp = await fetch(graphUrl, {
      method: method || "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json"
      },
      body: method === "POST" ? JSON.stringify(postBody) : undefined
    });

    const data = await graphResp.json();
    return { statusCode: graphResp.status, headers: CORS, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
