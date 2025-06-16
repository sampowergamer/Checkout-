const API_KEY = "XB9NDNR-QF5MY55-Q0NJ3FN-MW5EFSP";

async function createPayment() {
  const amountBRL = parseFloat(document.getElementById("amount").value);
  if (!amountBRL || amountBRL < 5 || amountBRL > 40) {
    alert("Digite um valor entre R$5 e R$40.");
    return;
  }

  const paymentBox = document.getElementById("payment-box");
  paymentBox.classList.add("hidden");
  document.getElementById("status").innerText = "Aguardando...";

  // Obter estimativa em TRX
  const estimateRes = await fetch("https://api.nowpayments.io/v1/estimate", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountBRL,
      currency_from: "brl",
      currency_to: "trx",
    }),
  });
  const estimate = await estimateRes.json();

  // Criar pagamento
  const paymentRes = await fetch("https://api.nowpayments.io/v1/payment", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: amountBRL,
      price_currency: "brl",
      pay_currency: "trx",
      order_description: "Depósito na SAMTECBANK"
    }),
  });
  const payment = await paymentRes.json();

  if (payment && payment.payment_id) {
    document.getElementById("trx-amount").innerText = estimate.estimated_amount.toFixed(4);
    document.getElementById("qr-code").innerHTML = `<img src="${payment.pay_address_qr}" alt="QR Code"/>`;
    paymentBox.classList.remove("hidden");

    const interval = setInterval(async () => {
      const statusRes = await fetch(`https://api.nowpayments.io/v1/payment/${payment.payment_id}`, {
        headers: { "x-api-key": API_KEY },
      });
      const statusData = await statusRes.json();
      document.getElementById("status").innerText = statusData.payment_status;
      if (statusData.payment_status === "finished" || statusData.payment_status === "failed") {
        clearInterval(interval);
      }
    }, 5000);
  } else {
    alert("Erro ao criar pagamento. Tente novamente.");
  }
}
