# Elyra

A non-custodial, AI-assisted crypto trading terminal. A Python service
reads market data and turns it into a BUY/SELL/HOLD signal; a Next.js
frontend shows you that signal and lets you act on it; your own wallet
signs every trade. Nothing here ever holds your funds or your keys.

```
elyra/
├── frontend/    Next.js app — wagmi/RainbowKit for wallet connection,
│                ethers.js for the actual contract calls
├── backend/     FastAPI service — ccxt + CoinGecko market data,
│                pandas feature engineering, scikit-learn signal model
├── contracts/   ElyraTradeExecutor.sol — non-custodial swap executor,
│                Hardhat project (compile/test/deploy)
└── docs/        ARCHITECTURE.md — design rationale + how ccxt, freqtrade,
                 backtrader, nautilus_trader, and OpenBB fit in if you extend this
```

## Quickstart

**Backend**
```bash
cd backend
pip install -r requirements.txt --break-system-packages   # or use a venv
cp .env.example .env
python scripts/train_model.py --symbol BTC/USDT --timeframe 1h --limit 1500
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local   # add a WalletConnect project ID
npm run dev
```

**Contracts**
```bash
cd contracts
npm install
cp .env.example .env   # add an RPC URL + testnet deployer key
npm run compile
npm test
npm run deploy:sepolia
```

Then fill the deployed executor/router addresses into
`frontend/.env.local` and you can trade against testnet from the UI.

## What "secure fund management" means here

Not a vault, not a custodial hot wallet — the executor contract only ever
holds `tokenIn` for the duration of a single atomic transaction, then
sends `tokenOut` straight to your wallet. Full reasoning, plus the other
guardrails (router allowlist, slippage floor, deadline, pause switch), is
in `contracts/README.md` and the contract's own comments.

**This is a starting point, not a finished, audited product.** Read the
"Before this touches real funds" section in `contracts/README.md` and the
"Honest gaps" section in `docs/ARCHITECTURE.md` before pointing this at
real money.

## The model

`backend/app/features.py` builds a standard technical-indicator feature
set (RSI, MACD, Bollinger %B, rolling volatility, volume z-score) purely
in pandas. `backend/app/model.py` trains a RandomForest on top of it and
collapses low-confidence predictions to HOLD rather than guessing. It's
intentionally simple and explainable — swap in a fancier model once you
have a backtested reason to.

Read `docs/ARCHITECTURE.md` for the full picture, including where
freqtrade, backtrader, nautilus_trader, and OpenBB fit in as you go past
this MVP.
