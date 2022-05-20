const axios = require("axios");
const chainInfo = require("./config/cliffnet-chainInfo.json");
const { wasm } = require("./helpers/base");
const { CW20 } = require("./helpers/cw20");
const { CW20Staking } = require("./helpers/cw20-staking");
const { sha256 } = require( "@cosmjs/crypto");
const { fromBase64, Bech32 } = require( "@cosmjs/encoding");
const { encodeBech32Pubkey} = require ("@cosmjs/launchpad");
const { coins } = require("@cosmjs/amino")

async function getPebble(wallet, client) {
  const [account] = await wallet.getAccounts();
  // ensure we have some tokens

  const tokens = await client.getBalance(account.address, chainInfo.feeToken);
  if (tokens.amount === "0") {
    console.log(`Getting ${chainInfo.feeToken} from faucet`);
    await axios.post(chainInfo.faucetUrl, {
      denom: chainInfo.feeToken,
      address: account.address,
    });
  }
}

//validator wasmd vm
// "frame shell exhibit weapon hub social satoshi net february glimpse void salad scale noble salon bachelor steel maple twice tape rate forest since wool"
// - name: validator
//   type: local
//   address: wasm12gm0fm9e5xv6w06fhlphu9mydrz3dr3kpxyjz2
//   pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A84H0z16dAXQCCvk2Y8QEgbllAhQyGxCY0cBFa+zXTI7"}'
//   mnemonic: ""

// --node "https://rpc.cliffnet.cosmwasm.com:443"
// Using a random generated mnemonic
// wasm1vw0gf8uc000h72qxzkdrx2x2u8zzj0ppfq02gd
// osmo1vw0gf8uc000h72qxzkdrx2x2u8zzj0ppt8d0h5
// cosmos1vw0gf8uc000h72qxzkdrx2x2u8zzj0ppru7lpx
const mnemonic = "rifle same bitter control garage duck grab spare mountain doctor rubber cook"; 

async function cw20_base() {
  //Setup
  const vishrut= "wasm1vw0gf8uc000h72qxzkdrx2x2u8zzj0ppfq02gd"
  const [address, client] = await wasm(chainInfo, mnemonic).setup();
  console.log(address);
  const cw20 = CW20(client, chainInfo);
  // console.log(await client.getBalance(vishrut, "native"))

  // Upload Code
  // const codeId = await cw20.upload(address);
  // console.log(codeId);
  // const contracts = await client.getContracts(codeId);
  // console.log(contracts)

  // Initialization wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d, wasm10qkxr5cwgp4mcmtrfpj4a67h36u7xptgypl0krqj0gvngzntvugq4cxuyn
  // const initMsg = {
  //   name: "test",
  //   symbol: "TEST",
  //   decimals: 2,
  //   // list of all validator self-delegate addresses - 100 STARs each!
  //   initial_balances: [
  //     {address: "wasm1vw0gf8uc000h72qxzkdrx2x2u8zzj0ppfq02gd", amount: "100000000"},
  //     {address: "wasm1ppgpwep3yzh8w3d89xlzlens3420j5vs5q3p4j", amount: "100000000"},
  //     {address: "wasm1fnx5jzqsdkntlq2nspjgswtezf45u5ug3kq9sw", amount: "100000000"},
  //   ],
  //   mint: {
  //     minter: address,
  //   },
  // };
  // const contract = await cw20.instantiate(address, 1237, initMsg, "test2");
  // console.log(`Contract: ${contract.contractAddress}`);

  //Query
  const contractAddress = "wasm10qkxr5cwgp4mcmtrfpj4a67h36u7xptgypl0krqj0gvngzntvugq4cxuyn";
  const native = cw20.use(contractAddress);
  console.log(await native.balance('wasm1ppgpwep3yzh8w3d89xlzlens3420j5vs5q3p4j'));
  // console.log(await native.tokenInfo());
  // console.log(await native.minter());

  //Execute
  console.log(await native.transfer(vishrut, 'wasm1ppgpwep3yzh8w3d89xlzlens3420j5vs5q3p4j', "200"))
}


async function cw20_staking() {
  //Setup
  const [address, client] = await useOptions(chainInfo, mnemonic).setup();
  const cw20_staking = CW20Staking(client, chainInfo);
  const cw20 = CW20(client, chainInfo);
  const vishrut= "wasm1vw0gf8uc000h72qxzkdrx2x2u8zzj0ppfq02gd"
  // // Upload Code
  // const codeId = await cw20_staking.upload(address);
  // console.log(codeId);
  // const contracts = await client.getContracts(961);


  // // Initialization wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d
  // const initMsg = {
  //   name: "Native Staking",
  //   symbol: "STK",
  //   decimals: 2,
  //   unbonding_period: {time: 100},
  //   validator: "wasmvaloper173ureakv40v3fx4g6gguy7zkvzcezp3wcgwg49",
  //   min_withdrawal: "50",
  //   exit_tax: "2",
  // };
  // const contract = await cw20_staking.instantiate(address, 961, initMsg, "PNATIVE");
  // console.log(`Contract: ${contract.contractAddress}`);

  //Query
  const staking = cw20_staking.use("wasm1mdhrrcxyjmtz7kk4qvqq563yqha8htemlq0yh8exq2pqjfkew4eqecaqnn");
  const native = cw20.use("wasm1f88ttw9furkuwxmrdhxfa7wr4qk0sn4ujprel6np9wddkszc8nwqjlk4kc");
  console.log("balance: " , await client.getBalance(vishrut, "upebble"));
  console.log(await staking.bond(vishrut, coins(12, "upebble")));
  // console.log(await staking.tokenInfo());

  //Execute
}

async function pubkeyDecodeBase64(){
  const pubkey = {
    type: "tendermint/PubKeyEd25519",
    value: "IjePlgK0Eo5Ic8OyA5fZ9fHXkfAa+qLr3gFH2RuZUHE=",
  };
  
  const bech32Pubkey = encodeBech32Pubkey(pubkey, "wasmvalconspub");
  console.log(bech32Pubkey); // regen:valconspub1zcjduepq3qzy7fy96hq7nllu864q0y9ggy754tfjhd7lrr5s3vk3ghw2ygyspmhej4
  
  const ed25519PubkeyRaw = fromBase64(pubkey.value);
  const addressData = sha256(ed25519PubkeyRaw).slice(0, 20);
  const bech32Address = Bech32.encode("regen:wasm", addressData);
  console.log(bech32Address); // regen:valcons14y3uv3g3fp5k473qtdenmn5cv89y2s5nz7cshu
}

cw20_base()

