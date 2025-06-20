# 🛠️ Project Setup Guide

This guide will help you configure environment variables, install dependencies, and run the project locally.

---

## 📁 Step 1: Create the `.env` File

In the root directory of your project, create a file named `.env` and add the following environment variables:

```env
# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Coinbase OnchainKit API Key
NEXT_PUBLIC_CDP_API_KEY=

# WalletConnect Project ID
NEXT_PUBLIC_WC_PROJECT_ID=

# Moralis API Key
NEXT_PUBLIC_MORALIS_APY_KEY=

```


🔐 Step 2: How to Get Your API Keys


```env
📊 Google Analytics (NEXT_PUBLIC_GOOGLE_ANALYTICS_ID)
Go to Google Analytics.

Sign in with your Google account.

Create a new property or select an existing one.

Go to Admin → Data Streams and choose your Web stream.

Copy the Measurement ID (starts with G-) and paste it into .env as the value of NEXT_PUBLIC_GOOGLE_ANALYTICS_ID.




🪙 Coinbase OnchainKit (NEXT_PUBLIC_CDP_API_KEY)
Visit the Coinbase Developer Portal.

Sign in or create an account.

Create a new project.

Copy your API Key and paste it into .env as the value of NEXT_PUBLIC_CDP_API_KEY.




🔗 WalletConnect (NEXT_PUBLIC_WC_PROJECT_ID)
Go to WalletConnect Cloud.

Sign in or create an account.

Create a new project.

Copy the Project ID and paste it into .env as the value of NEXT_PUBLIC_WC_PROJECT_ID.



🌐 Moralis (NEXT_PUBLIC_MORALIS_APY_KEY)
Visit Moralis.io.

Sign in or create an account.

In your dashboard, select or create a project.

Copy your API Key and paste it into .env as the value of NEXT_PUBLIC_MORALIS_APY_KEY.

```


📦 Step 3: Install Dependencies
Use Yarn to install all required packages:

```bash
yarn
```


🚀 Step 4: Start the Development Server
Once dependencies are installed, start the development server:

```bash
yarn dev
```
Then open your browser and visit:
http://localhost:3000


✅ Done!
You're all set! If you encounter any issues, double-check your .env values or consult the official documentation for each service.

