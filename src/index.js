const CDPFeeRate = 0.000325; // 0.0325%
const SGXFeeRate = 0.000075; // 0.0075%
const GSTRate = 0.07; // 7%

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
  rate100k = 0.0018; //.18% if transaction value above 50k
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
      commRate = this.rateStd;
      if (brokerComm < this.minFee) {
        brokerComm = this.minFee;
        commRate = "Mininum";
      }
    } else {
      if (totalPrice <= this.rateChangeLvl2) {
        brokerComm = totalPrice * this.rate50K;
        commRate = this.rate50K;
      } else {
        brokerComm = totalPrice * this.rate100k;
        commRate = this.rate100k;
      }
    }
    CDPComm = totalPrice * CDPFeeRate;
    SGXComm = totalPrice * SGXFeeRate;
    totalComm = brokerComm + CDPComm + SGXComm;
    GSTFee = totalComm * GSTRate;
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

class objUserRate extends objBroker {}

updateDisplay = (objLabel, objData) => {
  document.getElementById(objLabel.totalComm).value =
    objData.totalComm.toFixed(2);
  document.getElementById(objLabel.grossTotal).value =
    objData.totalPrice.toFixed(2);
  // check that commRate is not "Minimum"
  if (objData.commRate != "Mininum") {
    objData.commRate *= 100; // convert decimal to %
    document.getElementById(objLabel.commRate).value =
      objData.commRate.toFixed(2);
  } else {
    document.getElementById(objLabel.commRate).value = objData.commRate;
  }
  document.getElementById(objLabel.brokerComm).value =
    objData.brokerComm.toFixed(2);
  document.getElementById(objLabel.CDPComm).value = objData.CDPComm.toFixed(2);
  document.getElementById(objLabel.SGXComm).value = objData.SGXComm.toFixed(2);
  document.getElementById(objLabel.GSTFee).value = objData.GSTFee.toFixed(2);
};

// Event listener to check for radio buttons and input
// using event bubbling aka eventlistener is attached to document not individual buttons
document.addEventListener("change", (event) => {
  //  console.log(event.target.value);
  if (event.target.id == "buyQty") {
    document.getElementById("sellQty").value = event.target.value;
  }
});

// testing code section:

// test = new objBroker();
// test2 = new objDBSLowerRate();

// updateDisplay(buyDisplayLabel, test.calculateComm(20000, 5.07));
// updateDisplay(sellDisplayLabel, test2.calculateComm(2000, 2));
