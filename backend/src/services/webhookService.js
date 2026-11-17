
import axios from "axios";

const sendWebhook = async (url, payload) => {
  try {
    // Validate the destination URL
    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error("Invalid webhook URL");
    }

    // Only allow HTTPS
    if (parsedUrl.protocol !== "https:") {
      throw new Error("Only HTTPS webhook URLs are allowed");
    }

    // Block embedded username and password
    if (parsedUrl.username || parsedUrl.password) {
      throw new Error("Webhook URL credentials are not allowed");
    }

    // Read trusted domains from environment variables
    const allowedHosts = (
      process.env.WEBHOOK_ALLOWED_HOSTS || ""
    )
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);

    // Check whether the destination is trusted
    if (!allowedHosts.includes(parsedUrl.hostname.toLowerCase())) {
      throw new Error("Webhook domain is not allowed");
    }

    // Send webhook request
    const response = await axios.post(
      parsedUrl.toString(),
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
        maxRedirects: 0,
        maxBodyLength: 1024 * 1024,
        maxContentLength: 1024 * 1024,
      }
    );

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
