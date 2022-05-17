const { toUtf8, toBase64 } = require("@cosmjs/encoding");
const { calculateFee } = require("@cosmjs/stargate");
const axios = require("axios");
const fs = require('fs');

const CW20 = (client, chainInfo) => {
  const use = (contractAddress) => {
    const balance = async (address) => {
      const result = await client.queryContractSmart(contractAddress, { balance: { address } });
      return result.balance;
    };

    const allowance = async (owner, spender) => {
      return client.queryContractSmart(contractAddress, { allowance: { owner, spender } });
    };

    const allAllowances = async (owner, startAfter, limit) => {
      return client.queryContractSmart(contractAddress, {
        all_allowances: { owner, start_after: startAfter, limit },
      });
    };

    const allAccounts = async (startAfter, limit) => {
      const accounts = await client.queryContractSmart(contractAddress, {
        all_accounts: { start_after: startAfter, limit },
      });
      return accounts.accounts;
    };

    const tokenInfo = async () => {
      return client.queryContractSmart(contractAddress, { token_info: {} });
    };

    const minter = async () => {
      return client.queryContractSmart(contractAddress, { minter: {} });
    };

    // mints tokens, returns transactionHash
    const mint = async (senderAddress, recipient, amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { mint: { recipient, amount } },
        fee,
      );
      return result.transactionHash;
    };

    // transfers tokens, returns transactionHash
    const transfer = async (senderAddress, recipient, amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { transfer: { recipient, amount } },
        fee,
      );
      return result.transactionHash;
    };

    // burns tokens, returns transactionHash
    const burn = async (senderAddress, amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(senderAddress, contractAddress, { burn: { amount } }, fee);
      return result.transactionHash;
    };

    const increaseAllowance = async (senderAddress, spender, amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { increase_allowance: { spender, amount } },
        fee,
      );
      return result.transactionHash;
    };

    const decreaseAllowance = async (senderAddress, spender, amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { decrease_allowance: { spender, amount } },
        fee,
      );
      return result.transactionHash;
    };

    const transferFrom = async (senderAddress, owner, recipient, amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { transfer_from: { owner, recipient, amount } },
        fee,
      );
      return result.transactionHash;
    };

    const jsonToBinary = (json) => {
      return toBase64(toUtf8(JSON.stringify(json)));
    };

    const send = async (senderAddress, recipient, amount, msg) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send: { recipient, amount, msg: jsonToBinary(msg) } },
        fee,
      );
      return result.transactionHash;
    };

    const sendFrom = async (senderAddress, owner, recipient, amount, msg) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send_from: { owner, recipient, amount, msg: jsonToBinary(msg) } },
        fee,
      );
      return result.transactionHash;
    };

    return {
      contractAddress,
      balance,
      allowance,
      allAllowances,
      allAccounts,
      tokenInfo,
      minter,
      mint,
      transfer,
      burn,
      increaseAllowance,
      decreaseAllowance,
      transferFrom,
      send,
      sendFrom,
    };
  };


  const upload = async (senderAddress) => {
    const wasm = fs.readFileSync('/Users/vishrutsingh/Documents/contract-test/src/contracts/cw20_base.wasm');
    const fee = calculateFee(Number(chainInfo.fees.upload), chainInfo.gasPrice);
    const result = await client.upload(senderAddress, wasm, fee);
    return result.codeId;
  };

  const instantiate = async (senderAddress, codeId, initMsg, label, admin) => {
    const fee = calculateFee(Number(chainInfo.fees.init), chainInfo.gasPrice);
    const result = await client.instantiate(senderAddress, codeId, initMsg, label, fee, {
      memo: `Init ${label}`,
      admin,
    });
    return use(result.contractAddress);
  };
  return { upload, instantiate, use };
};

module.exports = { CW20 };
