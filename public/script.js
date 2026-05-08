// script.js

async function sendMessage() {

  const name =
    document.getElementById("name").value;

  const dob =
    document.getElementById("dob").value;

  const tob =
    document.getElementById("tob").value;

  const lat =
    document.getElementById("lat").value;

  const lon =
    document.getElementById("lon").value;

  const question =
    document.getElementById("question").value;

  const mode =
    document.getElementById("mode").value;

  const chatbox =
    document.getElementById("chatbox");



  chatbox.innerHTML =
    "Loading Astrology Reading...";



  try {

    const response =
      await fetch(

        "/chat",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            name,
            dob,
            tob,
            lat,
            lon,
            question,
            mode

          })

        }

      );



    const data =
      await response.json();



    chatbox.innerHTML = `

      <pre>${data.reply}</pre>

    `;

  }

  catch (error) {

    console.log(error);

    chatbox.innerHTML = `

❌ Server Not Responding

`;

  }

}
