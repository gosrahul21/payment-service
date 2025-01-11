export default () => ({
    app: {
      port: parseInt(process.env.APP_PORT, 10) || 3000,
    },
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
    },
  });
  