const { toUtf8, toBase64 } = require("@cosmjs/encoding");
const { calculateFee } = require("@cosmjs/stargate");
const axios = require("axios");
const fs = require('fs');

const CW20Staking = (client, chainInfo) => {
  const use = (contractAddress) => {
    const balance = async (address) => {
      const result = await client.queryContractSmart(contractAddress, { balance: { address } });
      return result.balance;
    };

    const investment = async (owner, spender) => {
      return client.queryContractSmart(contractAddress, { investment: {} });
    };

    const allowance = async (ownerAddress, spenderAddress, amount) => {
      return client.queryContractSmart(contractAddress, {
        allowance: { owner: ownerAddress, spender: spenderAddress },
      });
    };

    const claims = async (senderAddress) => {
      const accounts = await client.queryContractSmart(contractAddress, {
        claims: { address: senderAddress },
      });
      return accounts.accounts;
    };

    const tokenInfo = async () => {
      return client.queryContractSmart(contractAddress, { token_info: {} });
    };

    // Bond will bond all staking tokens sent with the message and release derivative tokens
    const bond = async (senderAddress, funds, admin) => {
      const fee = calculateFee(Number(chainInfo.fees.exec), chainInfo.gasPrice);
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { bond: {} },
        fee,
        "",
        funds, //coins
      );
      return result.transactionHash;
    };

    // BondAllTokens can only be called by the contract itself, after all rewards have been withdrawn. This is an example of using \"callbacks\" in message flows. This can only be invoked by the contract itself as a return from Reinvest
    const _BondAllTokens = async (funds) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { __bond_all_tokens: {} },
        fee,
        funds, //coins
      );
      return result.transactionHash;
    };

    // Unbond will "burn" the given amount of derivative tokens and send the unbonded staking tokens to the message sender (after exit tax is deducted)
    const unbond = async (amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);
      const result = await client.execute(senderAddress, contractAddress, { unbond: { amount } }, fee);
      return result.transactionHash;
    };

    // Reinvest will check for all accumulated rewards, withdraw them, and re-bond them to the same validator. Anyone can call this, which updates the value of the token (how much under custody).
    const reinvest = async () => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(senderAddress, contractAddress, { reinvest: {} }, fee);
      return result.transactionHash;
    };

    // Claim is used to claim your native tokens that you previously \"unbonded\" after the chain-defined waiting period (eg. 3 weeks)
    const claim = async () => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(senderAddress, contractAddress, { claim: {} }, fee);
      return result.transactionHash;
    };

    // Implements CW20. Transfer is a base message to move tokens to another account without triggering actions
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

    // Implements CW20. Burn is a base message to destroy tokens forever
    const burn = async (senderAddress, amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(senderAddress, contractAddress, { burn: { amount } }, fee);
      return result.transactionHash;
    };

    // Implements CW20 "approval" extension. Allows spender to access an additional amount tokens from the owner's (env.sender) account. If expires is Some(), overwrites current allowance expiration with this one.
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

    // Implements CW20 "approval" extension. Lowers the spender's access of tokens from the owner's (env.sender) account by amount. If expires is Some(), overwrites current allowance expiration with this one.
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

    // Implements CW20 \"approval\" extension. Transfers amount tokens from owner -> recipient if `env.sender` has sufficient pre-approval.
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

    // Implements CW20.  Send is a base message to transfer tokens to a contract and trigger an action on the receiving contract.
    const send = async (senderAddress, contract, amount, msg) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send: { amount, contract, msg: jsonToBinary(msg) } },
        fee,
      );
      return result.transactionHash;
    };

    // Implements CW20 \"approval\" extension. Sends amount tokens from owner -> contract if `env.sender` has sufficient pre-approval.
    const sendFrom = async (senderAddress, owner, contract, amount, msg) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send_from: { owner, contract, amount, msg: jsonToBinary(msg) } },
        fee,
      );
      return result.transactionHash;
    };

    // Implements CW20 \"approval\" extension. Destroys tokens forever
    const burnFrom = async (senderAddress, owner, amount) => {
      const fee = calculateFee(chainInfo.fees.exec, chainInfo.gasPrice);

      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send_from: { owner, amount } },
        fee,
      );
      return result.transactionHash;
    };

    return {
      contractAddress,
      balance,
      allowance,
      tokenInfo,
      claims,
      investment,
      transfer,
      burn,
      increaseAllowance,
      decreaseAllowance,
      transferFrom,
      send,
      sendFrom,
      burnFrom,
      bond,
      _BondAllTokens,
      unbond,
      claim,
      reinvest,
    };
  };

  const downloadWasm = async (url) => {
    const r = await axios.get(url, { responseType: "arraybuffer" });
    if (r.status !== 200) {
      throw new Error(`Download error: ${r.status}`);
    }
    return r.data;
  };

  const upload = async (senderAddress) => {
    const wasm = fs.readFileSync('/Users/vishrutsingh/Documents/contract-test/src/contracts/cw20_staking.wasm');
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

module.exports = { CW20Staking };
