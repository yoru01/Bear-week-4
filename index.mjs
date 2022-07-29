import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno } from '@reach-sh/stdlib/ask.mjs';
const stdlib = loadStdlib(process.env);

//create test account
const startingBalance = stdlib.parseCurrency(1000);
const acc = await stdlib.newTestAccount(startingBalance);

//Set up functions for checking balance
const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));


const before = await getBalance()
console.log('Your starting balance is: ' + before)
console.log(`Your address is ${acc.getAddress()}`)


//Define common interface for both players
const Parties = {
  seeOutcome: async(outcome) => {
    const out = parseInt(outcome);
    console.log(out);
   if(out == 1 ){
    console.log('Alice is still here so she gets back her tokens')
   }
   else console.log('Alice isnt here so she loses her tokens to Bob')
  },
  seeBal: async() => {
    console.log(`Your token balance is ${fmt(await stdlib.balanceOf(acc))}`)
  },
};



//Define interface for Alice
const Alice = {
  ...Parties,
  inputPrice: async () => {
    const isPrice = await ask(
      `How much do you want to put in the vault?`, stdlib.parseCurrency
    )
    return isPrice;
  },
  response: async () => {
    const isResponse = await ask(`Alice are you still there yes or no?`, yesno);
    return isResponse;
  },
  seeBal2: async () => {
    console.log(`Your token balance is ${fmt(await stdlib.balanceOf(acc))}`)
  },
};

//Define interface for Bob
const Bob = {
  ...Parties,
  acceptTerms: async () => {
   const terms = await ask(`Bob do you accept the terms yes or no?`, yesno);
   if(terms){
    return terms;
   }
   else {
    process.exit();
   } 
  }
}

//Program starts here
const program = async () => {

  const isDeployer = await ask(
    `Are you alice or bob y=alice n=bob?`,
    yesno
  )
  let isAlice = null; 
  const who =  isDeployer? 'Alice' : 'Bob';
  console.log(`Starting as ${who}`);

  //Contract gets initialized here
  let ctc = null; 

  if(isDeployer){ //if deployer
    ctc =  acc.contract(backend); // connect to contract
    backend.Alice(ctc, {
      ...Alice,

    }); 
    const info = JSON.stringify(await ctc.getInfo(), null, 1) //fetch contract info
  
    console.log(info); //display info
  }
  else{
    const info = await ask(
      `Please paste the contract information of the contract you want to subscribe to:`, 
      JSON.parse
    );
    ctc = acc.contract(backend, info);
    isAlice ? backend.Bob(ctc, Bob) : backend.Bob(ctc, Bob)
    console.log("Successfully connected");

  }

}

await program();


