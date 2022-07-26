import { createSlice ,current} from "@reduxjs/toolkit";

export const orderBook = createSlice({
  name: "orderBook",
  initialState: {
  
    BOOK: {
      bids: {},
      asks: {},
      psnap: {},
      mcnt: 0,
    },
  },
  reducers: {
    updateBooks: (state, action) => {
     
   
      let seq = null;
      let msg = JSON.parse(action.payload);
      if (msg.event) return;
      if (msg[1] === "hb") {
        seq = +msg[2];
        return;
      } else if (msg[1] === "cs") {
        seq = +msg[3];
        const checksum = msg[2];
        const csdata = [];
        const bids_keys = state.BOOK.psnap["bids"];
        const asks_keys = state.BOOK.psnap["asks"];
        for (let i = 0; i < 25; i++) {
          if (bids_keys[i]) {
            const price = bids_keys[i];
          
            const pp = state.BOOK.bids[price];
            csdata.push(pp.price, pp.amount);
          }
          if (asks_keys[i]) {
            const price = asks_keys[i];
            const pp = state.BOOK.asks[price];
            csdata.push(pp.price, -pp.amount);
          }
        }
      }

      if (state.BOOK.mcnt === 0) {
        msg[1].map((pp) => {
          pp = { price: pp[0], cnt: pp[1], amount: pp[2] };
          const side = pp.amount >= 0 ? "bids" : "asks";
          pp.amount = Math.abs(pp.amount);

          state.BOOK[side][pp.price] = pp;
        });
      } else {
        const cseq = +msg[2];
        msg = msg[1];

        if (!seq) {
          seq = cseq - 1;
        }

        seq = cseq;

        let pp = { price: msg[0], cnt: msg[1], amount: msg[2] };

        if (!pp.cnt) {
          let found = true;

          if (pp.amount > 0) {
            if (state.BOOK["bids"][pp.price]) {
              delete state.BOOK["bids"][pp.price];
            } else {
              found = false;
            }
          } else if (pp.amount < 0) {
            if (state.BOOK["asks"][pp.price]) {
              delete state.BOOK["asks"][pp.price];
            } else {
              found = false;
            }
          }
        } else {
          let side = pp.amount >= 0 ? "bids" : "asks";
          pp.amount = Math.abs(pp.amount);
          state.BOOK[side][pp.price] = pp;
        }
      }
      ["bids", "asks"].map((side) => {
        let sbook = state.BOOK[side];
        let bprices = Object.keys(sbook);

        let prices = bprices.sort(function (a, b) {
          if (side === "bids") {
            return +a >= +b ? -1 : 1;
          } else {
            return +a <= +b ? -1 : 1;
          }
        });

        state.BOOK.psnap[side] = prices;
      });
      console.log(current(state))
      state.BOOK.mcnt++;
    },
  },
});

export const { updateBooks } = orderBook.actions;

export default orderBook.reducer;
