// App
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

// Utils
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { HexAddress, MAX_YEAR } from 'lib/constants';
import { factorToken } from 'lib/constants/tokens';
import { BigDecimal } from 'lib/helpers/BigDecimal';
import { dateOut } from 'lib/helpers/helpers';

// Hooks
import {
  useGetFactorTokenAccountBalance,
  useGetLockedVeTokenInfo,
  useVeTokenAccountBalance,
  useVeTokenIncreaseLockAmount,
  useVeTokenIncreaseUnlockTime,
  useVeTokenLock,
  useVeTokenWithdraw,
} from 'state/governance/hooks';
import { useAccount, useProvider } from 'wagmi';

// Components
import CurrencyInput from 'components/UI/CurrencyInput/CurrencyInput';
import DatePicker from 'components/UI/DatePicker/DatePicker';
import DateSlider from 'components/UI/DateSlider/DateSlider';
import ActionDialog, { ActionDialogProps } from 'components/UI/Dialogs/ActionDialog';
import Loader from 'components/UI/Loader/Loader';
import OutputWithLabel from 'components/UI/OutputWithLabel/OutputWithLabel';

// Assets
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AssetIcon from 'assets/main-logo-blue.svg';
import { ApproveButton } from 'components/UI/ApproveButton/ApproveButton';
import { Button } from 'components/UI/Button/Button';
import config from 'config';
import { useGetTokenAllowance } from 'hooks/useGetTokenAllowance';
import { useTokenApproval } from 'hooks/useTokenApproval';
import HoverableTooltip from 'components/HoverableTooltip';

const Stake = () => {
  // =============================================================
  //                       Component State
  // =============================================================
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [needToApprove, setNeedToApprove] = useState(false);
  const [canCreateLock, setCanCreateLock] = useState(false);
  const [canIncreaseLockAmount, setCanIncreaseLockAmount] = useState(false);
  const [canIncreaseUnlockTime, setCanIncreaseUnlockTime] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const { address: userAddress, isConnected } = useAccount();
  const provider = useProvider();
  const [userOldAmount, setUserOldAmount] = useState<BigDecimal>(BigDecimal.ZERO);
  const [dialogProps, setDialogProps] = useState<ActionDialogProps>({
    isOpen: false,
    type: 'lock',
    status: false,
  } as ActionDialogProps);
  // =============================================================
  //                       Staking State
  // =============================================================
  const [userInputAmount, setUserInputAmount] = useState<BigDecimal>(BigDecimal.ZERO);
  const [previewVeTokenReceived, setPreviewVeTokenReceived] = useState(0);

  const oneWeekOut = useMemo(() => dateOut(new Date(), { days: 7 }), []);
  const [currentBlockTimestamp, setcurrentBlockTimestamp] = useState(0);
  const [selectedDateTimestamp, setSelectedDateTimestamp] = useState({
    step: 0,
    formatted: oneWeekOut.toISOString().substring(0, 10),
    timestamp: Math.round(new Date().getTime() / 1000),
  } as any);
  const [inputInString, setInputInString] = useState('0');

  // =============================================================
  //                       veToken Hooks
  // =============================================================
  const { balance, refetch: refetchAccountBalance } = useVeTokenAccountBalance(
    userAddress as HexAddress
  );

  const { balance: userFactorTokenBalance, refetch: refetchFactorTokenBalance } =
    useGetFactorTokenAccountBalance(userAddress as HexAddress);

  // Check FCTR Allowance
  const { data: allowance, refetch: refetchAllowance } = useGetTokenAllowance({
    tokenAddress: config().addresses.factorToken as HexAddress,
    owner: userAddress as HexAddress,
    spender: config().addresses.veToken as HexAddress,
  });

  const allowanceInBigDecimal = useMemo(
    () => new BigDecimal(allowance || BigNumber.from(0), 18),
    [allowance]
  );

  // Approve FCTR
  const {
    write: approveAsset,
    status: approveStatus,
    txnStatus: approveTxnStatus,
    error: approveError,
    isLoading: isLoadingApprove,
    data: approveData,
  } = useTokenApproval({
    addressERC20: config().addresses.factorToken as HexAddress,
    spender: config().addresses.veToken as HexAddress,
    value: userInputAmount.exact,
    enabled: needToApprove,
  });

  // Incread Unlock Time
  const {
    write: increaseUnlockTime,
    status: increaseUnlockTimeStatus,
    txnStatus: increaseUnlockTimeTxnStatus,
    error: increaseUnlockTimeError,
    isLoading: isLoadingIncreaseUnlockTime,
  } = useVeTokenIncreaseUnlockTime(BigNumber.from(selectedDateTimestamp.timestamp));

  // Increase Amount
  const {
    write: increaseLockAmount,
    status: increaseLockAmountStatus,
    txnStatus: increaseLockAmountTxnStatus,
    error: increaseLockAmountError,
    isLoading: isLoadingIncreaseLockAmount,
  } = useVeTokenIncreaseLockAmount(userInputAmount.exact);

  // veToken Lock
  const {
    write: handleCreateLock,
    status: createLockStatus,
    txnStatus: createLockTxnStatus,
    error: createLockError,
    isLoading: isLoadingCreateLock,
  } = useVeTokenLock(userInputAmount, selectedDateTimestamp.timestamp, isLockEnabled);

  // veToken Locked Amount
  const {
    expiryDateTimestamp: lockExpiryDateTimestamp,
    amount: lockedAmount,
    refetch: refetchVeTokenInfo,
  } = useGetLockedVeTokenInfo(userAddress as HexAddress, balance);

  // Withdraw veToken
  const {
    write: handleWithdraw,
    isLoading: isLoadingWithdraw,
    error: withdrawError,
    status: withdrawStatus,
    txnStatus: withdrawTxnStatus,
  } = useVeTokenWithdraw(canWithdraw);

  // =============================================================
  //                       Additional Functions
  // =============================================================
  const handleInputChanged = (input: string) => {
    setInputInString(input);
    setUserInputAmount(BigDecimal.parse(input, 18));
    setUserOldAmount(BigDecimal.parse(input, 18));
  };

  // Approve check
  const checkNeedToApprove = () => {
    return userInputAmount.simple > allowanceInBigDecimal.simple && userInputAmount.simple > 0;
  };

  // Create Lock check
  const checkCanCreateLock = () => {
    return (
      !needToApprove &&
      lockedAmount.simple === 0 &&
      userFactorTokenBalance.simple > 0 &&
      selectedDateTimestamp.timestamp > currentBlockTimestamp &&
      userInputAmount.simple > 0
    );
  };

  // Can Withdraw veToken
  const checkCanWithdraw = () => {
    if (currentBlockTimestamp === 0) return false;
    return (
      lockedAmount.simple > 0 &&
      lockExpiryDateTimestamp.simple > 0 &&
      currentBlockTimestamp >= lockExpiryDateTimestamp.simple
    );
  };

  const checkCanIncreaseUnlockTime = () => {
    return (
      lockedAmount.simple > 0 &&
      lockExpiryDateTimestamp.simple > currentBlockTimestamp * 1000 &&
      selectedDateTimestamp.timestamp > lockExpiryDateTimestamp.simple &&
      selectedDateTimestamp.timestamp < currentBlockTimestamp * 1000 + MAX_YEAR
    );
  };

  const checkCanIncreaseLockAmount = () => {
    return lockedAmount.simple > 0 && userInputAmount.simple > 0 && !needToApprove;
  };

  const getBlockTimestamp = async () => {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    return block.timestamp;
  };

  const reset = () => {
    setUserInputAmount(BigDecimal.ZERO);
    setPreviewVeTokenReceived(0);
    setSelectedDateTimestamp({
      step: 0,
      formatted: oneWeekOut.toISOString().substring(0, 10),
      timestamp: lockExpiryDateTimestamp.simple,
    } as any);
  };

  // TODO: Move this to a custom hook
  const refetchStakingData = async () => {
    reset();
    refetchAllowance();
    refetchVeTokenInfo();
    refetchAccountBalance();
    refetchVeTokenInfo();
    refetchFactorTokenBalance();
  };

  // Approve FCTR
  const handleApproveToken = async (isUnlimited: boolean) => {
    approveAsset?.();
  };

  const handleOnApproveSuccess = () => {
    setDialogProps({
      isOpen: true,
      type: 'approve',
      status: true,
      amount: approveData,
    } as ActionDialogProps);
    setIsInputDisabled(false);
    refetchStakingData();
    setInputInString('');
  };

  const handleOnApproveError = () => {
    setDialogProps({
      isOpen: true,
      type: 'approve',
      status: false,
      error: approveError,
    } as ActionDialogProps);
    setIsInputDisabled(false);
  };

  // Lock veToken
  const handleVeTokenLock = () => {
    if (userInputAmount.simple > userFactorTokenBalance.simple) {
      setDialogProps({
        isOpen: true,
        type: 'lock',
        status: false,
        error: {
          name: 'Insufficient Balance',
          message: "You don't have enough FCTR to lock",
        },
      } as ActionDialogProps);
      return;
    }

    if (selectedDateTimestamp.timestamp < lockExpiryDateTimestamp.simple) {
      setDialogProps({
        isOpen: true,
        type: 'lock',
        status: false,
        error: {
          name: 'Invalid Date',
          message: "You can't lock for a date before your current lock expires",
        },
      } as ActionDialogProps);
      return;
    }

    setIsLockEnabled(true);
    handleCreateLock?.();
  };

  const handleVeTokenLockSuccess = () => {
    setDialogProps({
      isOpen: true,
      type: 'lock',
      status: true,
      amount: userOldAmount.simple,
    } as ActionDialogProps);
    setIsLockEnabled(false);
    setIsInputDisabled(false);
    setInputInString('');
    refetchStakingData();
  };

  const handleVeTokenLockError = () => {
    setDialogProps({
      isOpen: true,
      type: 'lock',
      status: false,
      error: createLockError,
    } as ActionDialogProps);
    setIsLockEnabled(false);
    setIsInputDisabled(false);
  };

  // Increase Lock Amount
  const handleIncreaseLockAmount = async () => {
    increaseLockAmount?.();
  };

  const handleOnIncreaseLockAmountSuccess = () => {
    setDialogProps({
      isOpen: true,
      type: 'increaseLockAmount',
      status: true,
      amount: userOldAmount.simple,
    } as ActionDialogProps);
    setInputInString('');
    setIsInputDisabled(false);
    refetchStakingData();
  };

  const handleOnIncreaseLockAmountError = () => {
    setDialogProps({
      isOpen: true,
      type: 'increaseLockAmount',
      status: false,
      error: increaseLockAmountError,
    } as ActionDialogProps);
    setIsInputDisabled(false);
  };

  // Increase Unlock Time
  const handleIncreaseUnlockTime = async () => {
    const currentBlockTimestamp = await getBlockTimestamp();
    setcurrentBlockTimestamp(currentBlockTimestamp);
    increaseUnlockTime?.();
  };

  const handleOnIncreaseUnlockTimeSuccess = () => {
    setDialogProps({
      isOpen: true,
      type: 'increaseUnlockTime',
      status: true,
      amount: format(new Date(selectedDateTimestamp.timestamp * 1000), 'dd MMM yyyy'),
    } as ActionDialogProps);
    setIsInputDisabled(false);
    refetchStakingData();
  };

  const handleOnIncreaseUnlockTimeError = () => {
    setDialogProps({
      isOpen: true,
      type: 'increaseUnlockTime',
      status: false,
      error: increaseUnlockTimeError,
    } as ActionDialogProps);
    setIsInputDisabled(false);
  };

  // =============================================================
  //                       Side Effects
  // =============================================================

  // When user input amount changes
  useEffect(() => {
    if (userInputAmount.simple < 0) {
      setUserInputAmount(BigDecimal.ZERO);
    }

    // Approve check
    if (checkNeedToApprove()) {
      setNeedToApprove(true);
    } else {
      setNeedToApprove(false);
    }
    // Create Lock check
    if (checkCanCreateLock()) {
      setCanCreateLock(true);
    } else {
      setCanCreateLock(false);
    }

    // Increase Lock Amount check
    if (checkCanIncreaseLockAmount()) {
      setCanIncreaseLockAmount(true);
    } else {
      setCanIncreaseLockAmount(false);
    }

    // Increase Unlock Time check

    if (checkCanIncreaseUnlockTime()) {
      setCanIncreaseUnlockTime(true);
    } else {
      setCanIncreaseUnlockTime(false);
    }

    // Withdraw check
    if (checkCanWithdraw()) {
      setCanWithdraw(true);
    } else {
      setCanWithdraw(false);
    }
  }, [
    balance.simple > 0,
    userInputAmount.simple,
    lockExpiryDateTimestamp.simple,
    selectedDateTimestamp.timestamp,
    currentBlockTimestamp,
    lockedAmount.simple,
    needToApprove,
    userFactorTokenBalance.simple,
  ]);

  // Approve status Side Effects
  useEffect(() => {
    if (approveStatus === 'success' && approveTxnStatus === 'success') {
      handleOnApproveSuccess();
    }
    if (approveStatus === 'loading' || approveTxnStatus === 'loading') {
      setIsInputDisabled(true);
    }
    if (approveStatus === 'error' || approveTxnStatus === 'error') {
      handleOnApproveError();
    }
  }, [approveStatus, approveTxnStatus]);

  // Lock status Side Effects
  useEffect(() => {
    if (createLockStatus === 'success' && createLockTxnStatus === 'success') {
      handleVeTokenLockSuccess();
    }
    if (createLockStatus === 'loading' || createLockTxnStatus === 'loading') {
      setIsInputDisabled(true);
    }

    if (createLockStatus === 'error' || createLockTxnStatus === 'error') {
      handleVeTokenLockError();
    }
  }, [createLockStatus, createLockTxnStatus]);

  // IncreaseLockAmount status Side Effects
  useEffect(() => {
    if (increaseLockAmountTxnStatus == 'success' && increaseLockAmountStatus == 'success') {
      handleOnIncreaseLockAmountSuccess();
    }
    if (increaseLockAmountStatus == 'loading' || increaseLockAmountTxnStatus == 'loading') {
      setIsInputDisabled(true);
    }
    if (increaseLockAmountStatus === 'error' || increaseLockAmountTxnStatus === 'error') {
      handleOnIncreaseLockAmountError();
    }
  }, [increaseLockAmountStatus, increaseLockAmountTxnStatus]);

  // IncreaseLockTime status Side Effects
  useEffect(() => {
    if (increaseUnlockTimeStatus == 'success' && increaseUnlockTimeTxnStatus == 'success') {
      handleOnIncreaseUnlockTimeSuccess();
    }
    if (increaseUnlockTimeStatus == 'loading' || increaseUnlockTimeTxnStatus == 'loading') {
      setIsInputDisabled(true);
    }
    if (increaseUnlockTimeStatus === 'error' || increaseUnlockTimeTxnStatus === 'error') {
      handleOnIncreaseUnlockTimeError();
    }
  }, [increaseUnlockTimeStatus, increaseUnlockTimeTxnStatus]);

  // Preview veToken received
  useEffect(() => {
    if (userInputAmount.simple === 0) {
      setPreviewVeTokenReceived(0);
      return;
    }
    const timeRemaining = lockExpiryDateTimestamp.simple - Math.round(new Date().getTime() / 1000);
    const amount = (userInputAmount.simple * timeRemaining) / MAX_YEAR;

    if (lockedAmount.simple > 0) {
      setPreviewVeTokenReceived(amount - lockedAmount.simple);
    } else {
      setPreviewVeTokenReceived(amount);
    }
  }, [userInputAmount.simple, lockExpiryDateTimestamp.simple, selectedDateTimestamp.timestamp]);

  // Get current block number asynchronously when the component mounts
  useEffect(() => {
    (async () => {
      const currentBlockTimestamp = await getBlockTimestamp();
      setcurrentBlockTimestamp(currentBlockTimestamp);
    })();
  }, []);

  // =============================================================
  //                       Children Props
  // =============================================================
  const inputProps = {
    title: 'Select Asset',
    icon: AssetIcon,
    balance: userFactorTokenBalance,
    setInputValue: handleInputChanged,
    inputValue: inputInString,
    currentAsset: factorToken,
    isDisabled: isInputDisabled,
    decimals: factorToken.decimals,
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col flex-grow">
        <CurrencyInput {...inputProps} />

        <div className="flex flex-col items-center justify-between w-full gap-0  py-5">
          <div className="flex flex-row items-center justify-between w-full px-2 py-5">
            <div className="flex flex-row items-center">
              <span className="font-medium text-body_light_dark">Lock Expiration Date</span>
              <HoverableTooltip heading="" tooltipContent={<p>Lock Expiration Date</p>} key={'a'} />
            </div>
            <div className="gradiant-border">
              <DatePicker
                selectedDateTimestamp={selectedDateTimestamp}
                setSelectedDateTimestamp={setSelectedDateTimestamp}
                MAX_YEAR={MAX_YEAR}
              />
            </div>
          </div>
          <DateSlider
            selectedDateTimestamp={selectedDateTimestamp}
            setSelectedDateTimestamp={setSelectedDateTimestamp}
            MAX_YEAR={MAX_YEAR}
          />
        </div>
        <OutputWithLabel
          label="Current Lock Expiry Date"
          value={
            lockExpiryDateTimestamp.simple === 0
              ? 'No expiry date'
              : format(new Date(lockExpiryDateTimestamp.simple * 1000), 'dd-MMM-yyyy')
          }
        />
        {previewVeTokenReceived > 0 && (
          <OutputWithLabel
            label="You will receive:"
            value={`${previewVeTokenReceived + balance.simple} veFCTR`}
          />
        )}
      </div>
      {/* Approve Button */}
      {needToApprove && isConnected && (
        <ApproveButton
          disabled={isLoadingApprove && !!userAddress}
          handleOnApprove={handleApproveToken}
          isLoading={isLoadingApprove}
        />
      )}

      {/* IncraseLockAmount Button */}
      {canIncreaseLockAmount && isConnected && (
        <Button
          disabled={isLoadingIncreaseLockAmount && !!userAddress}
          onClick={() => handleIncreaseLockAmount()}
          variant="write-btn"
        >
          {isLoadingIncreaseLockAmount ? (
            <Loader height={50} padding={5} />
          ) : (
            'Increase Lock Amount'
          )}
        </Button>
      )}

      {/* IncraseLockTime Button */}
      {canIncreaseUnlockTime && !canWithdraw && isConnected && (
        <Button
          disabled={isLoadingIncreaseUnlockTime && !!userAddress}
          onClick={() => handleIncreaseUnlockTime()}
          variant="write-btn"
        >
          {isLoadingIncreaseUnlockTime ? (
            <Loader height={50} padding={5} />
          ) : (
            'Increase Unlock Time'
          )}
        </Button>
      )}

      {/* CreateLock Button */}
      {canCreateLock && isConnected && (
        <Button
          disabled={isLoadingCreateLock}
          onClick={() => handleVeTokenLock()}
          variant="write-btn"
        >
          {isLoadingCreateLock ? <Loader height={50} padding={5} /> : 'Lock'}
        </Button>
      )}

      {/* Empty Button */}
      {!needToApprove &&
        !canIncreaseLockAmount &&
        !canIncreaseUnlockTime &&
        !canCreateLock &&
        !canWithdraw &&
        !!userAddress && (
          <Button variant="preview-btn" disabled>
            Please enter valid amount and/or date
          </Button>
        )}

      {!isConnected && (
        <div className="w-full flex justify-center">
          <ConnectButton
            label="Connect Wallet"
            chainStatus="icon"
            accountStatus="address"
            showBalance={false}
          />
        </div>
      )}
      {/* Stake Dialog */}
      <ActionDialog
        type={dialogProps.type}
        isOpen={dialogProps.isOpen}
        status={dialogProps.status}
        error={dialogProps.error}
        amount={dialogProps.amount}
        onClose={() =>
          setDialogProps({
            isOpen: false,
            type: 'lock',
          } as ActionDialogProps)
        }
      />
    </div>
  );
};

export default Stake;
