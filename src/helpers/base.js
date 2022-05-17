const axios = require("axios");
const { SigningCosmWasmClient, Secp256k1HdWallet } = require("cosmwasm");

const useOptions = (chainInfo, mnemonic) => {
  const CreateWallet = async (chainInfo, mnemonic) => {
    // generate if no file exists
    return await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: chainInfo.bech32prefix,
    });
  };

  const connect = async (wallet, chainInfo) => {
    return await SigningCosmWasmClient.connectWithSigner(chainInfo.rpc, wallet, {
      prefix: chainInfo.bech32prefix,
    });
  };

  const hitFaucet = async (faucetUrl, address, denom) => {
    await axios.post(faucetUrl, { denom, address });
  };

  const setup = async () => {
    const wallet = await CreateWallet(chainInfo, mnemonic);
    const client = await connect(wallet, chainInfo);
    const [account] = await wallet.getAccounts();
    // ensure we have some tokens
    if (chainInfo.faucetUrl) {
      const tokens = await client.getBalance(account.address, chainInfo.feeToken);
      console.log(tokens);
      if (tokens.amount === "0") {
        console.log(`Getting ${chainInfo.feeToken} from faucet`);
        await hitFaucet(chainInfo.faucetUrl, account.address, chainInfo.feeToken);
      }
    }

    return [account.address, client];
  };

  return { setup };
};

module.exports = { useOptions };
