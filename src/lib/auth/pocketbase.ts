import { POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD, VITE_HOSTNAME, VITE_POCKETBASE_URL } from '$env/static/private';
import PocketBase from 'pocketbase';
import type { AuthProvider, User } from './provider';

export class PBAuthenticator implements AuthProvider {
    client: PocketBase;
  
    // establish a pocketbase auth session from an existing cookie if there is one
    constructor(client: PocketBase) {
      this.client = client
    }
  
    // Gets the current logged in user
    public getCurrentUser = async <User>(): Promise<User | null> => {
      try {
        if (this.client.authStore.isValid) {
          const userId = this.client.authStore.record?.id;
          if (userId)
            return await this.client.collection('users').getOne(userId);
        } 
        return null
      } catch (e) {
        console.log("[get current user error]:", e);
        return null;
      }
    }

    // create a user in the system
    public createUserWithEmailPassword = async <User>(email: string, password: string, passwordConfirm: string): Promise<User | null> => {
      try{
        return this.client.collection('users').create({email, password, passwordConfirm});
      } catch(e) {
        console.log("[create user error]:", e);
        return null
      }
    }
  
    // checks emailed link data for valid email verification token proving the user got the verification email
    public verifyUserEmail = async (token: string): Promise<boolean> => {
      try {
        return await this.client.collection('users').confirmVerification(token);
      } catch (e) {
        console.log("[user verification error]: could not verify email", e);
        return false;
      }
    }
  
    // sends a verification email
    public requestEmailVerification = async (email: string): Promise<boolean> => {
      try {
        return await this.client.collection('users').requestVerification(email);
      } catch (e) {
        console.log("[user verification error]: could not send email verification");
        return false;
      }
    }
  
    // log in the user w/ email & password
    public login = async (email: string, password: string): Promise<User | null> => {
      try {
        await this.client.collection('users').authWithPassword(email, password);
        return this.getCurrentUser();
      } catch (e) {
        console.log("[user auth failed]:", e);
        return null;
      }
    }
  
    // log in as superuser for api endpoints that require full table scans w/o user auth to pull up data by some other user attribute (e.g. phone number for twilio endpoints)
    public superuserLogin = async (reason: string, email?: string | null, password?: string | null): Promise<boolean> => {
      try {
        console.log(`[superuser auth initiated]: ${reason}`)
  
        this.client.authStore.clear()
        
        await this.client.collection("_superusers")
          .authWithPassword(email || POCKETBASE_ADMIN_EMAIL, password || POCKETBASE_ADMIN_PASSWORD);
  
        return true;
      } catch (e) {
        console.log("[superuser auth failed]:", e);
        return false
      }
    }
  
    // dumps the pocketbase auth store to a cookie
    public getAuthCookie = (): string => {
      const isProd = process.env.NODE_ENV === 'production' ? true : false;
      try {
  
        return this.client.authStore.exportToCookie({ 
          secure: isProd, 
          sameSite: isProd ? "none" : "lax",  
          domain: isProd ? `.${VITE_HOSTNAME}` : "localhost",
          httpOnly: true 
        })
      } catch (e) {
        console.log("[cookie export error]:", e)
        return ""
      }
    }
  
    // attempt to refresh the auth store and token
    public authRefresh = async (): Promise<void> => {
      if (this.client.authStore.isValid) {
        await this.client.collection('users').authRefresh();
      }
    }

    public authRefreshFromCookie = async (cookie: string): Promise<void> => {
        this.client.authStore.loadFromCookie(cookie)
      }
  
    // log out by clearing the auth store
    public logout = (): void => this.client.authStore.clear();
  }