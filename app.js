const express = require("express");
const path = require("path");
const paypal = require("@paypal/checkout-server-sdk");

const app = express();
// Serve static files
app.use(express.static(path.join(__dirname)));


// Serve the index.html file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.use(express.json());

function getClient() {
  const clientId = "Ae31hrU7uZCgc2YHWzz0v_mHByy5flglS2lCp64_1T6rFNQpNIGnsW2IyPB24yhComtiswYyd1rl-sSi";
  const clientSecret = "EHuIDYiRHP_6jVXl9U2FU2_xp2ZF1KjWHTNkPVprc3G1YIN-LsYioqF2sNG0ddHKoyFXSCNcqpCJ0ORq";

  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
}

app.post("/capture-payment", async (req, res) => {
  const orderId = req.body.orderId;

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  const client = getClient();

  try {
    const response = await client.execute(request);
    console.log("Capture ID:", response.result.purchase_units[0].payments.captures[0].id);
    console.log("Payment capture response:", response.result);
    res.send(response.result);
  } catch (error) {
    console.error("Error capturing payment:", error);
    res.status(500).send("Error capturing payment");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.get("/confirm-payment", (req, res) => {
    const orderId = req.query.token;
  
    if (!orderId) {
      return res.status(400).send("Missing order ID");
    }
  
    res.send(`
      <h1>Payment Approved</h1>
      <p>Order ID: ${orderId}</p>
      <button id="confirmBtn">Confirm Payment</button>
      <script>
        document.getElementById("confirmBtn").addEventListener("click", async () => {
          try {
            const response = await fetch("/capture-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });
  
            if (response.ok) {
              alert("Payment captured successfully!");
            } else {
              alert("Error capturing payment");
            }
          } catch (error) {
            console.error("Error capturing payment:", error);
            alert("Error capturing payment");
          }
        });
      </script>
    `);
  });