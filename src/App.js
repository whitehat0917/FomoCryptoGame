import LeftBar from "./components/leftbar";
import Home from "./components/home";
import Notification from "./components/notification";
import React, { Component } from 'react';
import './App.scss';
import { ethers } from 'ethers'
import { shortenAddress } from './utils';
import GameStats from "./GameStats"
import Settings from "./Settings"
import abi from "./ContractABI"

// const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")
const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.defibit.io/")
// const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/")

const addy = '0xad9653f63b6c5F3F68839027f98b16E632689E82'
const pot = '0x68561ef4c33Fa481037b28C208EAA8FE8B121FA2'

class App extends Component {
  setTabChanged = val => {
    this.setState({ tabChanged: val })
  }

  setMenuOpened = val => {
    this.setState({ menuOpened: val })
  }

  getMetamaskWallet = async () => {
    let metamask
    try {
      metamask = new ethers.providers.Web3Provider(window.ethereum, 56);
    } catch (e) {
      console.log('wrong chain')
      return null
    }
    // Prompt user for account connections
    try {
      await metamask.send("eth_requestAccounts", []);
    } catch (e) {
      return null
    }
    const wallet = metamask.getSigner();
    const address = await wallet.getAddress()

    let loaded = true

    if (this.state.username !== address) {
      loaded = false
    }
    if (metamask.provider.chainId === '0x38') {
      this.setState({
        loaded: loaded,
        wallet: wallet,
        username: address,
        contract: new ethers.Contract(addy, abi, wallet)
      })
    }
  }

  checkMetamask = async () => {
    let metamask;
      try {
        metamask = new ethers.providers.Web3Provider(window.ethereum, 56);
      } catch (e) {
        console.log('wrong chain')
        return null
      }
      // Prompt user for account connections
      let loaded = true
      try {
        const wallet = metamask.getSigner();
        if (wallet.provider.provider._state.accounts){
          const address = await wallet.getAddress()  
          if (this.state.username !== address && metamask.provider.chainId === '0x38') {
            loaded = false;
            this.setState({
              loaded: loaded,
              wallet: wallet,
              username: address,
              contract: new ethers.Contract(addy, abi, wallet)
            })
          }
        }
      } catch (e) {
        console.log(e)
        this.setState({
          loaded: loaded,
          wallet: null,
          username: null,
          contract: new ethers.Contract(addy, abi, provider)
        })
        return;
      }
  }

  getRoundPotWinnersBreakdown = (stats, settings) => {

    const activeSettings = settings.activeSettings

    const nthPlaceWords = ["Top", "Second Highest", "Third Highest"]
    const nthPlaceColors = ["#FEAE65", "#E6F69D", "#AADEA7"]

    const array = []


    const add = (name, percent, color, amount, address, tokens) => {
      // array.push([name, amount ? <span className={`${bonus == 0 ? 'text-danger' : 'text-success'}`}><span className="text-light">{amount}</span> BNB<br/>{(bonus).toFixed(1)}% payout bonus for holding {numberWithCommas(tokens)} tokens</span> : <span>0</span>, percent, color])

      array.push([name, amount, percent, color, address])
    }

    if (stats.lastBuyer !== '0x0000000000000000000000000000000000000000') {
      add(shortenAddress(stats.lastBuyer) + ' - Last Buyer', activeSettings.lastBuyerPayoutPercent, "#F66D44", stats.lastBuyerPayout, stats.lastBuyer, stats.lastBuyerBalance)
    } else {
      add('Last Buyer', activeSettings.lastBuyerPayoutPercent, "#F66D44", stats.lastBuyerPayout, stats.lastBuyerBonus, stats.lastBuyerBalance)
    }


    if (stats.topBuyers[0] === undefined) {
      for (let i = 0; i < activeSettings.placePayoutPercents.length; i++) {
        add(nthPlaceWords[i] + " Ticketholder", activeSettings.placePayoutPercents[i], nthPlaceColors[i], stats.topBuyers[i] ? stats.topBuyers[i].payout : 0, stats.topBuyers[i] ? stats.topBuyers[i].bonus : 0, stats.topBuyers[i] ? stats.topBuyers[i].balance : 0)
      }
    } else {
      for (let i = 0; i < activeSettings.placePayoutPercents.length; i++) {
        add(stats.topBuyers[i] ? shortenAddress(stats.topBuyers[i].address) + ' - ' + nthPlaceWords[i] + ' Buyer' :
          nthPlaceWords[i] + ' Buyer', activeSettings.placePayoutPercents[i], nthPlaceColors[i], stats.topBuyers[i] ? stats.topBuyers[i].payout : 0, stats.topBuyers[i] ? stats.topBuyers[i].address : "", stats.topBuyers[i] ? stats.topBuyers[i].balance : 0)
      }
    }

    const hugeCount = activeSettings.hugeHolderLotteryPayoutCount
    const largeCount = activeSettings.largeHolderLotteryPayoutCount
    const smallCount = activeSettings.smallHolderLotteryPayoutCount

    const addLotteryPayout = (count, percent, name, color) => {
      if (count === 0) {
        return
      }

      add(count.toString() + " " + name + " Holder" + (count > 1 ? "s" : ""), percent, color, stats.currentRoundPot / 10)
    }

    addLotteryPayout(hugeCount, activeSettings.hugeHolderLotteryPayoutPercent, "Huge", "64C2A6")
    addLotteryPayout(largeCount, activeSettings.largeHolderLotteryPayoutPercent, "Large", "2D87BB")
    addLotteryPayout(smallCount, activeSettings.smallHolderLotteryPayoutPercent, "Small", "7982B9")

    if (activeSettings.marketingPayoutPercent > 0) {
      add("Marketing Fund", activeSettings.marketingPayoutPercent, "#A9A9A9", stats.currentRoundPot * 0.05)
    }

    return array
  }

  parse(item) {
    return parseInt(item)
  }

  nanCheck = (item) => {
    if (isNaN(item)) {
      return 0
    }
    return item
  }


  roundState = (stats, settings, timeLeft, cooldownTimeLeft) => {
    if (stats.roundNumber === 0) {
      // "Game Has Not Yet Begun"
      return 4
    }
    if (stats.blocksLeft > 0 && timeLeft > 0) {
      // Round running - new Date(timeLeft*1000).toISOString().substr(11, 8)
      return 1
    }
    if (stats.blocksLeft >= 0 && (timeLeft <= 0)) {
      // "Checking For Last-Second Entries..."
      return 2
    }
    if ((stats.blocksLeft < 0) && stats.endTimestamp === 0) {
      // "Round Complete - Awaiting Payouts..."
      return 3
    }
    if (stats.endTimestamp !== 0 && cooldownTimeLeft >= 0) {
      // "Rounded Has Ended - On Cooldown"
      return 0
    }
    if (stats.endTimestamp !== 0 && cooldownTimeLeft < 0) {
      // "Buy a Ticket To Start the Round!"
      return 5
    }
  }


  timer


  poll = () => {
    this.state.contract.gameStats(this.state.username ? this.state.username : '0x0000000000000000000000000000000000000007').then(stats => {
      this.state.contract.settings().then(settings => {

        if (stats.roundStats.length === 0) {
          window.clearTimeout(this.timer);
          this.timer = window.setTimeout(this.poll, 3000);
        }

        settings = new Settings(settings)

        stats = new GameStats(stats, this.state.username ? this.state.username : null, settings)

        const timeLeft = stats.calculateTimeLeft()

        const cooldownTimeLeft = stats.calculateCooldownTimeLeft(settings.currentRoundSettings.gameCooldownBlocks)

        let holder = ''

        if (stats.userBalance > 100000) {
          holder = 'Small Holder'
        }

        if (stats.userBalance > 1000000) {
          holder = 'Large Holder'
        }

        if (stats.userBalance > 5000000) {
          holder = 'Huge Holder'
        }

        this.setState({
          loaded: true,
          stats,
          settings,
          holderType: holder,
          roundState: this.roundState(stats, settings, timeLeft, cooldownTimeLeft),
          // buysDisabled: false, 
          buysDisabled: this.roundState(stats, settings, timeLeft, cooldownTimeLeft) === 3 || this.roundState(stats, settings, timeLeft, cooldownTimeLeft) === 0 || this.roundState(stats, settings, timeLeft, cooldownTimeLeft) === 4,
          // priceForTicketAhead: settings.calculateCurrentTicketPriceAfterNBlocks(stats, 30),
          priceForTicketAhead: settings.calculateCurrentTicketPrice(stats) * 1.05,
          priceForTicketCurrent: settings.calculateCurrentTicketPrice(stats),
          timeLeft: timeLeft,
          cooldownTimeLeft: cooldownTimeLeft,
          currentRoundNumber: stats.roundNumber,
          lastBuyer: stats.lastBuyer,
          currentRoundPot: stats.currentRoundPot ? stats.currentRoundPot.toFixed(6) : stats.currentRoundPot,
          // realRoundPot: stats.realRoundPot ? stats.realRoundPot.toFixed(6) : stats.realRoundPot,
          currentBlocksLeftAtLastBuy: stats.currentBlocksLeftAtLastBuy,
          currentLastBuyBlock: stats.lastBuyBlock,
          topBuyerAddress: stats.topBuyerAddress,
          topBuyerData: stats.topBuyerData
        })

        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(this.poll, 3000);

      })
    })
  }

  updateUI = () => {
    this.checkMetamask();
    if (this.state.stats) {
      const obj = { timeLeft: this.state.stats.calculateTimeLeft(), cooldownTimeLeft: this.state.stats.calculateCooldownTimeLeft(this.state.settings.currentRoundSettings.gameCooldownBlocks) }

      if (this.state.settings) {
        // obj.priceForTicket = this.state.settings.contractSettings.initialTicketPrice
        obj.priceForTicket = this.state.settings.calculateCurrentTicketPrice(this.state.stats)
        obj.priceForTicketAhead = this.state.settings.calculateCurrentTicketPrice(this.state.stats) * 1.05
        obj.priceForTicketCurrent = this.state.settings.calculateCurrentTicketPrice(this.state.stats)

        obj.roundPotWinnersBreakdown = this.getRoundPotWinnersBreakdown(this.state.stats, this.state.settings)
      }

      this.setState(obj)
    }
  }


  state = {
    tabChanged: false,
    menuOpened: false,
    loaded: false,
    wallet: null,
    contract: null,
    contractRoundSettings: null,
    currentRoundRoundSettings: null,
    contractPayoutSettings: null,
    currentRoundPayoutSettings: null,
    roundStats: null,
    userStats: null,
    currentBlocksLeft: null,
    lastBuyer: null,
    topBuyerAddress: null,
    topBuyerData: null,
    timeLeft: null,
    tokensHeld: 0,
    holderType: '',
    username: null,
    roundPotBreakdown: [
      ["Last Buyer", 30, '#F66D44'],
      ["Top Ticketholder", 30, '#FEAE65'],
      ["Second Ticketholder", 15, '#E6F69D'],
      ["Third Highest Ticketholder", 5, '#AADEA7'],
      ["1 Random Huge Holder", 5, '#64C2A6'],
      ["2 Random Large Holders", 5, '#2D87BB'],
      ["5 Random Small Holders", 5, '#7982B9'],
      ["Marketing Fund", 5, '#A9A9A9']
    ],
    roundPotWinnersBreakdown: [
      ["-", 30, '#F66D44'],
      ["-", 30, '#FEAE65'],
      ["-", 15, '#E6F69D'],
      ["-", 5, '#AADEA7'],
      ["-", 5, '#64C2A6'],
      ["-", 5, '#2D87BB'],
      ["-", 5, '#7982B9'],
      ["-", 5, '#A9A9A9']
    ],
  }

  componentDidMount() {
    this.setState({
      mdShow: true
    })

    const c = new ethers.Contract(addy, abi, provider)
    this.setState({ contract: c });
    c.gameStats('0x0000000000000000000000000000000000000007').then(stats => {
      c.settings().then(settings => {

        settings = new Settings(settings)
        stats = new GameStats(stats, null, settings)

        const timeLeft = stats.calculateTimeLeft()

        const cooldownTimeLeft = stats.calculateCooldownTimeLeft(settings.currentRoundSettings.gameCooldownBlocks)

        this.getMetamaskWallet().then(_ => {
          this.setState({
            ca: addy,
            pot: pot,
            stats,
            settings,
            timeLeft: timeLeft,
            cooldownTimeLeft: cooldownTimeLeft,
            // buysDisabled: false,
            roundState: this.roundState(stats, settings, timeLeft, cooldownTimeLeft),
            buysDisabled: this.roundState(stats, settings, timeLeft, cooldownTimeLeft) === 3 || this.roundState(stats, settings, timeLeft, cooldownTimeLeft) === 0 || this.roundState(stats, settings, timeLeft, cooldownTimeLeft) === 4,
            priceForTicketAhead: settings.calculateCurrentTicketPrice(stats) * 1.05,
            priceForTicketCurrent: settings.calculateCurrentTicketPrice(stats),
            loaded: true,
            priceForTicket: settings.calculateCurrentTicketPrice(stats),
            //ticketPriceIncreasePerBlock: this.nanCheck(parseInt(settings.contractRoundSettings.ticketPriceIncreasePerBlock._hex, 16)/1e18),
            currentRoundNumber: stats.roundNumber,
            lastBuyer: stats.lastBuyer,
            currentRoundPot: stats.currentRoundPot ? stats.currentRoundPot.toFixed(6) : stats.currentRoundPot,
            // realRoundPot: stats.realRoundPot ? stats.realRoundPot.toFixed(6) : stats.realRoundPot,
            topBuyerAddress: stats.topBuyerAddress,
            topBuyerData: stats.topBuyerData,
          })
        })
        this.poll()
      })
    })

    setInterval(this.updateUI.bind(this), 1000)
  }

  render() {
    return (
      <div className="App">
        <Notification />
        <LeftBar
          tabChanged={this.state.tabChanged}
          setTabChanged={this.setTabChanged}
          menuOpened={this.state.menuOpened}
          mainState={this.state}
          connect={this.getMetamaskWallet}
        />
        <div className={`main-body ${this.state.menuOpened && "opened"}`}>
          {
            this.state.stats &&
            <Home
              tabChanged={this.state.tabChanged}
              setTabChanged={this.setTabChanged}
              menuOpened={this.state.menuOpened}
              setMenuOpened={this.setMenuOpened}
              mainState={this.state}
              connect={this.getMetamaskWallet}
            />
          }
        </div>
      </div>
    );
  }
}

export default App;

