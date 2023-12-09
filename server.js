// // server.js
// import express from 'express';
// import cors from 'cors';
// import axios from 'axios';
// import { stringify } from 'flatted';

// const app = express();
// const port = process.env.PORT || 3001;

// app.use(cors()); // Enable CORS

// // Define your API endpoints here
// app.get('/api/quote', async (req, res) => {
//   const url = 'https://api.1inch.dev/fusion/quoter/v1.0/1/quote/receive';

//   const config = {
//     headers: {
//       Authorization: 'Bearer h2GIr46Z6Vbkd6223K47FKsHY304dzc7',
//     },
//     params: {
//       fromTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
//       toTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
//       amount: '1000000000000000000',
//       walletAddress: '0x0000000000000000000000000000000000000000',
//       enableEstimate: 'true',
//       isLedgerLive: 'false',
//     },
//   };

//   try {
//     const response = await axios.get(url, config);

//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.json({ message: error });
//   }

//   // Your API logic goes here
//   // res.json({ message: 'Hello from the server!' });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

// server.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { FusionSDK, NetworkEnum, PrivateKeyProviderConnector } from '@1inch/fusion-sdk';
import Web3 from 'web3';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Enable CORS

// Define your API endpoints here
app.get('/api/quote', async (req, res) => {
  const url = 'https://api.1inch.dev/fusion/quoter/v1.0/1/quote/receive';

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

  console.log('get quote');
  // const sdk = new FusionSDK({
  //   url: 'https://api.1inch.dev/fusion',
  //   network: NetworkEnum.ARBITRUM,
  //   authKey: 'h2GIr46Z6Vbkd6223K47FKsHY304dzc7',
  // });

  // const params = {
  //   fromTokenAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  //   toTokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  //   amount: '1000000000000000000000',
  // };

  // const quote = await sdk.getQuote(params);

  // console.log(quote, 'eifmemfe');

  const makerPrivateKey = '';
  const makerAddress = '0xeEe5B833d6fA94e661cF2d2359c2749C50D46044';

  const web3 = new Web3('https://arb-mainnet.g.alchemy.com/v2/lkFGfQpATYx05UzRcgRDUalSw6CCSq8a');

  const blockchainProvider = new PrivateKeyProviderConnector(makerPrivateKey, web3);

  const sdk = new FusionSDK({
    url: 'https://api.1inch.dev/fusion',
    network: 42161,
    blockchainProvider,
    authKey: 'h2GIr46Z6Vbkd6223K47FKsHY304dzc7',
  });
  console.log('oooooooo');

  try {
    const response = await sdk.placeOrder({
      fromTokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // dai
      toTokenAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // USDC
      amount: '10000000', // 0.05 dai
      walletAddress: makerAddress,
      // fee is an optional field
    });
    console.log('edefefefefefef', response);
    //res.json(response.data);
  } catch (error) {
    console.log('error', error);
    // res.json({ data: error });
  }

  // try {
  //   const response = await axios.get(url, config);

  //   res.json(response.data);
  // } catch (error) {
  //   console.error(error);
  //   res.json({ message: error });
  // }

  // Your API logic goes here
  // res.json({ message: 'Hello from the server!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
