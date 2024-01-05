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
  const stripe = Stripe(publishableKey, {
    apiVersion: '2020-08-27',
  });

  const url = new URL(window.location);
  const clientSecret = url.searchParams.get('payment_intent_client_secret');

  const {error, paymentIntent} = await stripe.retrievePaymentIntent(
    clientSecret
  );
  if (error) {
    addMessage(error.message);
  }
  addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
});
