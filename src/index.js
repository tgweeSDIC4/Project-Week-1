let CDP = {
  CDPFee: 0.000325, // 0.0325%
};

let SGX = {
  SGXFee: 0.000075, // 0.0075%
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
    let commission = 0;
    let commRate = 0;
    totalPrice = price * qty;
    if (totalPrice <= this.rateChangeLvl1) {
      commission = totalPrice * this.rateStd;
      commRate = this.rateStd;
      if (commission < this.minFee) {
        commission = this.minFee;
        commRate = "Mininum";
      }
    } else {
      if (totalPrice <= this.rateChangeLvl2) {
        commission = totalPrice * this.rate50K;
        commRate = this.rate50K;
      } else {
        commission = totalPrice * this.rate100k;
        commRate = this.rate100k;
      }
    }
    return [totalPrice, commission, commRate];
  }
}

class objDBSCashUpFront extends objBroker {
  rateStd = 0.0012; // .12% for Buy Transactions only
  rate50K = 0.0012;
  rate100k = 0.0012;
  minFee = 10;
}

class objDBSShareFinance extends objBroker {
  rateStd = 0.0012; // 0.12% for All Transactions
  rate50K = 0.0012;
  rate100k = 0.0012;
  minFee = 10;
}

// Event listener to check for radio buttons and input
// using event bubbling aka eventlistener is attached to document not individual buttons
document.addEventListener("change", (event) => {
  // console.log(event.target)
  // console.log(event.target.type);
  console.log(event.target.value);
  if (event.target.id == "buyQty") {
    console.log("hello");
    document.getElementById("sellQty").value = event.target.value;
  }
});

// testing code section:

// test = new objBroker();
// console.log(test.calculateComm(50001, 1));
