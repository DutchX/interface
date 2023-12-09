import { BigDecimal } from 'lib/helpers/BigDecimal';
import { useEffect, useState } from 'react';
import { Token } from 'state/vault/types';
import Dropdown, { DropdownProps } from '../Dropdown/Dropdown';
import { NumericInput } from '../NumericInput/NumericInput';
import PercentageSelector from '../PercentageSelector/PercentageSelector';
import SymbolLogo from '../SymbolLogo/SymbolLogo';
import LoadingText from '../LoadingText/LoadingText';
import Slider from 'components/UI/Slider';
import { Button } from '../Button/Button';
import External from 'assets/icons/external.svg';

interface CurrencyInputProps {
  balance?: BigDecimal;
  inputValue: string;
  setInputValue: (value: string) => void;
  dropdownOptions?: Token[];
  currentAsset: Token;
  setCurrentAsset?: (value: string) => void;
  isDisabled?: boolean;
  isDropDown?: boolean;
  addButton?: boolean;
  buttonText?: string;
  decimals?: number;
  isLoading?: boolean;
  showPercentage?: boolean;
  symbol?: string;
  percentage?: number;
  setPercentage?: (value: number) => void;
  liquidityLink?: string;
}

const CurrencyInput = (props: CurrencyInputProps) => {
  const [validateMessage, setValidateMessage] = useState('');

  // Input side effects
  useEffect(() => {
    if (props.balance && props.inputValue) {
      const convertInput = BigDecimal.parse(props.inputValue, props.decimals || 18);

      if (convertInput.exact.gt(props.balance.exact)) {
        setValidateMessage('Insufficient Balance');
      } else {
        setValidateMessage('');
      }
    }
  }, [props.inputValue]);

  // =============================================================
  //                       Dropdown Props
  // =============================================================
  const options = props?.dropdownOptions?.map((token) => {
    return {
      title: token.symbol,
      icon: token.logo,
    };
  });

  const dropdownProps: DropdownProps = {
    selectedLabel: props.currentAsset.symbol,
    options: options ? options : [],
    theme: {
      type: 'asset',
      icon: props.currentAsset.logo,
    },
    setSelectedOption: () => {},
  };

  const smybolMap = () => {
    return props.symbol || props.currentAsset.symbol;
  };

  const PERCENTAGE_LABEL = ['0%', '25%', '50%', '75%', '100%'];

  return (
    <div className="box-border flex flex-col w-full px-4 pt-4 pb-4 bg-white shadow-xl rounded-xl dark:shadow-lg dark:bg-ui_surface">
      <div className="flex flex-row items-center justify-between">
        {props.isLoading ? (
          <div className="w-full text-2xl text-left border-none outline-none text-heading_dark">
            <LoadingText />
          </div>
        ) : (
          <NumericInput
            maxDecimals={props.decimals}
            className="w-full text-2xl text-left bg-white border-none outline-none dark:bg-ui_surface heading focus:ring-0"
            type="number"
            disabled={props.isDisabled}
            placeholder="0"
            value={
              props.inputValue.includes('.')
                ? props.inputValue
                : parseFloat(props.inputValue) > 0
                ? props.inputValue
                : ''
            }
            onUserInput={(value: string) => {
              props.setInputValue(value);
            }}
          />
        )}
        {props.isLoading ? (
          <LoadingText />
        ) : props.dropdownOptions ? (
          <Dropdown {...dropdownProps} />
        ) : (
          <div className="flex flex-row gradiant-border">
            <div className="min-w-[124px] text-center bg-white dark:bg-ui_surface_opc p-2  rounded-lg flex flex-row justify-evenly items-center">
              <SymbolLogo
                symbol={props.symbol || props.currentAsset.symbol}
                height={18}
                width={18}
              />
              <p className="font-bold body-regular-15">{smybolMap()}</p>
            </div>
          </div>
        )}
      </div>
      {props.addButton && (
        <Button variant="next-btn" className="ml-3">
          {props.buttonText ? props.buttonText : 'Add'}
        </Button>
      )}

      {props.balance && (
        <>
          <div className="flex flex-col space-x-1">
            {props.balance.exact.gt(0) && (
              <PercentageSelector
                balance={props.balance}
                onPercentageChange={props.setInputValue}
                className="flex flex-row items-center justify-start w-full gap-2 mt-4 "
              />
            )}
            {!validateMessage ? (
              <div className="flex flex-row w-full justify-between mt-4 items-center">
                <p
                  className="text-left cursor-pointer body-medium-14 hover:opacity-70"
                  onClick={(e) => {
                    if (props.balance) {
                      props.setInputValue(props.balance.toReadable());
                    }
                  }}
                >
                  Balance:{' '}
                  {props.balance.exact.gt(0)
                    ? props.balance.toReadable().length > 10
                      ? props.balance.toReadable().substring(0, 10) + '...'
                      : props.balance.toReadable()
                    : '0'}
                </p>
                {props.liquidityLink && (
                  <div className="w-52 flex items-center cursor-pointer justify-end">
                    <span
                      className="underline text-gray-500"
                      onClick={() => {
                        window.open(props.liquidityLink || '', '_blank');
                      }}
                    >
                      Get {smybolMap()}
                    </span>
                    <img src={External} className="w-5 ml-2" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-row items-center justify-between w-full mt-2">
                <p className="text-xs text-left capitalize text-error">{validateMessage ?? ''}</p>
              </div>
            )}
          </div>
        </>
      )}
      {props.showPercentage && (
        <div>
          <Slider
            value={props.percentage ? props.percentage : 0}
            setValue={(value) => (props.setPercentage ? props.setPercentage(value) : '')}
            step={25}
            min={0}
            max={100}
          />
          <div className="flex justify-between">
            {PERCENTAGE_LABEL.map((item) => {
              return <span className="text-xs muted-text">{item}</span>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;
