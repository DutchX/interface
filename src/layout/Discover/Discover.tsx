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

const Discover = () => {
  const vaults = useBoundStore((state) => state.allVaults);

  const { chain } = useNetwork();

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname,
      title: 'Discover page',
    });
  }, [chain?.id]);

  const [values, setValues] = useState({
    time: 0,
    percentage: 0,
    autoDeposit: false,
  });

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

  const metricData = [
    {
      date: new Date().toISOString().split('T')[0],
      tvl: 100,
      pricePerShare: 1,
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
    <div className="gap-6 page-container">
      <div className={` flex flex-col justify-center items-center `}>
        <LayoutHeader title="Swap" />

        <div className={` flex flex-col justify-center items-center `}>
          {/* <Staking /> */}
          <Swap
            setTime={(time) => setValues({ ...values, time })}
            setAutoDeposit={(autoDeposit) => setValues({ ...values, autoDeposit })}
            setPercentage={(percentage) => setValues({ ...values, percentage })}
            percentage={values.percentage}
            time={values.time}
            autoDeposit={values.autoDeposit}
          />
        </div>
      </div>
    </div>
  );
};

export default Discover;
