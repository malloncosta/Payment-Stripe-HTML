document.addEventListener('DOMContentLoaded', async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file.

  var data;

  try {
    const response = await fetch('https://stripe.solnustec.com/get-token');
    data = await response.json();
    console.log('Resposta completa:', data);

    if (data.token) {
      console.log('Token obtido:', data.token);
    } else {
      console.error('Erro: Token não encontrado na resposta.');
    }
  } catch (error) {
    console.error('Erro ao fazer a solicitação:', error.message);
  }


  const response = await fetch('https://stripe.solnustec.com/config', {
    headers: {
      'Authorization': `Token ${data.token}`,
      'Content-Type': 'application/json',
    },
  });

  const { publishableKey } = await response.json()


  console.log('chave do servidor:', publishableKey)
  if (!publishableKey) {
    addMessage(
      'No publishable key returned from the server. Please check `.env` and try again'
    );
    alert('Please set your Stripe publishable API key in the .env file');
  }

  const stripe = Stripe(publishableKey, {
    apiVersion: '2020-08-27',
  });

  const dataClient = {
    "total": {
      "amount": 32.15
    },
    "metadata": {
      "name": "manoel malon",
      "email": "malon@gmail.com",
      "cellphone": "878451"
    }
  }

  const {
    error: backendError,
    clientSecret
  } = await fetch('https://stripe.solnustec.com/create-payment-intent', {
    method: "POST",
    headers: {
      'Authorization': `Token ${data.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataClient)
  }).then(r => r.json());

  if (backendError) {
    addMessage(backendError.message);
  }
  addMessage(`Client secret returned.`);

  // Initialize Stripe Elements with the PaymentIntent's clientSecret,
  // then mount the payment element.
  const elements = stripe.elements({ clientSecret });
  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');
  // Create and mount the linkAuthentication Element to enable autofilling customer payment details
  const linkAuthenticationElement = elements.create("linkAuthentication");
  linkAuthenticationElement.mount("#link-authentication-element");
  // If the customer's email is known when the page is loaded, you can
  // pass the email to the linkAuthenticationElement on mount:
  //
  //   linkAuthenticationElement.mount("#link-authentication-element",  {
  //     defaultValues: {
  //       email: 'jenny.rosen@example.com',
  //     }
  //   })
  // If you need access to the email address entered:
  //
  //  linkAuthenticationElement.on('change', (event) => {
  //    const email = event.value.email;
  //    console.log({ email });
  //  })

  // When the form is submitted...
  const form = document.getElementById('payment-form');
  let submitted = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable double submission of the form
    if (submitted) { return; }
    submitted = true;
    form.querySelector('button').disabled = true;

    const nameInput = document.querySelector('#name');

    // Confirm the payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/return.html`,
      }
    });

    if (stripeError) {
      addMessage(stripeError.message);

      // reenable the form.
      submitted = false;
      form.querySelector('button').disabled = false;
      return;
    }
  });
});
