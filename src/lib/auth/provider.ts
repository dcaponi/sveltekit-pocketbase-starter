import type { SubscriptionStatus } from "$lib/payments/provider"

export interface AuthProvider {
  getCurrentUser (): Promise<User | null>
  verifyUserEmail (token: string): Promise<boolean>
  requestEmailVerification(email: string): Promise<boolean>
  login(email: string, password: string): Promise<User | null>
  createUserWithEmailPassword(email: string, password: string, passwordConfirm: string): Promise<User | null>
  listThirdPartyAuthMethods(): Promise<AuthMethodOptions>
  getOauth2AccessToken(providerName: string, code: string, codeVerifier: string): Promise<User | null>
  superuserLogin(reason: string, email?: string | null, password?: string | null): Promise<boolean>
  logout(): void
  getAuthCookie(): string
  authRefresh(): Promise<void>
  authRefreshFromCookie(cookie: string): Promise<void>
}

export interface TokenHandler {
  getToken(provider: string): Promise<Token | null>
  setToken(provider: string, accessToken: string, refreshToken: string): Promise<User | null>
}

export interface Authable {
  reauth(provider: TokenHandler): Promise<Token | null>
}

export type Token = {
  provider: string;
  accessToken: string;
  refreshToken: string;
}

export type Provider = "spotify"

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
  tokens: Record<Provider, Token> | null; // todo pull into own type if this gets big
}

export type AuthMethodOptions = { 
[key: string]: {
  authProviderRedirect: string;
  authProviderState: string;
  authCodeVerifier: string;
}};