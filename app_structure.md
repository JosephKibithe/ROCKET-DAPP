# ROCKET Web3 Prediction Market Application Structure

```
rocket-web3/
├── .next/                      # Next.js build output
├── lib/                        # Global libraries
├── node_modules/               # Node.js dependencies
├── public/                     # Static assets
├── scripts/                    # Utility scripts
├── contracts/                  # Solidity smart contracts
│   ├── Lock.sol                # Example contract
│   └── PredictionMarket.sol    # Main prediction market contract
├── cache/                      # Hardhat cache
├── artifacts/                  # Hardhat compiled contracts
├── supabase/                   # Supabase configuration
├── ignition/                   # Deployment configuration
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public routes
│   │   │   └── page.jsx        # Landing page
│   │   ├── api/                # API routes
│   │   ├── browse/             # Browse predictions
│   │   │   └── page.jsx        # Main feed page
│   │   ├── meme-generator/     # Meme generation feature
│   │   ├── ipfs-test/          # IPFS upload testing
│   │   ├── globals.css         # Global styles
│   │   ├── tailwind.css        # Tailwind imports
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # App entry point
│   │   └── test.tsx            # Testing page
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI components
│   │   ├── CategoriesPanel.jsx # Filter categories
│   │   ├── EventListenersWrapper.tsx
│   │   ├── Web3Provider.jsx    # Blockchain connection provider
│   │   ├── MemeEngine.jsx      # Meme creation component
│   │   ├── IpfsUploadTest.jsx  # IPFS upload component
│   │   ├── BetCreationForm.jsx # Form for creating new predictions
│   │   └── LiveBetFeed.jsx     # Real-time feed of predictions
│   └── lib/                    # Application-specific libraries
├── .env.local                  # Environment variables
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore file
├── components.json             # ShadCN UI components config
├── hardhat.config.js           # Hardhat blockchain config
├── next.config.js              # Next.js configuration
├── next.config.ts              # TypeScript Next.js config
├── package.json                # Node.js dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── postcss.config.mjs          # PostCSS module config
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint configuration
├── next-env.d.ts               # Next.js TypeScript declarations
└── README.md                   # Project documentation
```

## Key Features

1. **Smart Contract Backend**

   - PredictionMarket.sol - Smart contract for creating and resolving predictions

2. **Web Application**

   - Landing page with project overview
   - Browse page with live prediction feed
   - Wallet integration for blockchain transactions
   - Meme generator for sharing prediction outcomes

3. **Key Components**

   - Web3Provider - Handles wallet connections
   - LiveBetFeed - Real-time prediction updates
   - BetCreationForm - Interface for creating new predictions
   - CategoriesPanel - Filtering system for predictions

4. **Technology Stack**
   - Frontend: Next.js 14, TailwindCSS, ShadCN UI
   - Backend: Ethereum (Solidity), Supabase
   - Storage: IPFS for decentralized asset storage
   - Authentication: Wallet Connect, OAuth options

## User Flow

1. Anonymous users can browse predictions
2. Authentication required for placing predictions
3. Wallet connection for on-chain interactions
4. Four-step wizard for creating new predictions
5. Dashboard for managing predictions and rewards
6. Meme generation for sharing outcomes
