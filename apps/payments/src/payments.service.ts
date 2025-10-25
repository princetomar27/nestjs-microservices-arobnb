import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateChargeDto } from '@app/common';
import { NOTIFICATION_SERVICE } from '@app/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentsCreateChargeDto } from './dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
  ) {
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
    email,
  }: PaymentsCreateChargeDto) {
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

    this.notificationService.emit('notify_email', {
      email,
    });

    return paymentIntent;
  }
}
