// src/utils/paymentGateway.js

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const handlePayment = async ({ 
  amount, 
  name = "Your App", 
  description, 
  userEmail, 
  onSuccess // <--- NEW PARAMETER: Function to run after success
}) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert("Razorpay SDK failed to load.");
    return;
  }

  const options = {
    key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Key ID
    amount: amount * 100, // Amount in paise
    currency: "INR",
    name: name,
    description: description,
    image: "https://your-logo-url.com/logo.png",
    
    // --- KEY CHANGE HERE ---
    handler: function (response) {
      // Razorpay returns: response.razorpay_payment_id
      if (onSuccess) {
        onSuccess(response); // Call the function to save to DB
      }
    },
    // -----------------------

    prefill: {
      email: userEmail,
    },
    theme: {
      color: "#FF4A1F",
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};