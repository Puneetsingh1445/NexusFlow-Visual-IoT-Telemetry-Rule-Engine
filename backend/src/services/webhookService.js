
import axios from "axios";

const sendWebhook = async (url, payload) => {
  try {
    // Send sensor data to the external webhook URL
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return {
      success: true,
      statusCode: response.status,
      message: "Webhook sent successfully",
      response: response.data,
    };

  } catch (error) {
    console.error("Webhook failed:", error.message);

    return {
      success: false,
      statusCode: error.response?.status || null,
      message: error.message,
    };
  }
};

export default sendWebhook;
