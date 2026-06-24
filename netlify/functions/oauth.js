const crypto = require("crypto");

const CLIENT_ID = "Ov23liCsAukCww5MNvnw";
const CLIENT_SECRET = "a87362f67f073c0ebe8e42e6f7f798da2a528d0d";
const OAUTH_URL = "https://github.com/login/oauth";

exports.handler = async (event) => {
  const { code, state } = event.queryStringParameters || {};

  if (!code) {
    // Step 1: redirect to GitHub
    const randomState = crypto.randomBytes(16).toString("hex");
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: "repo,user",
      state: randomState,
    });
    return {
      statusCode: 302,
      headers: {
        Location: `${OAUTH_URL}/authorize?${params}`,
        "Set-Cookie": `oauth-state=${randomState}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      },
    };
  }

  // Step 2: exchange code for token
  const cookies = parseCookies(event.headers.cookie || "");
  if (state !== cookies["oauth-state"]) {
    return { statusCode: 400, body: "Invalid state" };
  }

  const resp = await fetch(`${OAUTH_URL}/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    }),
  });

  const data = await resp.json();
  if (data.error) {
    return { statusCode: 400, body: `OAuth error: ${data.error_description}` };
  }

  // Return token in the format Decap CMS expects
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: data.access_token,
      provider: "github",
    }),
  };
};

function parseCookies(cookieHeader) {
  const result = {};
  if (!cookieHeader) return result;
  cookieHeader.split(";").forEach((c) => {
    const [key, ...val] = c.trim().split("=");
    result[key] = val.join("=");
  });
  return result;
}
