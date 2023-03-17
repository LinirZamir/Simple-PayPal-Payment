paypal
  .Buttons({
    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "50.00",
            },
            description: "deviceWISE",
          },
        ],
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        window.location.href = `http://localhost:3000/confirm-payment?token=${data.orderID}`;
      });
    },
  })
  .render("#paypal-button-container");
