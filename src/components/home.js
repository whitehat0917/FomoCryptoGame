import React, { Component } from 'react';
import roundPotIco from "../assets/Icon-LP.svg";
import roundPotIcoPath from "../assets/BNB POT (1).svg";
import buyTicketIco from "../assets/Icon-Timer-autopaid.svg";
import buyTicketIcoPath from "../assets/Timer (2).svg";
import ticketPriceIco from "../assets/icon-10sellfees.svg";
import ticketPriceIcoPath from "../assets/Ticket (3).svg";
import roundNumberIco from "../assets/Round.svg";
import roundNumberIcoPath from "../assets/Path 992.svg";
import downIco from "../assets/up.svg";
import upIco from "../assets/Down.svg";
import "./home.scss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TopBar } from "./leftbar";
import { shortenAddress, getFixedLength } from '../utils';
import { ethers } from 'ethers'

const TopBlock = ({ data, style }) => {
  const { heading, value, heading2, value2, src, shadowSrc, href, type } = data;
  return (
    <div className={`top-block ${type && "type-" + type}`} style={{ ...style }}>
      {
        href ? (
          <a style={{ textDecoration: 'none' }} href={href} rel="noopener noreferrer" target="_blank">
            <div>
              <img src={shadowSrc} />
              <img src={src} />
            </div>
            <div>{value}</div>
            <div>{heading}</div>
          </a>
        ) : (
          <>
            <div>
              <img src={shadowSrc} />
              <img src={src} />
            </div>
            <div>{value}</div>
            <div>{heading}</div>
            {
              value2 &&
              <div>{value2}</div>
            }
            {
              heading2 &&
              <div>{heading2}</div>
            }
          </>
        )
      }
    </div>
  );
};

const DataBlock = ({ data, heading2, textStyle, typeb, style }) => {
  const { heading, value1, value2, value } = data;
  return (
    <div className={"data-block"} style={{ ...style }}>
      {!typeb && (
        <div>
          <div>{heading}</div>
          <div>{value1}</div>
        </div>
      )}
      <div>
        <div>{heading2 || heading}</div>
        <div style={{ ...textStyle }}>{value || value2}</div>
      </div>
    </div>
  );
};

const inputs = [500, 200, 100, 50, 20, 10, 5, 1];

const table1params = [
  "rank",
  "address",
  "tickets",
  "toWin",
  "lastBuy",
  "overtake",
];
const table2params = ["bnb", "address", "position", "overtake"];

const nanCheck = (item) => {
  if (isNaN(item)) {
    return 0
  }
  return item
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const formatAMPM = (date) => {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

const gettdstyle = (val, status, param) => {
  if (param != "overtake") return;
  switch (status) {
    case true:
      return `linear-gradient(90deg, #6ED9E0 ${val}%, white ${0}%)`;
    case false:
      return `linear-gradient(90deg, #F85365 ${val}%, white ${0}%)`;

    default:
      break;
  }
  return;
};

export class Home extends Component {

  state = {
    timerText: '',
    ticketsToBuy: 123,
    firstUpdate: false,
    ticket: 100
  }

  increment = (val) => {
    if (this.state.ticket + val >= 1)
      this.setState({ ticket: +this.state.ticket + val })
  }

  notify = () => {
    toast(`You bought ${this.state.ticket == 1 ? this.state.ticket+" ticket" : this.state.ticket+" tickets"}`)
  }

  componentDidMount() {
    this.timer = setInterval(() => this.setTimerText(), 250);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {

    if (this.state.firstUpate === false) {
      if (nextProps.mainState.stats && nextProps.mainState.stats.topBuyers[0] && (nextProps.mainState.stats.topBuyers[0].ticketsBought !== 0)) {

        this.setState({
          ticketsToBuy: nextProps.mainState.stats ? nextProps.mainState.stats.topBuyers[0] ? nextProps.mainState.stats.topBuyers[0].ticketsBought + 1 - nextProps.mainState.stats.userTicketsBought : 123 : 123,
          firstUpdate: true
        })
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer)
    this.timer = null;
  }

  setTimerText = () => {
    if (this.props.mainState.loaded) {

      let value = ''

      switch (this.props.mainState.roundState) {
        case 0:
          value = this.props.mainState.cooldownTimeLeft === 0 ? new Date(0).toISOString().substr(11, 8) : new Date(this.props.mainState.cooldownTimeLeft * 1000).toISOString().substr(11, 8) + ' Till Next Round'
          break
        case 1:
          value = this.props.mainState.timeLeft === 0 ? new Date(0).toISOString().substr(11, 8) : new Date(this.props.mainState.timeLeft * 1000).toISOString().substr(11, 8)
          break
        case 2:
          value = "Checking For Last-Second Entries..."
          break
        case 3:
          value = "Round Complete - Awaiting Payouts..."
          break
        case 4:
          value = "Game Has Not Yet Begun"
          break
        case 5:
          value = "Buy a Ticket To Start the Round!"
          break
        default:
          value = "Loading..."
          break
      }

      this.setState({
        timerText: value
      })
    }
  }

  naWrapper = (item) => {
    return item ? item : 'N/A'
  }

  addressCheck = (address) => {
    return address ? address === "You" ? "You" : shortenAddress(address) : 'No Buyer'
  }

  leadCalc = (num, topBuyerData) => {
    let totalTickets = 0
    for (let i = 0; i < 3; i++) {
      totalTickets += this.parse(topBuyerData[i * 6])
    }
    return (this.parse(topBuyerData[num * 6]) / totalTickets) * 100
  }

  completeRound(wallet, contract) {
    if (wallet && contract) {
      const encodedABI = contract.interface.encodeFunctionData('completeRound', [])

      wallet.getTransactionCount().then(nonce => {
        const tx = {
          chainId: 56,
          nonce: ethers.utils.hexlify(nonce),
          gasPrice: ethers.utils.hexlify(7 * 1000000000),
          gasLimit: ethers.utils.hexlify(2500000),
          to: contract.address,
          value: '0x00',
          data: encodedABI
        }

        wallet.sendTransaction(tx).then(confirmation => {
          // this.setState({ purchased: true })
        })

      })
    }
  }

  parse(item) {
    return item ? parseInt(item._hex, 16) : undefined
  }

  render() {
    const { stats, ca, pot, buysDisabled, roundState, priceForTicketCurrent, settings, loaded, getWallet, wallet, priceForTicketAhead, timeLeft, contract, priceForTicket, priceForTicketsToTakeFirst, currentRoundNumber, lastBuyer, currentBlocksLeft, currentRoundPot, currentBlocksLeftAtLastBuy, currentLastBuyBlock, currentBlockTime, currentBlockNumber, topBuyerAddress, topBuyerData, username, tokensHeld, holderType, roundPotBreakdown, roundPotWinnersBreakdown, realRoundPot } = this.props.mainState;
    const { tabChanged, setTabChanged, setMenuOpened } = this.props;

    const winnerRecipients = [], winnerAmounts = [], winnerColors = []
    const discountedPriceForTicket = priceForTicket * (1 - stats.userBonus)
    const discountedPriceForTicketCurrent = priceForTicketCurrent * (1 - (stats.userBonus ? stats.userBonus : 0));
    const discountedPriceForTicketAhead = priceForTicketAhead * (1 - stats.userBonus)

    for (let i = 0; i < roundPotWinnersBreakdown.length; i++) {
      winnerRecipients.push(' ' + roundPotWinnersBreakdown[i][0])
      winnerAmounts.push(roundPotWinnersBreakdown[i][1])
      winnerColors.push(roundPotWinnersBreakdown[i][3])
    }

    const topBuyer = stats.topBuyers ? stats.topBuyers[0] : null

    const topBarData = [
      {
        heading: "Round Pot Size",
        value: parseFloat(nanCheck(currentRoundPot)).toFixed(getFixedLength(nanCheck(currentRoundPot)) + 3) + " BNB",
        src: roundPotIco,
        href: `https://bscscan.com/address/${pot}`,
        shadowSrc: roundPotIcoPath,
      },
      {
        heading: (
          <p>
            buy tickets to start <br />
            the round
          </p>
        ),
        value: this.state.timerText,
        src: buyTicketIco,
        shadowSrc: buyTicketIcoPath,
        type: 2,
      },
      {
        heading: "ticket price",
        value: roundState == 5 ? priceForTicket ? Number(priceForTicket).toFixed(getFixedLength(priceForTicket) + 3) + " BNB" : "0 BNB" : priceForTicketCurrent ? Number(priceForTicketCurrent).toFixed(getFixedLength(Number(priceForTicket)) + 3) + " BNB" : 0 + " BNB",
        heading2: "Your Holder Discounted Price",
        value2: (roundState == 5 ? discountedPriceForTicket.toFixed(getFixedLength(discountedPriceForTicket) + 3) : discountedPriceForTicketCurrent.toFixed(getFixedLength(discountedPriceForTicketCurrent) + 3)) + " BNB (-" + ((stats.userBonus) * 100).toFixed(1) + "%)",
        src: ticketPriceIco,
        shadowSrc: ticketPriceIcoPath,
        type: 3,
      },
      {
        heading: "Round number",
        value: roundState == 5 ? currentRoundNumber + 1 : currentRoundNumber,
        src: roundNumberIco,
        shadowSrc: roundNumberIcoPath,
        href: `https://bscscan.com/address/${settings.currentRoundAddress}`,
        type: 4,
      }
    ];

    const ticketsData = [
      {
        heading: "last Buyer Position",
        value1: "1 ticket",
        value2: (discountedPriceForTicketCurrent).toFixed(getFixedLength(discountedPriceForTicketCurrent) + 3) + " BNB",
      },
      {
        heading: "Last Buyer Payout",
        value1: (settings.activeSettings.lastBuyerPayoutPercent) + "%",
        value2: ((settings.activeSettings.lastBuyerPayoutPercent / 100) * currentRoundPot * (1 + stats.userBonus)).toFixed(getFixedLength(((settings.activeSettings.lastBuyerPayoutPercent / 100) * currentRoundPot * (1 + stats.userBonus))) + 3) + " BNB",
      },
      {
        heading: "Top Buyer Position",
        value1: (topBuyer.ticketsBought + 1 - stats.userTicketsBought).toString() + ((topBuyer.ticketsBought + 1 - stats.userTicketsBought) == 1 ? " ticket" : " tickets"),
        value2: ((topBuyer.ticketsBought + 1 - stats.userTicketsBought) * discountedPriceForTicketCurrent).toFixed(getFixedLength(((topBuyer.ticketsBought + 1 - stats.userTicketsBought) * discountedPriceForTicketCurrent)) + 3) + " BNB",
      },
      {
        heading: "Top Buyer Payout",
        value1: (settings.activeSettings.placePayoutPercents[0]) + "%",
        value2: ((settings.activeSettings.placePayoutPercents[0] / 100) * currentRoundPot * (1 + stats.userBonus)).toFixed(getFixedLength(((settings.activeSettings.placePayoutPercents[0] / 100) * currentRoundPot * (1 + stats.userBonus))) + 3) + " BNB",
      },
    ];

    const RoundStatsData = [
      {
        heading: "Bought tickets",
        value: roundState != 5 ? stats.ticketsBought == 1 ? "1 ticket" : stats.ticketsBought + " tickets" : "0 tickets",
      },
      {
        heading: "Spent on tickets",
        value: (roundState != 5 ? Number(stats.totalSpentOnTickets).toFixed(getFixedLength(Number(stats.totalSpentOnTickets)) + 3) : 0) + " BNB",
      },
      {
        heading: "Burned Tokens (Buy back)",
        value: roundState != 5 ? numberWithCommas(Number(stats.tokensBurned).toFixed(0)) : 0
      },
    ];

    const getTopBuyer = (index) => {
      const topBuyer = index < stats.topBuyers.length ? stats.topBuyers[index] : null

      let address
      let ticketsBought
      let lastBuy

      if (topBuyer) {
        address = topBuyer.address
        ticketsBought = Number(topBuyer.ticketsBought)
        lastBuy = formatAMPM(new Date(topBuyer.lastBuyTimestamp * 1000))
      }
      const top = (index == 0 || index == 1 || index == 2)

      return { rank: index + 1, address: this.addressCheck(roundState == 5 ? '' : address === username ? 'You' : address), tickets: roundState == 5 ? 'N/A' : this.naWrapper(ticketsBought), toWin: roundState == 5 ? 0 : top ? winnerAmounts[index + 1].toFixed(getFixedLength(winnerAmounts[index + 1]) + 3) + " BNB" : "0 BNB", lastBuy: roundState == 5 ? 'N/A' : this.naWrapper(lastBuy), overtake: 'buy', status: (index == 0 || index == 1 || index == 2) ? true : false, realAddress: address }
    }

    const buyTickets = (wallet, contract, num, priceForTicket, getWallet, priceForTicketAhead, roundState) => {
      if (wallet && contract) {
        // contract.connect(wallet)

        const tickPrice = roundState == 5 ? priceForTicket * 1.05 : priceForTicketAhead
        const gas = roundState == 5 ? 7000000 : 2000000

        // contract.buyExactTickets(num, {value: (Math.floor(num * tickPrice * 1e18)).toString()})

        const encodedABI = contract.interface.encodeFunctionData('buyExactTickets', [num])

        wallet.getTransactionCount().then(nonce => {
          const tx = {
            chainId: 56,
            nonce: ethers.utils.hexlify(nonce),
            gasPrice: ethers.utils.hexlify(11 * 1000000000),
            gasLimit: ethers.utils.hexlify(gas),
            to: contract.address,
            value: ethers.utils.parseEther((num * tickPrice).toPrecision(6)),
            data: encodedABI
          }

          wallet.sendTransaction(tx).then(confirmation => {
            // this.setState({ ticketsToBuy: num })
            setTimeout(() => {
              this.notify();
            }, 2000);
          })

        })
      } else {
        getWallet()
      }
    }

    const tableData = [];

    for (let i = 0; i < 7; i++) {
      tableData.push(getTopBuyer(i))
    }

    const tableData2 = [];

    for (let i = 0; i < roundPotWinnersBreakdown.length; i++) {
      tableData2.push(
        {
          bnb: roundPotWinnersBreakdown[i][1].toFixed(getFixedLength(roundPotWinnersBreakdown[i][1]) + 3) + " BNB",
          address: roundPotWinnersBreakdown[i][0],
          position: roundPotWinnersBreakdown[i][2],
          overtake: roundPotWinnersBreakdown[i][2],
          status: true
        }
      );
    }

    return (
      <div className="home">
        <TopBar
          tabChanged={tabChanged}
          setTabChanged={setTabChanged}
          setMenuOpened={setMenuOpened}
        />

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
        />
        <div className="top-blocks">
          <TopBlock data={topBarData[0]} />
          <TopBlock data={topBarData[1]} style={{ marginLeft: "2%" }} />
          {
            this.props.mainState.roundState != 3 &&
            <TopBlock data={topBarData[2]} style={{ marginRight: "2%" }} />
          }
          <TopBlock data={topBarData[3]} />
        </div>
        {!buysDisabled ? (
          <>
            <div className="main-blocks">
              <div className="_block left">
                <div className="header">BUY tickets</div>
                <DataBlock data={ticketsData[0]} heading2={"cost"} />
                <DataBlock
                  data={ticketsData[1]}
                  heading2={"won"}
                  style={{ marginBottom: "20px" }}
                />
                <DataBlock data={ticketsData[2]} heading2={"cost"} />
                <DataBlock data={ticketsData[3]} heading2={"won"} />
              </div>
              <div className="middle-block">
                <div>
                  <img src={downIco} onClick={() => this.increment(-1)} />
                  <span>
                    <input
                      type="number"
                      value={this.state.ticket}
                      onChange={(e) => this.setState({ ticket: e.target.value })}
                      min="1"
                    />
                    <span>{this.state.ticket == 1 ? `Ticket` : `Tickets`}</span>
                  </span>
                  <img src={upIco} onClick={() => this.increment(1)} />
                </div>
                <div className="input-blocks">
                  {inputs.map((i, k) => (
                    <div
                      key={k}
                      className={"input-block"}
                      onClick={() => this.setState({ ticket: i })}
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div
                  className="buy-button"
                  onClick={() => {
                    buyTickets(wallet, contract, this.state.ticket, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)
                  }}
                >
                  {"buy"}
                </div>
              </div>
              <div className="_block right">
                <div className="header">Round Stats</div>
                <DataBlock data={RoundStatsData[0]} typeb />
                <DataBlock data={RoundStatsData[1]} typeb />
                <DataBlock
                  typeb
                  data={RoundStatsData[2]}
                  id={2}
                  textStyle={{
                    color: "#F85365",
                    textShadow: "0px 1px 2px #F85365",
                  }}
                />
              </div>
            </div>
            <div className="top-buyers">
              <div className="header">Top buyers</div>
              <div className="main-tt">
                <table className="table">
                  <thead>
                    {table1params.map((i, k) => (
                      (k != 5 || this.props.mainState.roundState == 1) &&
                      <th key={k}>{i.replace(/([a-z])([A-Z])/g, "$1 $2")}</th>
                    ))}
                  </thead>
                  <tbody>
                    {tableData.map((i, k) => (
                      <tr className={"color-" + i.status}>
                        {table1params.map((m, n) => (
                          <td className={m}>
                            {
                              n == 1 && i[m] != 'You' && i[m] != 'No Buyer' ?
                                (
                                  <a href={`https://bscscan.com/address/${i['realAddress']}`} target="_blank" rel="noopepener noreferrer">
                                    <span>{i[m]}</span>
                                  </a>
                                ) :
                                (
                                  n == 5 ? (
                                    this.props.mainState.roundState == 1 &&
                                    <span onClick={() => {
                                      buyTickets(wallet, contract, i['Tickets'] && !isNaN(i['Tickets']) ? i['Tickets'] : 1, discountedPriceForTicket, getWallet, discountedPriceForTicketAhead, roundState, stats)
                                    }}>{i[m]}</span>
                                  ) : (
                                    <span>{i[m]}</span>
                                  )
                                )
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>{" "}
              </div>
            </div>
          </>
        ) : (
          <div className="round-payouts">
            <div className="header">Round Payouts</div>
            <div className="main-tt">
              <table className="table">
                <thead>
                  {table2params.map((i, k) => (
                    <th key={k} className={"header-" + i}>
                      {i.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </th>
                  ))}
                </thead>
                <tbody>
                  {tableData2.map((i, k) => (
                    <tr className={"color-" + i.status}>
                      {table2params.map((m, n) => (
                        <td className={m}>
                          <span
                            style={{
                              background: gettdstyle(i[m], i.status, m),
                            }}
                          >
                            {m == "overtake" ? " " : i[m]}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>{" "}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Home;