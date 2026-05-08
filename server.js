// server.js
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));


// GET PROKERALA TOKEN
async function getAccessToken() {

  const response = await fetch(
    "https://api.prokerala.com/token",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },

      body:
        `grant_type=client_credentials&client_id=${process.env.PROKERALA_CLIENT_ID}&client_secret=${process.env.PROKERALA_CLIENT_SECRET}`
    }
  );

  const data =
    await response.json();

  return data.access_token;

}



// MAIN CHAT API
app.post("/chat", async (req, res) => {

  try {

    const {
      name,
      dob,
      tob,
      lat,
      lon
    } = req.body;



    // TOKEN
    const token =
      await getAccessToken();



    // API REQUEST
    const astrologyResponse =
      await fetch(

        `https://api.prokerala.com/v2/astrology/kundli/advanced` +

        `?datetime=${encodeURIComponent(
          `${dob}T${tob}:00+05:30`
        )}` +

        `&coordinates=${lat},${lon}` +

        `&ayanamsa=1`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );



    const astrologyData =
      await astrologyResponse.json();



    console.log(
      JSON.stringify(
        astrologyData,
        null,
        2
      )
    );



    // API ERROR CHECK
    if (
      astrologyData.status === "error"
    ) {

      return res.json({

        reply: `

❌ Astrology API Error

${astrologyData.errors?.[0]?.detail || "Unknown Error"}

`

      });

    }



    // MAIN DATA
    const data =
      astrologyData.data || {};



    // NAKSHATRA DETAILS
    const nakshatra =
      data.nakshatra_details?.nakshatra?.name ||
      "Unknown";

    const pada =
      data.nakshatra_details?.nakshatra?.pada ||
      "Unknown";



    // SIGNS
    const moonSign =
      data.nakshatra_details?.chandra_rasi?.name ||
      "Unknown";

    const sunSign =
      data.nakshatra_details?.soorya_rasi?.name ||
      "Unknown";

    const zodiac =
      data.nakshatra_details?.zodiac?.name ||
      "Unknown";



    // SPIRITUAL
    const deity =
      data.nakshatra_details?.additional_info?.deity ||
      "Unknown";

    const ganam =
      data.nakshatra_details?.additional_info?.ganam ||
      "Unknown";

    const symbol =
      data.nakshatra_details?.additional_info?.symbol ||
      "Unknown";



    // DOSHA
    const manglik =
      data.mangal_dosha?.has_dosha
        ? "Yes"
        : "No";

    const manglikType =
      data.mangal_dosha?.type ||
      "None";

    const manglikDesc =
      data.mangal_dosha?.description ||
      "No dosha details available";



    // REMEDIES
    let remedies =
      "No remedies available";



    if (
      Array.isArray(
        data.mangal_dosha?.remedies
      )
    ) {

      remedies =
        data.mangal_dosha.remedies
          .map(
            (r) => `• ${r}`
          )
          .join("\n");

    }



    // YOGAS
    let activeYogas =
      "No major yogas detected";



    if (
      Array.isArray(
        data.yoga_details
      )
    ) {

      const yogaList =
        data.yoga_details[0]
          ?.yoga_list || [];



      const found =
        yogaList
          .filter(
            (y) => y.has_yoga
          )
          .map(
            (y) => `• ${y.name}`
          );



      if (
        found.length > 0
      ) {

        activeYogas =
          found.join("\n");

      }

    }



    // FINAL RESPONSE
    res.json({

      reply: `

🕉 AVNIS AI ASTROLOGY READING



✨ Birth Details

Name:
${name || "Unknown"}

Nakshatra:
${nakshatra} (Pada ${pada})

Moon Sign:
${moonSign}

Sun Sign:
${sunSign}

Zodiac:
${zodiac}



🪐 Spiritual Nature

Deity:
${deity}

Ganam:
${ganam}

Symbol:
${symbol}



🔥 Mangal Dosha

Manglik:
${manglik}

Type:
${manglikType}

${manglikDesc}



🌟 Active Yogas

${activeYogas}



🛕 Remedies & Spiritual Guidance

${remedies}



🧠 Personality Insights

• Nakshatra Nature:
${ganam}

• Divine Energy:
${deity}

• Core Symbol:
${symbol}

• Moon Sign Energy:
${moonSign}



💎 Lucky Indicators

• Lucky Planet:
${data.nakshatra_details?.nakshatra?.lord?.name || "Unknown"}

• Birth Stone:
${data.nakshatra_details?.additional_info?.birth_stone || "Unknown"}

• Best Direction:
${data.nakshatra_details?.additional_info?.best_direction || "Unknown"}

• Animal Sign:
${data.nakshatra_details?.additional_info?.animal_sign || "Unknown"}

• Lucky Syllables:
${data.nakshatra_details?.additional_info?.syllables || "Unknown"}



━━━━━━━━━━━━━━━

💬 Ask me your doubt...

Examples:
• Career
• Marriage
• Love
• Business
• Finance
• Future

`

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      reply: `

❌ Server Error

${err.message}

`

    });

  }

});



app.listen(3000, () => {

  console.log(
    "Server running on http://localhost:3000"
  );

});