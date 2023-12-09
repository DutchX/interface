// App
import { useEffect, useMemo, useState } from 'react';

// Utils
import { HexAddress, ZERO_ADDRESS } from 'lib/constants';
import { BigDecimal } from 'lib/helpers/BigDecimal';

// Components
import ActionDialog, { ActionDialogProps } from 'components/UI/Dialogs/ActionDialog';
import Loader from 'components/UI/Loader/Loader';
import OutputWithLabel from 'components/UI/OutputWithLabel/OutputWithLabel';

// Hooks
import {
  useVeTokenQuitLock,
  useGetFactorTokenPenaltyAmount,
  useGetLockedVeTokenInfo,
  useVeTokenAccountBalance,
} from 'state/governance/hooks';
import { useAccount } from 'wagmi';
import { Button } from 'components/UI/Button/Button';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Quit = () => {
  // =============================================================
  //                       Component State
  // =============================================================
  const [isQuitDisabled, setIsQuitDisabled] = useState(false);
  const [canQuitLock, setCanQuitLock] = useState(false);
  const { address: userAddress, isConnected } = useAccount();
  const [dialogProps, setDialogProps] = useState<ActionDialogProps>({
    isOpen: false,
    type: 'quitLock',
    status: false,
  } as ActionDialogProps);

  // =============================================================
  //                       Quit & veToken Hooks
  // =============================================================
  const {
    write: quitLock,
    status: quitLockStatus,
    txnStatus: quitLockTxnStatus,
    isLoading: isQuitLockLoading,
    error: quitLockError,
  } = useVeTokenQuitLock();
  const { balance } = useVeTokenAccountBalance(userAddress as HexAddress);
  const { amount: veFctrStaked, refetch: refetchVeTokenInfo } = useGetLockedVeTokenInfo(
    userAddress as HexAddress,
    balance
  );

  const { delegatee } = useGetLockedVeTokenInfo(userAddress as HexAddress, balance);

  const { refetch: refetchBalance } = useVeTokenAccountBalance(userAddress as HexAddress);

  const { penalty: penaltyAmount, refetch: refetchFCTRPenaltyAmount } =
    useGetFactorTokenPenaltyAmount(veFctrStaked);

  // =============================================================
  //                       Additional Functions
  // =============================================================
  const refetchQuitLockData = () => {
    refetchVeTokenInfo();
    refetchFCTRPenaltyAmount();
    refetchBalance();
  };

  const handleQuitLock = () => {
    setIsQuitDisabled(true);
    quitLock?.();
  };

  const handleQuitLockSuccess = () => {
    setIsQuitDisabled(false);
    setDialogProps({
      isOpen: true,
      type: 'quitLock',
      status: true,
    } as ActionDialogProps);
    setCanQuitLock(false);
    refetchQuitLockData();
  };

  const handleQuitLockError = () => {
    setIsQuitDisabled(false);
    setDialogProps({
      isOpen: true,
      type: 'quitLock',
      status: false,
      error: quitLockError,
    } as ActionDialogProps);
    refetchQuitLockData();
  };

  // Get remaining amount, formula : (staked - penaltyAmount)
  const remainingAmount = useMemo(
    () =>
      penaltyAmount.simple && veFctrStaked.simple && penaltyAmount.simple
        ? new BigDecimal(veFctrStaked.exact.sub(penaltyAmount.exact), 18)
        : BigDecimal.ZERO,
    [penaltyAmount.simple, veFctrStaked.simple, penaltyAmount.simple]
  );

  // =============================================================
  //                       Side Effects
  // =============================================================

  // Quit Lock status side effects
  useEffect(() => {
    if (quitLockStatus == 'success' && quitLockTxnStatus == 'success') {
      handleQuitLockSuccess();
    }
    if (quitLockStatus == 'loading' || quitLockTxnStatus == 'loading') {
      setIsQuitDisabled(true);
    }

    if (quitLockStatus === 'error' || quitLockTxnStatus === 'error') {
      handleQuitLockError();
    }
  }, [quitLockStatus, quitLockTxnStatus]);

  // Check if user has a lock
  useEffect(() => {
    if (veFctrStaked.simple > 0) {
      setCanQuitLock(true);
    }
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col flex-grow">
        <div className="w-full mt-4 mb-4 ml-1 text-body_light_dark">
          <p>Withdraw the token with a penalty before reaching the unlock time</p>
        </div>
        <OutputWithLabel
          label="Penalty amount:"
          value={`${penaltyAmount?.simple.toString()} FCTR`}
        />
        <OutputWithLabel
          label="Adjusted withdraw amount (after penalty)"
          value={`${remainingAmount?.simple.toString()} FCTR`}
        />
      </div>

      {/* Buttons */}
      {!(delegatee === userAddress || delegatee === ZERO_ADDRESS) && (
        <p className="text-warning">You need to Undelegate, if you want to quit or withdraw </p>
      )}
      {canQuitLock && isConnected && (
        <Button
          disabled={isQuitDisabled || !(delegatee === userAddress || delegatee === ZERO_ADDRESS)}
          onClick={() => handleQuitLock()}
          variant="error-btn"
        >
          {isQuitLockLoading ? <Loader height={50} padding={5} /> : 'Quit Lock'}
        </Button>
      )}

      {!canQuitLock && isConnected && (
        <Button variant="preview-btn" disabled>
          No lock
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

      {/* Quit Lock Dialog */}
      <ActionDialog
        type={dialogProps.type}
        isOpen={dialogProps.isOpen}
        status={dialogProps.status}
        error={dialogProps.error}
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

export default Quit;
