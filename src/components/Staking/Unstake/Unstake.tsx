import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from 'components/UI/Button/Button';
import ActionDialog, { ActionDialogProps } from 'components/UI/Dialogs/ActionDialog';
import Loader from 'components/UI/Loader/Loader';
import config from 'config';
import { useGetTokenAllowance } from 'hooks/useGetTokenAllowance';
import { HexAddress, ZERO_ADDRESS } from 'lib/constants';
import { useState, useEffect } from 'react';
import { useGetLockedVeTokenInfo, useVeTokenWithdraw } from 'state/governance/hooks';
import { useGetFactorTokenAccountBalance, useVeTokenAccountBalance } from 'state/user/hooks';
import { useAccount, useProvider } from 'wagmi';

const Unstake = () => {
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [currentBlockTimestamp, setcurrentBlockTimestamp] = useState(0);
  const provider = useProvider();
  const [getBlockLoading, setGetBlockLoading] = useState(false);

  const { address: userAddress, isConnected } = useAccount();

  const [dialogProps, setDialogProps] = useState<ActionDialogProps>({
    isOpen: false,
    type: 'lock',
    status: false,
  } as ActionDialogProps);

  const { balance, refetch: refetchAccountBalance } = useVeTokenAccountBalance(
    userAddress as HexAddress
  );

  const { delegatee } = useGetLockedVeTokenInfo(userAddress as HexAddress, balance);

  // Check FCTR Allowance
  const { refetch: refetchAllowance } = useGetTokenAllowance({
    tokenAddress: config().addresses.factorToken as HexAddress,
    owner: userAddress as HexAddress,
    spender: config().addresses.veToken as HexAddress,
  });

  // Withdraw veToken
  const {
    write: handleWithdraw,
    isLoading: isLoadingWithdraw,
    error: withdrawError,
    status: withdrawStatus,
    txnStatus: withdrawTxnStatus,
  } = useVeTokenWithdraw(canWithdraw);

  // veToken Locked Amount
  const {
    expiryDateTimestamp: lockExpiryDateTimestamp,
    amount: lockedAmount,
    refetch: refetchVeTokenInfo,
    isLoading: isLoadingVeTokenInfo,
  } = useGetLockedVeTokenInfo(userAddress as HexAddress, balance);

  const { refetch: refetchFactorTokenBalance } = useGetFactorTokenAccountBalance(
    userAddress as HexAddress
  );

  // TODO: Move this to a custom hook.
  const refetchStakingData = async () => {
    refetchAllowance();
    refetchVeTokenInfo();
    refetchAccountBalance();
    refetchVeTokenInfo();
    refetchFactorTokenBalance();
  };

  // Withdraw veToken
  const handleWithdrawVeToken = () => {
    handleWithdraw?.();
  };

  const handleWithdrawVeTokenSuccess = () => {
    setDialogProps({
      isOpen: true,
      type: 'withdraw',
      status: true,
    } as ActionDialogProps);

    refetchStakingData();
  };

  const handleWithdrawVeTokenError = () => {
    setDialogProps({
      isOpen: true,
      type: 'withdraw',
      status: false,
      error: withdrawError,
    } as ActionDialogProps);
    refetchStakingData();
  };

  // Withdraw status Side Effects
  useEffect(() => {
    if (withdrawStatus === 'success' && withdrawTxnStatus === 'success') {
      handleWithdrawVeTokenSuccess();
    }

    if (withdrawStatus === 'error' || withdrawTxnStatus === 'error') {
      handleWithdrawVeTokenError();
    }
  }, [withdrawStatus, withdrawTxnStatus]);

  useEffect(() => {
    (async () => {
      const currentBlockTimestamp = await getBlockTimestamp();
      setcurrentBlockTimestamp(currentBlockTimestamp);
    })();
  }, []);

  useEffect(() => {
    const checkCanWithdraw = () => {
      if (currentBlockTimestamp === 0) setCanWithdraw(false);
      if (
        lockedAmount.simple > 0 &&
        lockExpiryDateTimestamp.simple > 0 &&
        currentBlockTimestamp >= lockExpiryDateTimestamp.simple
      ) {
        setCanWithdraw(true);
      }
    };

    checkCanWithdraw();
  }, [currentBlockTimestamp, lockedAmount.simple, lockExpiryDateTimestamp.simple]);

  const getBlockTimestamp = async () => {
    setGetBlockLoading(true);
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    setGetBlockLoading(false);
    return block.timestamp;
  };

  const isLoading = isLoadingWithdraw || isLoadingVeTokenInfo || getBlockLoading;
  const canInteract = !!userAddress && canWithdraw && isConnected;

  const loader = <Loader height={50} padding={5} />;
  const withdrawButton = (
    <Button
      className="w-full"
      disabled={isLoading && !canInteract}
      onClick={() => handleWithdrawVeToken()}
      variant={
        delegatee === userAddress || delegatee === ZERO_ADDRESS ? 'write-btn' : 'preview-btn'
      }
    >
      {isLoading ? loader : 'Withdraw'}
    </Button>
  );

  const lockedTokensMessage =
    balance.simple === 0 ? (
      <div className="p-3 body-medium-14">No locked tokens detected.</div>
    ) : (
      <div className="p-3 body-medium-14">
        It appears that your FCTR tokens are currently locked. <br /> <br />
        Please try to withdraw again once your staking period has concluded.
      </div>
    );

  return (
    <>
      <div className="w-full">
        {/* Withdraw Button */}
        {!(delegatee === userAddress || delegatee === ZERO_ADDRESS) && (
          <p className="text-warning">In order to quit or Withdraw you need to Undelegate.</p>
        )}
        {isLoading && loader}
        {!isLoading && canWithdraw && withdrawButton}
        {!isLoading && !canWithdraw && lockedTokensMessage}
      </div>
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
    </>
  );
};

export default Unstake;
