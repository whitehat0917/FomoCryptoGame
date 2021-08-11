import { useState } from "react";
import Modal from "react-modal";

const firstObj = {
  heading: "fees",
  arr: [
    { heading: "first week", arr: <div>Nothing</div> },
    {
      heading: "After First week",
      arr: (
        <div>
          4% to liquidity
          <br /> 4% to pot
          <br /> 4% to BNB divs
        </div>
      ),
    },
    {
      heading: "Selling Fee",
      arr: (
        <div>
          4% to liquidity, 13% to pot,<br /> and 13% to BNB divs down to 4% to liquidity,<br /> 4% to pot, and
          4% to BNB divs linearly over 18 days.
        </div>
      ),
    }
  ]
};

const data = [
  {
    heading: "GAME INFO",
    description:
      "Each round starts with a timer that counts down from a certain time (game setting, default 10 minutes). Each round has a pot, which is a percent of total value of the pot contract (game setting, default 25%).",
  },
  {
    heading: "Ways to Win",
    arr: [
      "1. Be a top three ticket holder (They win 20%, 10% and 5% of the round pot, respectively)",
      "2. Be the last ticket buyer (They win 30% of the round pot)",
      "3. Win the lottery for Huge/Large/Small holders. A huge holder has >= 5mm tokens, large >= 500k, small >= 50k. After each round, 2, 5, and 10 huge/large/small holders split 10% of the round pot for each holder type. (30% total of round pot goes to lotteries)",
    ],
    arr2: [
      "Buying tickets will add more time to the clock (game setting, default 30 seconds per ticket)",
      "Ticket prices are based off the value of the round pot. (RoundPot)^0.75 / X, (X is game setting, default 100 for now, 10000 for main game)",
      "Users get discounts on tickets bought and bonsues on non-lottery wins based on whole tokens held (percent bonus is tokensHeld^(3/8) / X) (x is game setting default 35)",
    ],
  },
  {
    heading: "Split in 4 ways",
    arr: [
      "1. To the pot",
      "2. as divs to all ticket holders for the current round only",
      "3. buy tokens on PancakeSwap and send them to the Pot (the pot will accumulate tokens and get a greater share of token divs)",
      "4. referral (a user can be referred by someone else. if that occurs, then a small percent of each of their ticket buys will go to their referrer)",
    ],
  },
];

const Block = ({ data }) => (
  <div>
    <div className="sub-heading">{data.heading}</div>
    {data.arr}
  </div>
);
const Notification = () => {
  const [modal, setModal] = useState(true);
  return (
    <Modal isOpen={modal} ariaHideApp={false} onRequestClose={() => setModal(false)}>
      <div className="notification">
        <div className="main-heading">GAME RULES</div>
        <div style={{ padding: "15px" }}>
          <div className="_heading">{firstObj.heading}</div>
          <div className="first-obj">
            {firstObj.arr.map((i, k) => (
              <Block key={k} data={i} />
            ))}
          </div>
        </div>
        {data.map((i, k) => (
          <div key={k} className="_body">
            <div className="_heading">{i.heading}</div>
            <div>
              {i.description && <div>{i.description}</div>}
              {i.arr && i.arr.map((m, n) => <div key={n}>{i.arr[n]}</div>)}
              {i.arr2 &&
                i.arr2.map((m, n) => (
                  <div key={n} className={"_item"}>
                    <span>*</span>
                    {i.arr2[n]}
                  </div>
                ))}
            </div>
          </div>
        ))}
        <div>
          <span
            onClick={() => setModal(false)}
            style={{ cursor: "pointer" }}
            className="button-ok"
          >
            OK
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default Notification;
