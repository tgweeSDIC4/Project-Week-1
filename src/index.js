const CDPFeeRate = 0.000325; // 0.0325%
const SGXFeeRate = 0.000075; // 0.0075%
const GSTRate = 0.09; // 9%
const SIFee = 0.35; // cents

const buyDisplayLabel = {
  totalComm: "buyTotalComm",
  grossTotal: "buyTotal",
  commRate: "buyCommRate",
  brokerComm: "buyBrokerComm",
  CDPComm: "buyCDPFee",
  SGXComm: "buySGXFee",
  GSTFee: "buyGST",
};

const sellDisplayLabel = {
  totalComm: "sellTotalComm",
  grossTotal: "sellTotal",
  commRate: "sellCommRate",
  brokerComm: "sellBrokerComm",
  CDPComm: "sellCDPFee",
  SGXComm: "sellSGXFee",
  GSTFee: "sellGST",
};

class objBroker {
  rateStd = 0.0028; //.28% if transaction value 50k and below
  rate50K = 0.0022; //.22% if transaction value above 50k
  rate100k = 0.0018; //.18% if transaction value above 100k
  minFee = 25; // min fee of $25
  rateChangeLvl1 = 50000; //set first threshold at which comm rate changes
  rateChangeLvl2 = 100000; // set 2nd threshold at which comm rate changes

  calculateComm(price, qty) {
    let totalPrice = 0;
    let brokerComm = 0;
    let commRate = 0;
    let totalComm = 0;
    let CDPComm = 0;
    let SGXComm = 0;
    let GSTFee = 0;
    totalPrice = price * qty;
    if (totalPrice <= this.rateChangeLvl1) {
      brokerComm = totalPrice * this.rateStd;
      commRate = this.rateStd * 100;
      if (brokerComm < this.minFee) {
        brokerComm = this.minFee;
        commRate = "Mininum";
      }
    } else {
      if (totalPrice <= this.rateChangeLvl2) {
        brokerComm = totalPrice * this.rate50K;
        commRate = this.rate50K * 100;
      } else {
        brokerComm = totalPrice * this.rate100k;
        commRate = this.rate100k * 100;
      }
    }
    CDPComm = totalPrice * CDPFeeRate;
    SGXComm = totalPrice * SGXFeeRate;
    GSTFee = (brokerComm + CDPComm + SGXComm + SIFee) * GSTRate;
    totalComm = brokerComm + CDPComm + SGXComm + SIFee + GSTFee;
    return {
      totalComm: totalComm,
      totalPrice: totalPrice,
      commRate: commRate,
      brokerComm: brokerComm,
      CDPComm: CDPComm,
      SGXComm: SGXComm,
      GSTFee: GSTFee,
    };
  }
}

class objDBSLowerRate extends objBroker {
  rateStd = 0.0012; // .12% for Buy Transactions only
  rate50K = 0.0012;
  rate100k = 0.0012;
  minFee = 10;
}

class objUserRate extends objBroker {
  calculateComm(price, qty) {
    let totalPrice = 0;
    let brokerComm = 0;
    let commRate = 0;
    let totalComm = 0;
    let CDPComm = 0;
    let SGXComm = 0;
    let GSTFee = 0;
    let userRate = 0;
    // convert entered value into percentage
    userRate = document.getElementById("userEnterRate").value / 100;
    totalPrice = price * qty;
    brokerComm = totalPrice * userRate;
    commRate = userRate * 100;
    CDPComm = totalPrice * CDPFeeRate;
    SGXComm = totalPrice * SGXFeeRate;
    GSTFee = (brokerComm + CDPComm + SGXComm + SIFee) * GSTRate;
    totalComm = brokerComm + CDPComm + SGXComm + SIFee + GSTFee;
    return {
      totalComm: totalComm,
      totalPrice: totalPrice,
      commRate: commRate,
      brokerComm: brokerComm,
      CDPComm: CDPComm,
      SGXComm: SGXComm,
      GSTFee: GSTFee,
    };
  }
}

// instantiate the broker classes
stdBroker = new objBroker();
lowerRateBroker = new objDBSLowerRate();
userRateBroker = new objUserRate();

updateDisplay = (objLabel, objData) => {
  document.getElementById(objLabel.totalComm).value =
    objData.totalComm.toFixed(2);
  document.getElementById(objLabel.grossTotal).value =
    objData.totalPrice.toFixed(2);
  if (objData.commRate == "Mininum") {
    document.getElementById(objLabel.commRate).value = objData.commRate;
  } else {
    document.getElementById(objLabel.commRate).value =
      objData.commRate.toFixed(2);
  }
  document.getElementById(objLabel.brokerComm).value =
    objData.brokerComm.toFixed(2);
  document.getElementById(objLabel.CDPComm).value = objData.CDPComm.toFixed(2);
  document.getElementById(objLabel.SGXComm).value = objData.SGXComm.toFixed(2);
  document.getElementById(objLabel.GSTFee).value = objData.GSTFee.toFixed(2);

  //update total commission display
  totalComm =
    parseFloat(document.getElementById("buyTotalComm").value) +
    parseFloat(document.getElementById("sellTotalComm").value);
  document.getElementById("totalComm").value = totalComm.toFixed(2);

  //update profit or loss
  profitLoss =
    parseFloat(document.getElementById("sellTotal").value) -
    parseFloat(document.getElementById("buyTotal").value) -
    totalComm;
  document.getElementById("grandTotal").value = profitLoss.toFixed(2);
  if (profitLoss <= 0) {
    document.getElementById("grandTotal").style.background = "red";
  } else {
    document.getElementById("grandTotal").style.background = "lightgreen";
  }
};

calculateAll = (type) => {
  // below 2 options have different rates so need to check whether they are selected
  checkDBSCashUpFront = document.getElementById("DBSCashUpFront").checked;
  checkDBSShareFinance = document.getElementById("DBSShareFinance").checked;
  checkUserEnterRate = document.getElementById("userEnterType").checked;

  switch (type) {
    case "buy": {
      price = document.getElementById("buyPrice").value;
      qty = document.getElementById("buyQty").value;
      if (checkDBSCashUpFront == true || checkDBSShareFinance == true) {
        priceCommData = lowerRateBroker.calculateComm(price, qty);
      } else {
        if (checkUserEnterRate == true) {
          priceCommData = userRateBroker.calculateComm(price, qty);
        } else {
          priceCommData = stdBroker.calculateComm(price, qty);
        }
      }
      updateDisplay(buyDisplayLabel, priceCommData);
      break;
    }
    case "sell": {
      price = document.getElementById("sellPrice").value;
      qty = document.getElementById("sellQty").value;
      if (checkDBSShareFinance == true) {
        priceCommData = lowerRateBroker.calculateComm(price, qty);
      } else {
        if (checkUserEnterRate == true) {
          priceCommData = userRateBroker.calculateComm(price, qty);
        } else {
          priceCommData = stdBroker.calculateComm(price, qty);
        }
      }
      updateDisplay(sellDisplayLabel, priceCommData);
      break;
    }
  }
};

// calculate interest and update display for DBS financing part
calculateInterest = (amt, rate) => {
  annualInterest = (amt * rate) / 100;
  dailyInterest = annualInterest / 365;
  monthlyInterest = dailyInterest * 30;
  document.getElementById("dailyInterest").value = dailyInterest.toFixed(2);
  document.getElementById("monthlyInterest").value = monthlyInterest.toFixed(2);
  document.getElementById("annualInterest").value = annualInterest.toFixed(2);
};

//calculate commission diff and update the comparision display
calculateCommDiff = (brokerOneRate, brokerOneValue, brokerTwoRate) => {
  brokerOneComm = (brokerOneRate / 100) * brokerOneValue;
  brokerTwoComm = (brokerTwoRate / 100) * brokerOneValue;
  commDiff = brokerTwoComm - brokerOneComm;
  document.getElementById("brokerCompareDiff").value = commDiff.toFixed(2);
  document.getElementById("brokerOneComm").value = brokerOneComm.toFixed(2);
  document.getElementById("brokerTwoComm").value = brokerTwoComm.toFixed(2);
  if (commDiff > 0)
    document.getElementById("brokerCompareDiff").style.color = "red";
  else document.getElementById("brokerCompareDiff").style.color = "blue";
};

// Event listener to check for radio buttons and input
// using event bubbling aka eventlistener is attached to document not individual buttons
document.addEventListener("change", (event) => {
  checkBuyPrice = document.getElementById("buyPrice").value;
  checkBuyQty = document.getElementById("buyQty").value;
  checkSellPrice = document.getElementById("sellPrice").value;

  // if Buy quantity is changed, update Sell Quantity to be the same
  // then calculate if sell Price is >=0
  if (event.target.id == "buyQty" && checkBuyQty >= 0) {
    document.getElementById("sellQty").value = event.target.value;
    if (checkSellPrice >= 0) calculateAll("sell");
  }

  // calculates if Buy Price is changed and Quantity is >= zero
  if (event.target.id == "buyPrice" && checkBuyPrice >= 0 && checkBuyQty >= 0) {
    calculateAll("buy");
  }
  // calculates if Quantity is changed and Buy price is >=0
  if (event.target.id == "buyQty" && checkBuyPrice >= 0 && checkBuyQty >= 0) {
    calculateAll("buy");
  }
  // calculates if Sell Price is changed and Quantity is >=0
  if (
    event.target.id == "sellPrice" &&
    checkSellPrice >= 0 &&
    checkBuyQty >= 0
  ) {
    calculateAll("sell");
  }

  // calculates on any radio press except for user entered rate selection
  if (event.target.type == "radio" && event.target.id != "userEnterType") {
    if (checkBuyPrice >= 0 && checkBuyQty >= 0) calculateAll("buy");
    if (checkSellPrice >= 0 && checkBuyQty >= 0) calculateAll("sell");
  }

  // calculates if a user rate is entered
  checkUserEnterRate = document.getElementById("userEnterRate").value;
  if (
    (event.target.id == "userEnterRate" ||
      document.getElementById("userEnterType")) &&
    checkUserEnterRate >= 0 &&
    checkUserEnterRate != ""
  ) {
    if (checkBuyPrice >= 0 && checkBuyQty >= 0) calculateAll("buy");
    if (checkSellPrice >= 0 && checkBuyQty >= 0) calculateAll("sell");
  }
});

// event listener attached to DBS financing Calculate Interest button
document.getElementById("calBtn").addEventListener("click", () => {
  checkAmt = document.getElementById("financedAmt").value;
  checkInterestRate = document.getElementById("interestRate").value;
  if (checkAmt >= 0 && checkInterestRate >= 0) {
    calculateInterest(checkAmt, checkInterestRate);
  }
});

//event listner attached for Broker Comparision Calculate Button
document.getElementById("calBtnCompare").addEventListener("click", () => {
  brokerOneRate = document.getElementById("brokerOneRate").value;
  brokerTwoRate = document.getElementById("brokerTwoRate").value;
  brokerOneValue = document.getElementById("brokerOneValue").value;
  if (brokerOneRate > 0 && brokerOneValue >= 0 && brokerTwoRate >= 0) {
    document.getElementById("brokerTwoValue").value = brokerOneValue;
    calculateCommDiff(brokerOneRate, brokerOneValue, brokerTwoRate);
  }
});
