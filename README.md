# SvelteKit PocketBase Auth Starter Kit

An insanely simple free plug & play setup for those wanting auth/user management in a SvelteKit app with as little pain as possible.

## Getting Started - Local Development
1. Set `VITE_POCKETBASE_URL=http://127.0.0.1:5555` in `sveltekit-pocketbase-starter/.env.local`
2. Startup Option - Makefile
   1. From the `pocketbase` directory, Run `make frontend-up` to bring up the skeleton app and navigate to `/login`
   2. From the `pocketbase` directory, Run `make backend-up` to bring up PocketBase
3. Startup Option - Docker + `npm run dev`
   1.  Start the frontend from this folder with `npm run dev`
   2.  From the `pocketbase` directory, run `docker compose up -d` to bring up pocketbase in a container.
4. Go to the PocketBase UI at `localhost:5555/_/` Set up an account if you haven't or log in, then click "Settings" (tool icon on the far left side)
5. Set "Application name" to whatever you like. "Set Application URL" to `localhost:5173` (we need this for redirect URLs to the SvelteKit pieces later)
6. Add a column called `purchaseIntent` to house the jwt containing info on what product was purchased when stripe calls us back.
7. Add a column for `credits` if you intend to do a la carte type pricing (typical of generative AI type products).
8. Add a column for `subscriptionID` for subscription based services.
   1. This value will get automatically nulled out if a user no longer has an active subscription according to Stripe.
9.  Follow one or both of the flow setup guides below
10. Create routes in `/routes` following standard SvelteKit developer guidance
   1. If you want them to be *protected* i.e. user is logged in to see the page, add the folder to `const protectedRoutes = ['/protected']` in `sveltekit-pocketbase-starter/src/routes/+layout.server.ts`
   2. You can also configure the page an un-authed user gets bounced to (in this example its `/login`)
11. If you intend to do e-commerce stuff see the e-commerce section below. You'll need to set up stripe test stuff. If not, ignore and if you really hate it, nuke the `/routes/buy` folder and all the stuff about nonce in `routes/+layout.server.ts`. 

## Adding to Existing Project
Assumes you have a SvelteKit project as created with `npm create svelte@latest <project name>`
1. `npm i pocketbase`
2. Add the PocketBase type from this project's `app.d.ts` to yours if you use TypeScript
3. Add `Handle` logic from `/hooks.server.ts` to your own `/hooks.server.ts` (create this file if necessary)
4. Add the logic from `/routes/+layout.server.ts` `load` function to your `/routes/+layout.server.ts` (create this file if necessary)
5. Copy the `/routes/callback` `/routes/confirm-verification` and `/routes/login` folders. to your `routes`. If you have a `/routes/login` page, you may need to merge logic. Add styles as required
6. Modify the `protectedRoutes` array in `/routes/+layout.server.ts` to mark any routes you need auth blocked.
7. Follow all the PocketBase setup instructions from `Getting Started - Local Development` at least one `Auth flow` 👇

## ✉️ Email/Password Flow with Confirmation Email
   1. Go to "Mail Settings" and set the "Verification Template" Action URL to `{APP_URL}/confirm-verification/{TOKEN}`
      1. There's a `confirm-verification` folder in the sveltekit-pocketbase-starter SvelteKit project that handles flipping the "verified" flag when a user visits the Action URL from their email.
      2. Check "Use SMTP mail server"
      3. If you're cheap like me and don't want to pay for a SendGrid or Mail Gun you can:
         1. Set up a Gmail Account
         2. In the account settings (click the avatar in the top right and click "Manage Your Google Account") and click Security in the Left Menu
         3. Activate 2-step verification
         4. In the search bar on the top left, search "App Passwords"
         5. Create a new App Password and note it somewhere safe
      4. Set the SMTP server host (smtp.gmail.com if youre doing the cheap way)
      5. Set port to whatever your SMTP provider tells you (587)
      6. Leave the auth methods as their defaults
      7. Provide your username and password from your SMTP provider
         1. If you did the cheap option thats the email for your new gmail account and the app password.

## 🛜 OAuth Flow
   1. Go to your desired OAuth provider's website and follow their instructions for integrating OAuth2
      1. Set the Redirect URI to `http://localhost:5173/callback` 
         1. there's a `callback` folder in sveltekit-pocketbase-starter SvelteKit project that handles the auth code response and requests an access token. This is why we set the "Application URL" earlier
      2. This should result in a Client ID and Client Secret
   2. In PocketBase go to the Auth Providers setting in the left menu
   3. Select the sprocket icon for the auth providers you have set up and plug in the Client ID and Secret (and other information you may need. Microsoft is a more complex example)
   4.  Navigate to `http://localhost:5173/login` 
      1. You can try `http://localhost:5173/protected` and see it kicks you back to `/login` and `/unprotected` and see the page
   5. Attempt login with your OAuth provider
   6. You should be redirected to `http://localhost:5173/` and navigating to `/login` brings you to `/` and `/protected` should reveal a secret

⚠️ Unless you really know what you're doing, avoid messing with `hooks.server.ts` or `routes/login/+page.server.ts` as that's where most of the auth magic happens

## 🚀 Going to Production - Pocketbase
1. Deploy PocketBase to a server per PocketBase instructions. I build and push a docker image with PB on it to ECR and run it on a VM in the cloud (see docker-compose.yml for example)
2. Configure the production PocketBase instance in a similar fashion to local development. The only differences are you'll use your domain instead of localhost `mydomain.com/_` to get into the admin panel for PocketBase and `mydomain.com` for the Application name settings.
3. Add production domains (e.g. mydomain.com/callback) to your OAuth provider callback url list

## Going to Production - Client
1. Deploy your SvelteKit app using your prefered deployment flow. I use Vercel and it deploys off of changes to `main`. 

## 🧠 You Should Know
1. This uses cookie based JWTs and therefore cookies are only shared if you're using https, and only over http (not accessable via javascript). Therefore ensure your frontend and backend share domains.
2. You can set the cookie samesite setting to something other than lax if you don't want to use OAuth. Lax is required for OAuth since your app will be using cookies while talking to 3rd party services.
3. Pocketbase uses a different signing secret per session, so on the backend when validating the JWT on the cookie, a HTTP call to PocketBase via the SDK or their API is required.
4. The design philosophy behind this is to have decent auth working in a fast, repeatable fashion using the cheapest setup possible. This is in no way suggested for enterprise grade auth flows, but if you have less than 10k daily active users it _should_ be fine. If you have 10k daily active users, go get funding and make scale and enterprise shit someone else's problem 😉

## 💰 E-Commerce Stuff
1. Go to stripe and set up an account (I wont even begin to tell you how complicated getting an LLC set up is... legalzoom?).
    * Anyway, stripe lets you create public and secret keys. You'll need a pair for test (usually starting with `sk_test_`) and a pair for production (usually starting with just `sk_`)
    * Now you need to fill out all the paperwork with your EIN from the IRS and add all your support emails and terms and stuff. Do that if you got it. Primarily you need an EIN or your social but that only works if you're doing business as a sole proprietor
    * Finally create some products and put their IDs in the `.env.local` (see `.env-example` for a hint)
2. next create a long-ish string of random garbage to be your JWT signing secret (see `.env-example`)
    * The nonce is a random string of characters we'll include with the product details in a JWT. We'll stick one in the success callback url we give to stripe, so when they call us back after successful payment we'll know that the payment went through. The nonce is associated to a user with other purchase intent data that will be applied to the users account provided the nonce comes back from stripe and matches what we have on file.
    * We associate the nonce to the user as well by saving that in a field in pocketbase
      * speaking of which, make sure you add a `nonce` column to the users table in pocketbase
3. modify `/routes/buy` to the endpoint what your offerings page is called
4. update `offerings` in `/routes/buy/+page.server.ts` to reflect what you're selling. Give price, label and sku. I left my old stuff in there as an example.
5. update the `urls` in `/routes/buy/+page.server.ts` to reflect your prod domains and whatnot. (actually this should be env vars but I'm lazy)
6. Make `/routes/buy/+page.svelte` pretty. Offerings should come out from server so just decorate this page, no need for anything fancy.
7. Fire it up and test. Stripe offers a few test payment card numbers that will let you test the flow. Check that:
   * when you hit the stripe page pocketbase shows the user having a new nonce. You can decode it on jwt.io to make sure its the right selection
   * when you come back from stripe, you have a nonce query string and that it matches what _was_ in pocketbase. pocketbase should show no nonce now.