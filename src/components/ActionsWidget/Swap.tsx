import CurrencyInput from 'components/UI/CurrencyInput/CurrencyInput';
import { BigDecimal } from 'lib/helpers/BigDecimal';
import AssetIcon from 'assets/main-logo-blue.svg';
import SwapRing from 'assets/studio/SwapRing.svg';
import { Button } from 'components/UI/Button/Button';
import AutoFunction from 'components/AutoFunction';
import Card from 'components/Studio/Card';
import { useEffect, useState } from 'react';
import DropDownInfo from 'components/DropDownInfo';
import Dropdown from 'components/UI/Dropdown/Dropdown';
import { FusionSDK, NetworkEnum } from '@1inch/fusion-sdk';
import {
  getAuctionOrders,
  getFusionSDK,
  getQuote,
  getQuoteOrder,
  placeOrder,
} from 'lib/constants/utils';
import VaultMetrics from 'components/UI/Metrics/VaultMetrics';
import { BigNumber, ethers } from 'ethers';

interface Props {
  time: number;
  percentage: number;
  setTime: (value: number) => void;
  autoDeposit: boolean;
  setAutoDeposit: (value: boolean) => void;
  setPercentage: (value: number) => void;
}

const CARDS = [
  {
    value: 'Moderate',
    title: 'Price Impact',
    color: '#F5945F',
  },
  {
    value: '1%',
    title: 'Max Slippage',
  },
  {
    value: 'High',
    title: 'Swap Gas Fee',
    color: '#FD7972',
  },
];

const Swap = (props: Props) => {
  const currencyProp = {
    icon: AssetIcon,
    balance: BigDecimal.ZERO,
    inputValue: '00.00',
    currentAsset: {
      name: 'ETH',
      symbol: 'ETH',
      logo: 'ETH',
      decimals: 18,
      address: '',
    },
    isDisabled: false,
    symbol: 'ETH',
    setInputValue: () => {},
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // const handleOneInchData = () => {
  //   try {
  //     const response = getQuote();

  //     setData(response);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Define an asynchronous function within useEffect
    const fetchData = async () => {
      try {
        const response = await getQuote();

        setData(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the asynchronous function
    fetchData();
  }, []); // Empty dependency array means the effect runs once when the component mounts

  const [selectedOption, setSelectedOption] = useState('Share Price');
  const [isLoadingMetric, setIsLoadingMetric] = useState(false);

  const handleDropdownChange = (option: string) => {
    setSelectedOption(option);
  };
  const [dropdownOptions, setDropdownOptions] = useState([
    {
      title: 'TVL',
    },
  ]);

  const [metricsTheme, setMetricsTheme] = useState({
    type: 'metrics',
  });

  const metricData = data?.presets
    ? [
        {
          date: Date.now(),
          value: ethers.utils.formatUnits(data.presets.fast.auctionStartAmount),
        },
        {
          date: Date.now() + data.presets.fast.points[0].delay,
          value: ethers.utils.formatUnits(
            BigNumber.from(data.presets.fast.auctionStartAmount).sub(
              BigNumber.from(data.presets.fast.points[0].coefficient)
            )
          ),
        },
      ]
    : [
        {
          date: new Date(),
          value: '0',
        },
      ];

  const MetricsProps = {
    title: 'Dutch Auction Price',
    dropdown: {
      selectedLabel: 'selectedOption',
      setSelectedOption: handleDropdownChange,
      options: dropdownOptions,
      theme: metricsTheme,
    },
    price: '100',
    tvl: '100',
    apy: `${100}%`,

    metricData: metricData,
    isLoading: isLoadingMetric,
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <CurrencyInput {...currencyProp} />
        <img
          src={SwapRing}
          className="w-[112px] h-[112px]"
          style={{ marginTop: -40, marginBottom: -50, zIndex: 1 }}
        />
        <CurrencyInput {...currencyProp} />
      </div>
      <div className="flex justify-between my-5 gap-5">
        {CARDS.map((item) => {
          return <Card title={item.value} description={item.title} color={item.color} />;
        })}
      </div>

      <Button
        variant="write-btn"
        onClick={() => {
          getQuoteOrder();
        }}
      >
        Get Quote
      </Button>

      <Button
        variant="write-btn"
        onClick={() => {
          placeOrder();
        }}
      >
        Place Order
      </Button>

      <Dropdown
        bordered
        width="100%"
        placeHolder={'Advanced Menu'}
        options={[]}
        theme={{ type: 'asset' }}
        selectedLabel={''}
        setSelectedOption={() => {}}
      />

      {/* <VaultMetrics {...MetricsProps} /> */}
    </div>
  );
};

export default Swap;
