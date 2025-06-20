export type SMSResult = {
    success: boolean;
    messageId: string | null;
  };
  
  export type IncomingMessage = {
    from: string | null;
    text: string | null;
    messageId: string | null;
    isValid: boolean;
  };
  
  export interface CommunicationsProvider {
    /**
     * Sends an SMS to the given number.
     * @param to Recipient phone number (international format or local without +)
     * @param body Message text
     * @param countryCode Optional country code, defaults to "+1"
     */
    sendSMS(to: string, body: string, countryCode?: string): Promise<SMSResult>;
  
    /**
     * Validates and extracts an incoming message.
     * @param url The URL containing query params from Twilio
     * @param request The incoming HTTP request
     */
    validateExtractMessage(url: URL, request: Request): IncomingMessage;
  }