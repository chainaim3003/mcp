export const get_last_few_swaps = `{
   swaps(orderBy: timestamp, orderDirection: desc
   ) {
        pair {
          token0 {
            symbol
         }
          token1 {
            symbol
         }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
   }
}`;
