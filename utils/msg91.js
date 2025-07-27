const axios = require('axios');
require('dotenv').config();

const MSG91_SEND_OTP_URL = "https://api.msg91.com/api/v5/otp";

const sendOtp = async (mobile) => {
  try {
    const response = await axios.post(MSG91_SEND_OTP_URL, {
      mobile: `91${mobile}`,
      template_id: '', // leave blank for basic template
    }, {
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log("MSG91 SEND RESPONSE:", response.data);
    return response.data;
    
  } catch (error) {
    throw new Error("Failed to send OTP");
  }
};

const verifyOtp = async (mobile, otp) => {
  try {
    const response = await axios.get(`${MSG91_SEND_OTP_URL}/verify?otp=${otp}&mobile=91${mobile}`, {
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY
      }
    });
    console.log("MSG91 VERIFY RESPONSE:", response.data);
    return response.data;
  } catch (error) {
    throw new Error("OTP verification failed");
  }
};

module.exports = { sendOtp, verifyOtp };
