import { claimReceipt, finishReceipt } from "../db";
import { orderAccessToken } from "../security";
import { getEmailService } from "../email";
import { getReleaseForProduct } from "../catalog";
import type { Order } from "../types";
export async function deliverReceipt(order: Order): Promise<boolean> {
    if (!await claimReceipt(order.id))
        return true;
    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const product = await getReleaseForProduct(order.productId, order.releaseVersion);
        const sent = await getEmailService().sendOrderReceipt(order, `${siteUrl}/store/return?orderId=${encodeURIComponent(order.id)}&access=${orderAccessToken(order.id)}`, product?.sha256Checksum);
        await finishReceipt(order.id, sent);
        return sent;
    }
    catch (error) {
        await finishReceipt(order.id, false);
        throw error;
    }
}
