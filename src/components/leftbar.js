import AppIco from "../assets/256.png";
import MetaMask from "../assets/metamask-logo@2x.png";
import connectIco from "../assets/connect.svg";
import discountIco from "../assets/discount.svg";
import bonusIco from "../assets/bonus.svg";
import ticketIco from "../assets/ticket.svg";
import spentIco from "../assets/spent.svg";
import diviIco from "../assets/dividends.svg";
import barIco from "../assets/Menu.svg";
import { shortenAddress, getFixedLength } from '../utils';

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const LeftItem = ({ data }) => {
  return (
    <div className="_item">
      <div>
        <span>
          <img src={data.src} alt="" />
        </span>
        <span>{data.heading}</span>
      </div>
      <div>
        <span></span>
        <span>{data.value}</span>
      </div>
    </div>
  );
};

export const TopBar = ({ setTabChanged, setMenuOpened }) => {
  return (
    <div className="top-bar">
      <img
        className="app-ico"
        src={barIco}
        onClick={() => setMenuOpened((val) => !val)}
        alt="app-icon"
      ></img>

      <div
        className="app-header"
        onClick={() => {
          setTabChanged(false);
        }}
      >
        <img className="app-ico" src={AppIco} alt="app-icon"></img>
        {/* <div>MrsDoge</div> */}
      </div>
      <div className="connect">
        {/* <img src={MetaMask} alt="" /> */}
        <span>connect</span>
      </div>
    </div>
  );
};

const LeftBar = ({ setTabChanged, menuOpened, mainState, connect }) => {
  const { username, wallet, stats, ca, roundState } = mainState;
  let leftBarItem = [];
  leftBarItem.push(
    {
      heading: "Holder Discount",
      value: stats ? isNaN(stats.userBonus) ? '0%' : (stats.userBonus * 100).toFixed(1) + "%" : '0%',
      src: discountIco,
    }
  );
  leftBarItem.push(
    {
      heading: "Holder Bonus",
      value: stats ? isNaN(stats.userBonus) ? '0%' : (stats.userBonus * 100).toFixed(1) + "%" : '0%',
      src: bonusIco,
    }
  );
  leftBarItem.push(
    {
      heading: "Your Tickets",
      value: stats ? (isNaN(stats.userTicketsBought) || roundState === 5) ? '0 Tickets' : stats.userTicketsBought === 1 ? stats.userTicketsBought + " Ticket" : stats.userTicketsBought + " Tickets" : '0 Tickets',
      src: ticketIco,
    }
  );
  leftBarItem.push(
    {
      heading: "Your BNB Spent",
      value: stats ? (isNaN(stats.userTotalSpentOnTickets) || roundState === 5) ? '0 BNB' : stats.userTotalSpentOnTickets.toFixed(getFixedLength(stats.userTotalSpentOnTickets) + 3) + " BNB" : '0 BNB',
      src: spentIco,
    }
  );
  leftBarItem.push(
    {
      heading: "Pending Dividends",
      value: stats ? stats.userWithdrawableDividend ? stats.userWithdrawableDividend.toFixed(getFixedLength(stats.userWithdrawableDividend) + 3) + " BNB" : '0 BNB' : '0 BNB',
      src: diviIco,
    }
  );
  return (
    <div className={`left-bar ${menuOpened && "opened"}`}>
      <div
        className="app-header"
        onClick={() => {
          setTabChanged(false);
        }}
      >
        <img className="app-ico" src={AppIco} alt="app-icon"></img>
        <div>MrsDoge</div>
      </div>
      {
        !wallet &&
        <div className="connect" onClick={connect}>
          <img src={MetaMask} alt="" />
          <span>connect</span>
        </div>
      }
      <div className="_items">
        <div className="_item">
          <div>
            <span>
              <img src={connectIco} alt="connect Metamask" />
            </span>
            {
              username ?
                (
                  <a href={`https://bscscan.com/address/${username}`} target="_blank" rel="noopepener noreferrer">
                    <span>{shortenAddress(username)}</span>
                  </a>
                ) : 
                (
                  <span onClick={connect} style={{cursor: 'pointer'}}>
                    Connect Wallet
                  </span>
                )
            }
          </div>
          <div>
            <span></span>
            <span>
              Tokens: {stats ? isNaN(stats.userBalance) ? 0 : numberWithCommas((stats.userBalance).toFixed(0)) : 0}
            </span>
          </div>
        </div>
        {leftBarItem.map((i, k) => (
          <LeftItem key={k} data={i} />
        ))}
      </div>
      <div className="_button">
        <span></span>
        <a href={`https://exchange.pancakeswap.finance/#/swap?outputCurrency=${ca}`} target="_blank" rel="noopepener noreferrer">
          <span>Buy Tokens</span>
        </a>
      </div>
      <div className="_button" style={{paddingBottom: '30px'}}>
        <span></span>
        <a href={`https://poocoin.app/tokens/${ca}`} target="_blank" rel="noopepener noreferrer">
          <span>View Chart</span>
        </a>
      </div>
    </div>
  );
};

export default LeftBar;
