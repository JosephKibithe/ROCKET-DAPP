# ROCKET Web3 Prediction Market

A decentralized prediction market built on PulseChain and Ethereum, allowing users to create and participate in prediction markets.

## Features

- Connect with MetaMask, WalletConnect, or Coinbase Wallet
- Web3 wallet-based authentication
- Create and participate in prediction markets
- Real-time updates with Supabase Realtime
- Meme generation for winning predictions
- Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn or npm
- MetaMask extension (for local testing)
- WalletConnect Project ID (for wallet connections)
- Supabase account (for database and auth)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/rocket-web3.git
   cd rocket-web3
   ```

2. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` to add your:

   - WalletConnect Project ID (get from https://cloud.walletconnect.com)
   - Supabase URL and keys
   - Contract addresses (if deployed)

4. Run the development server:

   ```bash
   yarn dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Wallet Connection Setup

The app uses web3 wallets for both authentication and transactions:

1. **MetaMask**: No additional setup required for users with the MetaMask extension installed
2. **WalletConnect**: Requires a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
3. **Coinbase Wallet**: No additional setup required

To enable WalletConnect:

1. Sign up at [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the project ID to your `.env.local` file:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

## Web3 Authentication

ROCKET uses Web3 wallets exclusively for authentication, offering several benefits:

- No password to remember or reset
- Enhanced security through cryptographic signatures
- Direct integration with blockchain transactions
- Simplified user experience

### Database Schema for Web3 Authentication

The application stores wallet data in the following tables:

- `wallet_users`: Stores user profile info associated with wallet addresses
- `wallet_stakes`: Records user predictions and stakes
- `bets`: Contains prediction markets (linked to creator wallets)

To set up the database schema:

1. Run the migration script in `supabase/migrations/0001_web3_auth.sql`
2. This will create the necessary tables, indexes, and functions

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/contracts` - Solidity smart contracts
- `/lib` - Utility functions and configuration
- `/public` - Static assets
- `/styles` - Global CSS and Tailwind configuration
- `/supabase` - Database schema, migrations, and functions

## Testing

Run tests with:

```bash
yarn test
# or
npm test
```

Run wallet connection tests separately:

```bash
yarn test:wallet
# or
npm run test:wallet
```

## Deployment

1. Build the project:

   ```bash
   yarn build
   # or
   npm run build
   ```

2. Deploy to Vercel:
   ```bash
   vercel deploy
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Wagmi](https://wagmi.sh/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadcnUI](https://ui.shadcn.com/)
