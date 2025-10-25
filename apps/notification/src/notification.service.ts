import { Injectable } from '@nestjs/common';
import { NotifyEmailDto } from './dto/notify-email.dto';

@Injectable()
export class NotificationService {
  async notifyEmail({ email }: NotifyEmailDto) {
    console.log(email);
  }
}
