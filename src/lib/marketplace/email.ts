import type { Order } from "./types";
import { formatPrice } from "./catalog";

export interface EmailService {
  sendOrderReceipt(order: Order, downloadUrl: string, checksum?: string): Promise<boolean>;
  sendMagicLink(email: string, magicUrl: string): Promise<boolean>;
}

export class ConsoleEmailService implements EmailService {
  lastSentReceipt?: { order: Order; downloadUrl: string; checksum?: string };
  lastSentMagicLink?: { email: string; magicUrl: string };

  async sendOrderReceipt(order: Order, downloadUrl: string, checksum?: string): Promise<boolean> {
    this.lastSentReceipt = { order, downloadUrl, checksum };
    const priceFormatted = formatPrice(order.amount, order.currency);

    console.log("=================================================");
    console.log(`[RECEIPT EMAIL] To: ${order.customerEmail}`);
    console.log(`Subject: Your order receipt for ${order.productName}`);
    console.log(`Order Reference: ${order.reference}`);
    console.log(`Product: ${order.productName} (${order.releaseVersion})`);
    console.log(`Amount: ${priceFormatted}`);
    console.log(`Download Link: ${downloadUrl}`);
    if (checksum) {
      console.log(`Installer SHA-256 Checksum: ${checksum}`);
    }
    console.log("=================================================");

    return true;
  }

  async sendMagicLink(email: string, magicUrl: string): Promise<boolean> {
    this.lastSentMagicLink = { email, magicUrl };

    console.log("=================================================");
    console.log(`[MAGIC LINK EMAIL] To: ${email}`);
    console.log("Subject: Access your Indie App Marketplace purchases");
    console.log(`Magic Link: ${magicUrl}`);
    console.log("This link will remain active for 60 minutes.");
    console.log("=================================================");

    return true;
  }
}

export class ResendEmailService implements EmailService {
  private apiKey: string;
  private from: string;

  constructor(apiKey?: string, from?: string) {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || "";
    this.from = from || process.env.EMAIL_FROM || "Ismail <store@ismailhossain.dev>";
  }

  async sendOrderReceipt(order: Order, downloadUrl: string, checksum?: string): Promise<boolean> {
    if (!this.apiKey) {
      return new ConsoleEmailService().sendOrderReceipt(order, downloadUrl, checksum);
    }

    const priceFormatted = formatPrice(order.amount, order.currency);
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2>Thank you for your purchase!</h2>
        <p>Your order for <strong>${order.productName}</strong> is confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Order Reference:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${order.reference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Version:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${order.releaseVersion}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${priceFormatted}</td>
          </tr>
        </table>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${downloadUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Download Your Installer
          </a>
        </div>
        ${
          checksum
            ? `<p style="font-size: 13px; color: #666; word-break: break-all;">
                <strong>SHA-256 Checksum:</strong><br/><code>${checksum}</code>
               </p>`
            : ""
        }
        <p style="font-size: 14px; color: #555; margin-top: 30px;">
          If you ever lose this file, you can re-download it anytime using your email address on our store lookup page.
        </p>
      </div>
    `;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.from,
          to: order.customerEmail,
          subject: `Your order receipt for ${order.productName} (${order.reference})`,
          html: htmlContent,
        }),
      });

      return res.ok;
    } catch {
      return false;
    }
  }

  async sendMagicLink(email: string, magicUrl: string): Promise<boolean> {
    if (!this.apiKey) {
      return new ConsoleEmailService().sendMagicLink(email, magicUrl);
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2>Access your purchases</h2>
        <p>Click the link below to access your order history and download your purchased apps:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${magicUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View My Orders
          </a>
        </div>
        <p style="font-size: 13px; color: #666;">
          This link will expire in 60 minutes. If you did not request this link, you can safely ignore this email.
        </p>
      </div>
    `;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.from,
          to: email,
          subject: "Your Indie App Marketplace Order Access Link",
          html: htmlContent,
        }),
      });

      return res.ok;
    } catch {
      return false;
    }
  }
}

export function getEmailService(): EmailService {
  if (process.env.EMAIL_SERVICE === "resend" && process.env.RESEND_API_KEY) {
    return new ResendEmailService();
  }
  return new ConsoleEmailService();
}
