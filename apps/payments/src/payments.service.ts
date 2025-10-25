import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateChargeDto } from '@app/common';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
    );
  }

  async createCharge({
    card,
    amount,
    paymentMethodId,
    token,
    currency,
  }: CreateChargeDto) {
    let paymentMethod: string;
    if (paymentMethodId) {
      paymentMethod = paymentMethodId;
    } else if (token) {
      const pm = await this.stripe.paymentMethods.create({
        type: 'card',
        card: { token },
      });

      paymentMethod = pm.id;
    } else if (card) {
      const pm = await this.stripe.paymentMethods.create({
        type: 'card',
        card,
      });

      paymentMethod = pm.id;
    } else {
      throw new BadRequestException('No payment method provided');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'inr',
      payment_method: paymentMethod,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    return paymentIntent;
  }
}
