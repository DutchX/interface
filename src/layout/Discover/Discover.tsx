import { useEffect, useState } from 'react';

// Utils
import { formatValue } from 'lib/helpers/helpers';
import ReactGA from 'react-ga4';

// Hooks
import { useBoundStore } from 'state/store';
import { useNetwork } from 'wagmi';

// Components
import LayoutHeader from 'components/UI/LayoutHeader/LayoutHeader';

import Swap from 'components/ActionsWidget/Swap';
import Staking from 'components/ActionsWidget/Staking';
import VaultMetrics from 'components/UI/Metrics/VaultMetrics';
import { getLst, getTokenList } from 'lib/constants/utils';
import TabsHeader from 'components/TabsWidget/TabsHeader';

const Discover = () => {
  const [allTokens, setAllTokens] = useState([]);
  const [lst, setLst] = useState<[]>();

  const { chain } = useNetwork();

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname,
      title: 'Discover page',
    });
  }, [chain?.id]);

  useEffect(() => {
    // Define your asynchronous function
    const fetchLstData = async () => {
      try {
        // Your asynchronous logic goes here
        const result = await getLst();

        if (result && result?.length > 0) {
          setLst(result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the asynchronous function only once when the component mounts
    fetchLstData();

    // The empty dependency array [] ensures that this effect runs only once.
  }, []);

  useEffect(() => {
    // Define your asynchronous function
    const fetchData = async (chain: number) => {
      try {
        // Your asynchronous logic goes here
        const result = await getTokenList(chain);

        setAllTokens(Object.values(result));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the asynchronous function only once when the component mounts
    if (allTokens.length == 0 && chain?.id) fetchData(chain?.id);

    // The empty dependency array [] ensures that this effect runs only once.
  }, []);

  const [values, setValues] = useState({
    time: 0,
    percentage: 0,
    autoDeposit: false,
  });
  const [inputToken, setInputToken] = useState('ETH');
  const [outputToken, setOutputToken] = useState('ETH');

  const [selectedOption, setSelectedOption] = useState('ETH');
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

  const [currentTab, setCurrentTab] = useState<String>('Swap');

  let b = [
    {
      apy: 3.98,
      tokenAddress: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      tokenDecimals: 18,
      tokenName: 'Wrapped ETH',
      tokenSymbol: 'wstETH',
    },
  ];

  let test = lst?.length ? lst : b;

  const tokenObject = allTokens
    ? test
        .map((token) => {
          let find = allTokens.find(
            (tok) => tok.symbol.toLowerCase() == token.tokenSymbol.toLowerCase()
          );
          if (find) return find;
        })
        ?.filter((asset) => asset !== undefined)
    : [];

  return (
    <div className="gap-6 page-container">
      <div className={` flex flex-col justify-center items-center `}>
        <div className={` flex flex-col justify-center items-center mb-10`}>
          {/* <Staking /> */}
          <div className="flex flex-row w-full justify-center gap-2 mb-4">
            <div
              className={`w-full h-[44px] font-bold text-center rounded-lg border-none px-2 py-3 uppercase cursor-pointer tracking-widest ${'gradiant-color'} text-lg  font-roboto_normal tracking-[0.75px] transition-all duration-200 `}
              onClick={() => setCurrentTab('Swap')}
            >
              Swap
            </div>
            <div
              className={`w-full h-[44px] font-bold text-center rounded-lg border-none px-2 py-3 uppercase cursor-pointer tracking-widest ${'gradiant-color'} text-lg font-roboto_normal tracking-[0.75px] transition-all duration-200 `}
              onClick={() => setCurrentTab('LSTs')}
            >
              LSTs
            </div>{' '}
            <div
              className={`w-full h-[44px] font-bold text-center rounded-lg border-none px-2 py-3 uppercase cursor-pointer tracking-widest ${'gradiant-color'} text-lg  font-roboto_normal tracking-[0.75px] transition-all duration-200 `}
              onClick={() => setCurrentTab('Stables')}
            >
              Stables
              <div
                className={`w-full h-[44px] text-2xs text-center rounded-lg font-[10px] border-none px-2 py-3 uppercase cursor-pointer tracking-widest ${'gradiant-color'} `}
              >
                {'(coming soon)'}
              </div>
            </div>
          </div>

          {currentTab == 'Swap' && (
            <div className={`mt-8`}>
              <Swap
                setTime={(time) => setValues({ ...values, time })}
                setAutoDeposit={(autoDeposit) => setValues({ ...values, autoDeposit })}
                setPercentage={(percentage) => setValues({ ...values, percentage })}
                percentage={values.percentage}
                time={values.time}
                autoDeposit={values.autoDeposit}
                allTokens={allTokens || []}
                setInputToken={setInputToken}
                setOutputToken={setOutputToken}
                inputToken={inputToken}
                outputToken={outputToken}
              />
            </div>
          )}

          {currentTab == 'LSTs' &&
            test?.map((asset, index) => (
              <div
                key={index}
                className="box-border flex mt-8 flex-row w-[700px] px-4 pt-4 pb-4 bg-white shadow-xl rounded-xl dark:shadow-lg dark:bg-ui_surface mb-2"
              >
                <div className="flex flex-row items-center justify-between">{asset?.tokenName}</div>
                <div className="ml-[100px] mr-[340px]">{'  '}</div>

                <div
                  className="flex  flex-end items-center justify-between ml-4"
                  onClick={() => getLst()}
                >
                  APY: {asset?.apy}%
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Discover;
