import React, { useEffect, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import Text, {
  TextVariant,
} from '../../../../../../../component-library/components/Texts/Text';
import { useSelector } from 'react-redux';
import { strings } from '../../../../../../../../locales/i18n';
import {
  useAppThemeFromContext,
  mockTheme,
} from '../../../../../../../util/theme';
import ConnectHeader from '../../../../../../UI/ConnectHeader';
import ContractBox from '../../../../../../../component-library/components-temp/Contracts/ContractBox';
import createStyles from './VerifyContractDetails.styles';
import { VerifyContractDetailsProps } from './VerifyContractDetails.types';
import { findBlockExplorerForRpc } from '../../../../../../../util/networks';
import { RPC } from '../../../../../../../constants/network';
import TransactionTypes from '../../../../../../../core/TransactionTypes';
import { safeToChecksumAddress } from '../../../../../../../util/address';
import { selectTokens } from '../../../../../../../selectors/tokensController';
import { selectIsEvmNetworkSelected } from '../../../../../../../selectors/multichainNetworkController';

const {
  ASSET: { ERC20, ERC1155, ERC721 },
} = TransactionTypes;

const VerifyContractDetails = ({
  contractAddress,
  closeVerifyContractView,
  copyAddress,
  toggleBlockExplorer,
  showNickname,
  tokenAddress,
  savedContactListToArray,
  providerType,
  providerRpcTarget,
  networkConfigurations,
  tokenStandard,
  tokenSymbol,
}: VerifyContractDetailsProps) => {
  const [contractNickname, setContractNickname] = React.useState<string>('');
  const [tokenNickname, setTokenNickname] = React.useState<string>('');
  const { colors } = useAppThemeFromContext() || mockTheme;
  const styles = createStyles(colors);

  const tokens = useSelector(selectTokens);

  const isEvmSelected = useSelector(selectIsEvmNetworkSelected);

  const tokenData = useMemo(
    () =>
      tokens.filter(
        // TODO: Replace "any" with type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token: any) => token.address === safeToChecksumAddress(tokenAddress),
      ),
    [tokens, tokenAddress],
  );

  useEffect(() => {
    if (tokenSymbol) {
      setTokenNickname(tokenSymbol);
    }
  }, [tokenSymbol]);

  useEffect(() => {
    // TODO: Replace "any" with type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    savedContactListToArray.forEach((contact: any) => {
      if (contact.address === safeToChecksumAddress(contractAddress)) {
        setContractNickname(contact.name);
      }
      if (contact.address === safeToChecksumAddress(tokenAddress)) {
        setTokenNickname(contact.name);
      }
    });
  }, [contractAddress, tokenAddress, savedContactListToArray]);

  const showBlockExplorerIcon = useCallback(() => {
    if (providerType === RPC && isEvmSelected) {
      return findBlockExplorerForRpc(providerRpcTarget, networkConfigurations);
    }
    return true;
  }, [providerType, providerRpcTarget, networkConfigurations, isEvmSelected]);

  const hasBlockExplorer = showBlockExplorerIcon();

  return (
    <View style={styles.container}>
      <ConnectHeader
        action={closeVerifyContractView}
        title={strings(
          'contract_allowance.token_allowance.verify_third_party_details',
        )}
      />
      <Text style={styles.description}>
        <Text variant={TextVariant.BodyMD} style={styles.text}>
          {strings('contract_allowance.token_allowance.protect_from_scams')}
        </Text>
      </Text>
      <View>
        <Text variant={TextVariant.BodySM} style={styles.title}>
          {tokenStandard === ERC20
            ? strings('contract_allowance.token_allowance.token_contract')
            : tokenStandard === ERC721 || tokenStandard === ERC1155
            ? strings('contract_allowance.token_allowance.nft_contract')
            : strings('contract_allowance.token_allowance.address')}
        </Text>
        <View style={styles.contractSection}>
          <ContractBox
            contractAddress={tokenAddress}
            contractPetName={tokenNickname}
            onCopyAddress={() => copyAddress(tokenAddress)}
            onExportAddress={() => toggleBlockExplorer(tokenAddress)}
            contractLocalImage={
              tokenData.length ? { uri: tokenData[0]?.image } : undefined
            }
            hasBlockExplorer={Boolean(hasBlockExplorer)}
            onContractPress={() => showNickname(tokenAddress)}
          />
        </View>
        <Text variant={TextVariant.BodySM} style={styles.title}>
          {strings(
            'contract_allowance.token_allowance.third_party_requesting_text',
            {
              action:
                tokenStandard === ERC20
                  ? strings('contract_allowance.token_allowance.spending_cap')
                  : tokenStandard === ERC721 || tokenStandard === ERC1155
                  ? strings('contract_allowance.token_allowance.access')
                  : '',
            },
          )}
        </Text>
        <View style={styles.contractSection}>
          <ContractBox
            contractAddress={contractAddress}
            contractPetName={contractNickname}
            onCopyAddress={() => copyAddress(contractAddress)}
            onExportAddress={() => toggleBlockExplorer(contractAddress)}
            onContractPress={() => showNickname(contractAddress)}
            hasBlockExplorer={Boolean(hasBlockExplorer)}
          />
        </View>
      </View>
    </View>
  );
};
export default VerifyContractDetails;
