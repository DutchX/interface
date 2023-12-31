import CurrencyInput from 'components/UI/CurrencyInput/CurrencyInput';
import { BigDecimal } from 'lib/helpers/BigDecimal';
import AssetIcon from 'assets/main-logo-blue.svg';
import SwapRing from 'assets/studio/SwapRing.svg';
import { Button } from 'components/UI/Button/Button';
import { useEffect, useState } from 'react';

import { HexAddress, getQuoteOrder, placeOrder } from 'lib/constants/utils';
import { BigNumber, ethers } from 'ethers';

import { useTokenApproval } from 'hooks/useTokenApproval';
import { useAccount } from 'wagmi';
import { useGetTokenAllowance } from 'hooks/useGetTokenAllowance';
import { ApproveButton } from 'components/UI/ApproveButton/ApproveButton';

interface Props {
  time: number;
  percentage: number;
  setTime: (value: number) => void;
  autoDeposit: boolean;
  setAutoDeposit: (value: boolean) => void;
  setPercentage: (value: number) => void;
  allTokens: any;
  setInputToken: (value: any) => void;
  inputToken: any;
  setOutputToken: (value: any) => void;
  outputToken: any;
}

const oneInchv5 = '0x1111111254EEB25477B68fb85Ed929f73A960582';

const Swap = (props: Props) => {
  const currencyProp = {
    icon: AssetIcon,
    balance: BigDecimal.ZERO,
    inputValue: '00.00',
    currentAsset: {
      name: 'DAI',
      symbol: 'DAI',
      logo: 'DAI',
      decimals: 18,
      address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    },
    isDisabled: false,
    symbol: 'DAI',
    setInputValue: () => {},
    allTokens: props.allTokens,
    setToken: props.setInputToken,
    token: 'DAI',
  };

  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address } = useAccount();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const [data, setData] = useState<any>(null);

  const [needToApprove, setNeedToApprove] = useState(false);
  const [depositAmount, setDepositAmount] = useState<BigNumber>();

  const [isLoadingMetric, setIsLoadingMetric] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [auctionPrice, setAuctionPrice] = useState('');

  const [quoteAmount, setQuoteAmount] = useState<String>();

  const handleDropdownChange = (option: string) => {
    //setSelectedOption(option);
  };
  const [dropdownOptions, setDropdownOptions] = useState([
    {
      title: 'TVL',
    },
  ]);

  const [metricsTheme, setMetricsTheme] = useState({
    type: 'metrics',
  });

  const [toToke, setToToke] = useState<String>();
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

  const {
    write: handleApproveAsset,
    status: approveStatus,
    txnStatus: approveTxnStatus,
    error: approveError,
    isLoading: approveLoading,
  } = useTokenApproval({
    addressERC20: '0x000',
    value: depositAmount || BigNumber.from(0),
    enabled: needToApprove,
    spender: oneInchv5 as HexAddress,
  });

  const { data: allowance, refetch: refetchAllowance } = useGetTokenAllowance({
    tokenAddress: '0x000' as HexAddress,
    owner: address as HexAddress,
    spender: oneInchv5 as HexAddress,
  });

  const handleApproveToken = async (isUnlimited: boolean) => {
    handleApproveAsset?.();
  };

  const currencyPropOut = {
    icon: AssetIcon,
    balance: BigDecimal.ZERO,
    inputValue: quoteAmount,
    currentAsset: {
      name: 'USDC',
      symbol: 'USDC',
      logo: 'USDC',
      decimals: 6,
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    },
    isDisabled: false,
    symbol: 'USDC',
    setInputValue: () => {},
    allTokens: props.allTokens,
    setToken: props.setOutputToken,
    token: 'wstETH',
    useOut: true,
    isCross: false,
  };

  console.log(currencyProp, currencyPropOut);

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <CurrencyInput {...currencyProp} />
        <img
          src={SwapRing}
          className="w-[112px] h-[112px]"
          style={{ marginTop: -40, marginBottom: -50, zIndex: 1 }}
        />
        <CurrencyInput {...currencyPropOut} />
      </div>

      <Button
        variant="write-btn"
        onClick={async () => {
          const value = await getQuoteOrder(props?.inputToken);
          // setToToke(value.param.toTokenAddress)
          setQuoteAmount(ethers.utils.formatUnits(BigNumber.from(value.toTokenAmount), 18));
        }}
      >
        Get Quote
      </Button>

      {needToApprove && isConnected && (
        <ApproveButton
          disabled={!!address}
          handleOnApprove={handleApproveToken}
          isLoading={approveLoading}
        />
      )}

      <Button
        variant="write-btn"
        onClick={() => {
          placeOrder(setOrderStatus, setAuctionPrice);
        }}
      >
        Place Order
      </Button>
      <div>{orderStatus}</div>
      <div>Current Auction price: {auctionPrice}</div>
    </div>
  );
};

export default Swap;
