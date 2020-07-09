var stripe = Stripe('pk_test_4kwKljP2qu3g5boJ8NjGv0pn00C5z9xNAo');

const elements = stripe.elements();

var cardNumber = elements.create('cardNumber');
cardNumber.mount('#card-number');

var cardExpiry = elements.create('cardExpiry');
cardExpiry.mount('#card-expiry');

var cardCvc = elements.create('cardCvc');
cardCvc.mount('#card-cvc');

const form = document.getElementById('stripecheckout-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();
  $("#card-errors").addClass("d-none");

  $("#stripecheckout-form input[type=submit]").prop("disabled", true);

  stripe.createToken(
          cardNumber,cardExpiry,cardCvc, {name:$("#name").val(),address:$("#address").val()}
          )
  .then(function(result) {
    if (result.error) {
      $("#card-errors").removeClass("d-none");

//      alert(result.error);
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
      $("#stripecheckout-form input[type=submit]").prop("disabled", false);
    } else {
//      alert(result.token);
      // Send the token to your server.
      stripeTokenHandler(result.token);
    }
  });
});


// // Create a token or display an error when the form is submitted.
// var $form = $('checkout-form');


function stripeTokenHandler(token) {

    console.dir(token);
    // Insert the token ID into the form so it gets submitted to the server
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);



    //Submit the form
    form.submit();
  }