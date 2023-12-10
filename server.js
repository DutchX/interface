import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { FusionSDK, PrivateKeyProviderConnector } from '@1inch/fusion-sdk';
import Web3 from 'web3';

const supportedTokensAddresses = {
  [42161]: {
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    ETH: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    FCTR: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    MUX: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    MUXLP: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    SMLP: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    SUSDCARB: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    SUSDC: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    LUSDC: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    LODE: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    IUSDC: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    SUSDCGMX: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
    PNP: '0x0e3cC2c4FB9252d17d07C67135E48536071735D9',
  },
};

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Enable CORS
function delay(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
// Define your API endpoints here
app.get('/api/place', async (req, res) => {
  console.log('Inside Place Order funciton');

  const makerPrivateKey = '';

  console.log('eee', process.env.VITE_PRIVATE_KEY);
  const makerAddress = '0xeEe5B833d6fA94e661cF2d2359c2749C50D46044';

  const web3 = new Web3('https://arb-mainnet.g.alchemy.com/v2/lkFGfQpATYx05UzRcgRDUalSw6CCSq8a');

  const blockchainProvider = new PrivateKeyProviderConnector(makerPrivateKey, web3);

  const sdk = new FusionSDK({
    url: 'https://fusion.1inch.io',
    network: 42161,
    blockchainProvider,
    authKey: 'h2GIr46Z6Vbkd6223K47FKsHY304dzc7',
  });
  console.log('e');

  try {
    const placedOrder = await sdk.placeOrder({
      fromTokenAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
      toTokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      amount: '10000000000000000000',
      walletAddress: makerAddress,
      preset: 'fast',
    });
    console.log('logging placeholder');
    return res.json(placedOrder);
  } catch (error) {
    console.error(error);
  }
});

// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints here
// Define your API endpoints her

// Define your API endpoints here
app.get('/api/quote', async (req, res) => {
  const url = 'https://fusion.1inch.io';

  const config = {
    headers: {
      Authorization: 'Bearer h2GIr46Z6Vbkd6223K47FKsHY304dzc7',
    },
    params: {
      fromTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      toTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
      amount: '1000000000000000000',
      walletAddress: '0x0000000000000000000000000000000000000000',
      enableEstimate: 'true',
      isLedgerLive: 'false',
    },
  };

  console.log('Get Quote funciton');

  const makerPrivateKey = '';

  // console.log('eee', );
  const makerAddress = '0xeEe5B833d6fA94e661cF2d2359c2749C50D46044';

  const web3 = new Web3('https://arb-mainnet.g.alchemy.com/v2/lkFGfQpATYx05UzRcgRDUalSw6CCSq8a');

  const blockchainProvider = new PrivateKeyProviderConnector(makerPrivateKey, web3);

  console.log('I am inside Quote Fusion SDK impl');

  const sdk = new FusionSDK({
    url: 'https://fusion.1inch.io',
    network: 42161,
    blockchainProvider,
    authKey: 'h2GIr46Z6Vbkd6223K47FKsHY304dzc7',
  });

  try {
    const params = {
      fromTokenAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
      toTokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      amount: '1000000000000000000000',
    };

    const quote = await sdk.getQuote(params);
    return res.json(quote);
  } catch (error) {
    console.error(error);
  }
});

//balance api

app.get('/api/tokens', async (req, res) => {
  const url = `https://api.1inch.dev/token/v1.2/${42161}`;

  const config = {
    headers: {
      Authorization: 'Bearer h2GIr46Z6Vbkd6223K47FKsHY304dzc7',
    },
    params: { addresses: Object.values(supportedTokensAddresses) },
  };
  try {
    const response = await axios.get(url, config);

    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return [];
  }
});

app.get('/api/allTokens', async (req, res) => {
  const url = `https://api.1inch.dev/token/v1.2/${1}`;

  const config = {
    headers: {
      Authorization: 'Bearer h2GIr46Z6Vbkd6223K47FKsHY304dzc7',
    },
    params: {},
  };
  try {
    const response = await axios.get(url, config);

    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
});

//backend
app.get('/api/backedData', async (req, res) => {
  const url = `https://backend.itsakshay.repl.co/lst_yield`;

  const config = {
    headers: {},
    params: {},
  };
  try {
    const response = await axios.get(url, config);

    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return [];
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
