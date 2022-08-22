const axios = require("axios");
const retry = require("../helper/retry");

// https://explorer.stacks.co/txid/SP213KNHB5QD308TEESY1ZMX1BP8EZDPG4JWD0MEA.fari-vault?chain=mainnet
// https://stacks-node-api.blockstack.org/extended/v1/address/SP213KNHB5QD308TEESY1ZMX1BP8EZDPG4JWD0MEA.fari-vault/balances
const FARI_API = "https://api.bitfari.com/";

async function fetch() {
  const url = `${FARI_API}/pool_token_stats`;
  const fariStatsResponse = (await retry(async () => await axios.get(url)))
    .data;

  const valueLockedMap = {};
  let totalValueLocked = 0;
  for (const pool of fariStatsResponse) {
    let poolValue = 0;
    const poolToken = pool.pool_token;

    if (poolToken == "fari-token-mn::fari") {
      poolValue = pool.price * pool.reserved_balance;
    } else {
      poolValue = pool.price * pool.total_supply;
    }
    totalValueLocked += poolValue;
    valueLockedMap[poolToken] = poolValue;
  }

  return totalValueLocked;
}

async function staking() {
  const url = `${FARI_API}/stats/tvl`;
  const bitfariResponse = (await retry(async () => await axios.get(url))).data;
  return bitfariResponse.reserve_pool_value;
}

// node test.js projects/bitfari/index.js
module.exports = {
  timetravel: false,
  stacks: {
    fetch,
  },
  staking: { fetch: staking },
  fetch,
  methodology: "Bitfari TVL is sum of value (tokens and discounts) locked across Bitfari networks.",
};
