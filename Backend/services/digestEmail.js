import nodemailer from "nodemailer";

export async function sendDigestEmail(userEmail, userName, payload) {
  const topProducts = payload.topProducts || [];
  const sentimentSummary = payload.sentimentSummary || {};
  const newProductsCount = payload.newProductsCount || 0;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  const from = process.env.DIGEST_FROM || process.env.SMTP_USER || "noreply@peerrank.com";
  const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const productListHtml = topProducts
    .slice(0, 10)
    .map(
      (p, i) =>
        "<li><a href=\"" + appUrl + "/product/" + p._id + "\">" + (i + 1) + ". " + (p.title || "Product") + "</a> (" + (p.upvotesCount ?? 0) + " upvotes)</li>"
    )
    .join("");

  const sentimentHtml = "<p><strong>Feedback sentiment this week:</strong> Positive: " + (sentimentSummary.positive ?? 0) + ", Neutral: " + (sentimentSummary.neutral ?? 0) + ", Negative: " + (sentimentSummary.negative ?? 0) + "</p>";

  const html =
    "<h2>Your Weekly PeerRank Digest</h2>" +
    "<p>Hi " + (userName || "there") + ",</p>" +
    "<p>Here is your weekly round-up from PeerRank.</p>" +
    "<h3>Top products this week</h3>" +
    "<ul>" + (productListHtml || "<li>No products this week.</li>") + "</ul>" +
    sentimentHtml +
    "<p><strong>New products:</strong> " + newProductsCount + " launched this week.</p>" +
    "<p><a href=\"" + appUrl + "\">Open PeerRank</a></p>" +
    "<p>— PeerRank AI Recommendations</p>";

  const mailOptions = {
    from,
    to: userEmail,
    subject: "Your Weekly PeerRank Digest",
    html,
    text: html.replace(/<[^>]*>/g, ""),
  };

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("[Digest] SMTP not configured. Would send to:", userEmail);
      return { ok: true, skipped: true };
    }
    await transporter.sendMail(mailOptions);
    return { ok: true };
  } catch (err) {
    console.error("[Digest] Send failed for", userEmail, err.message);
    return { ok: false, error: err.message };
  }
}
