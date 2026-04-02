const fs = require("fs");
const { google } = require("googleapis");

function parseEnv(filePath) {
  const env = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[match[1]] = value;
  }

  return env;
}

(async () => {
  try {
    const env = parseEnv(".env.local");

    const auth = new google.auth.JWT({
      email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: env.GOOGLE_SHEET_RANGE || "Orders!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[new Date().toISOString(), "TEST_ORDER", "integration-check"]],
      },
    });

    console.log("APPEND_OK");
  } catch (error) {
    console.log("APPEND_FAIL");
    const details = error?.response?.data || error?.message || String(error);
    console.log(typeof details === "string" ? details : JSON.stringify(details));
  }
})();
