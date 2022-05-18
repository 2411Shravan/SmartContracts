App={
  web3Provider:null,
  contracts:{},
  account:'0x0',

  init: function(){
    if(typeof web3!=='undefined'){
        App.web3Provider=window.ethereum;
        web3= new Web3(window.ethereum);
    }
    else{
        App.web3Provider=new Web3.providers.HttpProvider('http://localhost:7545');
        web3= new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function(){
    $.getJSON("Election.json", function(election){
      App.contracts.Election= TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      
      return App.render();
    });
  },

  render: function(){
    var electionInstance;
    var loader=$("#loader");
    var content=$("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err,account){
      if(err===null){
        App.account=account;
        console.log("Hello world");
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.Election.deployed().then(function(instance){
      electionInstance=instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount){
      var candidatesResults= $("#candidatesResults");
      candidatesResults.empty();

      for(var i=1;i<=candidatesCount;i++){
          electionInstance.candidates(i).then(function(candidate){
            var id=candidate[0];
            var name=candidate[1];
            var voteCount=candidate[2];

            var candidateTemplate="<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            candidatesResults.append(candidateTemplate);
          });
      }

      loader.hide();
      content.show();
    }).catch(function(error){
      console.warn(error);
    });
  }
};

$(function(){
  $(window).load(function(){
    App.init();
  });
});