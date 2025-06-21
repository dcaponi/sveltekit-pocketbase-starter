import type { SubscriptionStatus } from "$lib/payments/provider"

export interface AuthProvider {
    getCurrentUser <User>(): Promise<User | null>
    verifyUserEmail (token: string): Promise<boolean>
    requestEmailVerification(email: string): Promise<boolean>
    login(email: string, password: string): Promise<User | null>
    superuserLogin(reason: string, email?: string | null, password?: string | null): Promise<boolean>
    logout(): void
    getAuthCookie(): string
    authRefresh(): Promise<void>
  }

  export type User = {
    id: string;
    email: string;
    name: string;
    phone: string;
    threadID: string;
    lastSummarizedAt: Date;
    phoneVerified: boolean
    loggedIn: boolean;
    verified: boolean;
    credits: number;
    subscriptionStatus: SubscriptionStatus;
}