export type Product = {
    description: string;
    price: number;
    label: string;
    stripeID: string;
    type: "subscription";
    credits: number | null;
};

export type SubscriptionStatus = 
  | "active"
  | "canceled"
  | "suspended"
  | "incomplete"
  | "past_due"
  | "unpaid"
  | "trialing"; 

export type Subscription = {
    id: string;
    status: SubscriptionStatus
}
  
export interface PaymentProvider {
    /**
     * Gets an active subscription for the provided email.
     * Returns a provider-specific subscription ID or null if none found.
     */
    getSubscription(email: string): Promise<Subscription | null>;

    /**
     * Cancels an active subscription for the provided email.
     * Returns true if successfully canceled.
     */
    cancelSubscription(email: string): Promise<boolean>;

    /**
     * Reactivates or creates a subscription for the provided email.
     * Returns true if subscription is active.
     */
    reinstateSubscription(email: string): Promise<boolean>;

    /**
     * Creates a checkout session and returns the URL to redirect the user.
     */
    getCheckoutSession(choice: Product, returnPath: string): Promise<string | null>;

    /**
     * Returns available purchase options.
     */
    getProductChoices(): Promise<Product[]>;
}