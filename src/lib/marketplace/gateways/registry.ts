import type { PaymentGatewayAdapter } from "./types";
import { SandboxGateway } from "./sandbox";
import { BKashGateway } from "./bkash";
import { SSLCommerzGateway } from "./sslcommerz";

class PaymentGatewayRegistry {
  private gateways: Map<string, PaymentGatewayAdapter> = new Map();

  constructor() {
    this.register(new SandboxGateway());
    this.register(new BKashGateway());
    this.register(new SSLCommerzGateway());
  }

  register(gateway: PaymentGatewayAdapter): void {
    this.gateways.set(gateway.name.toLowerCase(), gateway);
  }

  get(name: string): PaymentGatewayAdapter {
    const found = this.gateways.get(name.toLowerCase());
    if (!found) {
      // Fallback to sandbox if requested gateway is not recognized
      const sandbox = this.gateways.get("sandbox");
      if (sandbox) return sandbox;
      throw new Error(`Payment gateway '${name}' is not registered`);
    }
    return found;
  }

  getDefault(): PaymentGatewayAdapter {
    const configured = process.env.DEFAULT_GATEWAY || "sandbox";
    return this.get(configured);
  }
}

export const gatewayRegistry = new PaymentGatewayRegistry();
