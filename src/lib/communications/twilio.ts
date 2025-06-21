import twilio, { type Twilio } from 'twilio';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_CREDENTIAL,
  TWILIO_CALLBACK_URL,
  TWILIO_NUMBER
} from '$env/static/private';
import type { CommunicationsProvider, SMSResult, IncomingMessage } from './provider';


export class TwilioCommunicationsProvider implements CommunicationsProvider {
  client: Twilio;

  constructor() {
    this.client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_CREDENTIAL);
  }

  public async sendSMS(to: string, body: string, countryCode = "+1"): Promise<SMSResult> {
    try {
      const from = `${countryCode}${TWILIO_NUMBER}`;
      const resp = await this.client.messages.create({
        body,
        from,
        to: `${countryCode}${to}`
      });
      return {
        success: true,
        messageId: resp.sid
      };
    } catch (e) {
      console.error("[twilio fail]", e);
      return {
        success: false,
        messageId: null
      };
    }
  }

  public validateExtractMessage(url: URL, request: Request): IncomingMessage {
    const twilio_sig = request.headers.get('x-twilio-signature') ?? '';
    const from = url.searchParams.get('From');
    const text = url.searchParams.get('Body');
    const messageId = url.searchParams.get('MessageSid');

    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const isValid = twilio.validateRequest(
      TWILIO_AUTH_CREDENTIAL,
      twilio_sig,
      TWILIO_CALLBACK_URL,
      this.alphabetizeParams(params)
    );

    console.log("twilio valid", isValid);
    return { from, text, messageId, isValid };
  }

  private alphabetizeParams = (params: Record<string, string>): Record<string, string> => {
    const sortedKeys = Object.keys(params).sort();
    const sortedParams: Record<string, string> = {};
  
    for (const key of sortedKeys) {
      sortedParams[key] = params[key];
    }
  
    return sortedParams;
  };
}
