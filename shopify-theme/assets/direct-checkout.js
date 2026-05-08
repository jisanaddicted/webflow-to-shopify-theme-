function initDirectCheckoutForm() {
  const checkoutForm = document.querySelector('#direct-checkout-form');
  if (!checkoutForm) return;

  const variantField = checkoutForm.querySelector('[name="id"]');
  const quantityField = checkoutForm.querySelector('[name="quantity"]');
  const submitButton = checkoutForm.querySelector('button[type="submit"]');
  const buttonText = checkoutForm.querySelector('.text-block-17');

  const getSelectedVariantAvailability = () => {
    if (!variantField) return { isAvailable: true };

    // If it's a select dropdown, check the data-available attribute
    if (variantField.tagName && variantField.tagName.toLowerCase() === 'select') {
      const selectedOption = variantField.options[variantField.selectedIndex];
      const isAvailable = selectedOption && selectedOption.dataset.available === 'true';
      return { isAvailable };
    }

    return { isAvailable: true };
  };

  const syncAvailabilityState = () => {
    if (!submitButton) return;
    const { isAvailable } = getSelectedVariantAvailability();
    
    if (!isAvailable) {
      submitButton.disabled = true;
      submitButton.style.opacity = "0.5";
      if (buttonText) buttonText.innerText = 'Sold Out';
    } else {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
      if (buttonText) buttonText.innerText = 'Jetzt Kaufen';
    }
  };

  const addToCartAndRedirect = () => {
    const { isAvailable } = getSelectedVariantAvailability();
    if (!isAvailable) return;

    // Change button state to "Loading"
    if (buttonText) buttonText.innerText = 'Redirecting...';
    submitButton.disabled = true;

    const variantId = variantField.value;
    const quantity = quantityField ? quantityField.value : 1;

    const formData = {
      items: [{
        id: parseInt(variantId, 10),
        quantity: parseInt(quantity, 10),
      }],
    };

    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then((response) => {
      if (response.ok) {
        window.location.href = '/checkout';
      } else {
        return response.json().then((err) => {
          alert('Error: ' + (err.description || err.message));
          syncAvailabilityState(); // Reset button
        });
      }
    })
    .catch((error) => {
      console.error('Network Error:', error);
      syncAvailabilityState(); 
    });
  };

  // Listen for variant changes to update button (Sold Out vs Buy Now)
  if (variantField) {
    variantField.addEventListener('change', syncAvailabilityState);
  }
  
  syncAvailabilityState(); // Run once on load

  // Intercept the submit event
  checkoutForm.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();
    addToCartAndRedirect();
  }, true);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDirectCheckoutForm);
} else {
  initDirectCheckoutForm();
}