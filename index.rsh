"reach 0.1";

const Parties = {
  seeOutcome: Fun([UInt], Null),
  seeBal: Fun([], Null),
};

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    ...Parties,
    inputPrice: Fun([], UInt),
    response: Fun([], Bool),
    seeBal2: Fun([], Null)
  });
  const Bob = Participant('Bob', {
    ...Parties,
    acceptTerms: Fun([], Bool),
    seeBal3: Fun([], Null)
  });
  init();
  
  Alice.only(() => {
    const price = declassify(interact.inputPrice());
  })
  Alice.publish(price);
  commit();
  Alice.pay(price);
  commit();

  Bob.only(() => {
    const terms = declassify(interact.acceptTerms());
  })
  Bob.publish(terms); 
  Alice.only(() => {
   interact.seeBal2();
  })

  const deadline = 5;
  const end = lastConsensusTime() + deadline;
  var [deadSwitch] = [false];
  invariant(balance() == balance());
  while ( lastConsensusTime() <= end ) {
    commit();

    Alice.only(() => {
     const resp = declassify(interact.response());
    });
    Alice.publish(resp)
    commit();
    Bob.publish();
    [deadSwitch] = [resp];
    continue;
  }
  if (lastConsensusTime() >= end && deadSwitch){
    transfer(balance()).to(Alice)
    each([Alice, Bob], () => {
      interact.seeOutcome(1);
      interact.seeBal();
    });
  }
  else{
    transfer(balance()).to(Bob)
    each([Alice, Bob], () => {
      interact.seeOutcome(0);
      interact.seeBal();
    });
  }

  commit();
});