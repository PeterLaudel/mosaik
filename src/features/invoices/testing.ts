import { Controller, Get, NotFoundException } from "@nestjs/common";
import { takeLastJsonMail } from "./mail";

/**
 * E2E only (MAIL_TRANSPORT=json): lets tests read the invoice mail that was "sent".
 * Plain HTTP, not part of the contract, and only registered by the module in that mode.
 */
@Controller("testing/emails")
export class SentMailController {
  @Get("last")
  last(): Record<string, unknown> {
    const mail = takeLastJsonMail();
    if (!mail) throw new NotFoundException("No email was sent");
    return mail;
  }
}
