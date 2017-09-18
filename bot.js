const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var LinkedList = require('singly-linked-list');
var list = new LinkedList(); //people who are alive in the game
var listDM=new LinkedList(); //people who are alive and get DMed in the game
var listPlayers = new LinkedList(); //total list of players
var listIfVoted = new LinkedList(); //total list of players who already voted

var suspects = new LinkedList();
var votes = new LinkedList();

var x;
var y;
var z;

var werewolf;
var sheriff;
var doctor;

var idWerewolf;
var idSheriff;
var idDoctor;

var alreadyPressPlay=false;
var sTime;
var counter;

var countDown5Secs = 5;
var gameStart=false;

var countDownVote = 240;
var gameCont= false;

var alreadyKill=false;
var alreadyInv=false;
var alreadyHeal=false;

var deadPerson=-1;


client.on('ready', () => {
  client.user.setGame('Let\'s play werewolf!');
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  
  var content = msg.content //contains all the text Ex: !addrole Member
  var parts = content.split(" "); //splits everything up on spaces so you'll have an array of two strings
  

  if (msg.isMentioned(client.user)) {
    msg.channel.send('Welcome to a game of werewolf!\nCommands:\n`w!rules` `w!join` `w!play` `w!quit` `w!about`');
  }
  if (msg.content === config.prefix  + '!' + 'rules') {
	explainRules(msg);
  }
  if (msg.content === config.prefix  + '!' + 'join') {
	join(msg);
  }
  if (msg.content === config.prefix  + '!' + 'quit') {
	clear();
	msg.channel.send('Game restart.');
  }
  if (msg.content === config.prefix  + '!' + 'play') {
	if(checkEnoughPeople(msg)){
		play(msg);
	}
	else{
		msg.channel.send('We don\'t have enough people to play the game.');
	}
  }
  if (msg.content === config.prefix  + '!' + 'about') {
	msg.channel.send('This is a bot created by Asuka Tae (飛鳥 妙) in August 2017! Thank you for playing!');
  }

  if(parts[0] === config.prefix  + '!' + 'kill'){
  	if (msg.author.toString() === werewolf){
  		if(alreadyKill==false){
			noteDead(msg, parts[1]);
			if(alreadyKill== true){
				if (list.getSize()==1){
					client.channels.get('340390174238310412').send('The werewolf has won the game!');
					client.channels.get('340390174238310412').send("Werewolf: "+ werewolf +" Sheriff: "+sheriff+ " Doctor: " +doctor );
    				//end game
    				clear();
    				client.channels.get('340390174238310412').send("Press w!join and w!play to play the game again.");
				}else{
					if (!list.contains(sheriff) && !list.contains(doctor)){ //sheriff and doctor are dead (finished)
						client.channels.get('340390174238310412').send('It’s daytime, wakey wakey! '+ list.findAt(deadPerson).getData() +' has been found dead!');
  						if (deadPerson==0){
  							list.removeFirst();	
  							listDM.removeFirst();
  						}else{
  							list.removeAt(deadPerson);	
  							listDM.removeAt(deadPerson);
  						}
  		 				client.channels.get('340390174238310412').send('Alive:\n'+ list.printList() +'\nWho is the werewolf? Please vote with w!vote @username');
  			
						while (!gameCont){
							sTime = new Date().getTime();
		    				counter = setInterval(function(){wait30Secs(msg)}, 500);
							gameCont=true;
						}
					}else if(!list.contains(sheriff) && list.contains(doctor)){ //if the sheriff is dead and doctor is alive
						client.channels.get('340390174238310412').send('Doctor, please DM me who you want to heal.');
  						client.fetchUser(idDoctor).then(user => {user.send("The people alive are: \n"+ listDM.printDMList() +"\nTo heal, use w!heal number, ie. w!heal 0")});
					}
					else{

						client.channels.get('340390174238310412').send('Sheriff, please DM me who you want investigate.');
  						client.fetchUser(idSheriff).then(user => {user.send("The people alive are:\n"+ listDM.printDMList() +"\nTo investigate, use w!inv number, ie. w!inv 0")});
					}
					
				}
				
			}		
  		}else{
  			msg.channel.send('You\'ve already killed once.');
  		}
  	}else{
		msg.channel.send('You are not authorized with this command.');
  	}
  }
  if(parts[0] === config.prefix  + '!' + 'inv'){
  	if (msg.author.toString() === sheriff){
  		if(alreadyInv==false){
  			investigate(msg, parts[1]);
  			if (alreadyInv==true){
  				if(!list.contains(doctor)){ //if doctor is dead
						client.channels.get('340390174238310412').send('It’s daytime, wakey wakey! '+ list.findAt(deadPerson).getData() +' has been found dead!');
  						if (deadPerson==0){
  							list.removeFirst();	
  							listDM.removeFirst();
  						}else{
  							list.removeAt(deadPerson);	
  							listDM.removeAt(deadPerson);
  						}
  		 				client.channels.get('340390174238310412').send('Alive:\n'+ list.printList() +'\nWho is the werewolf? Please vote with w!vote @username');
  			
						while (!gameCont){
							sTime = new Date().getTime();
		    				counter = setInterval(function(){wait30Secs(msg)}, 500);
							gameCont=true;
						}
  				}else{
  					client.channels.get('340390174238310412').send('Doctor, please DM me who you want to heal.');
  					client.fetchUser(idDoctor).then(user => {user.send("The people alive are: \n"+ listDM.printDMList() +"\nTo heal, use w!heal number, ie. w!heal 0")});
  				}
  			}
  		}else{
  			msg.channel.send('You\'ve already investigated once.');
  		}  		
  	}else{
		msg.channel.send('You are not authorized with this command.');
  	}
  }
  if(parts[0] === config.prefix  + '!' + 'heal'){
  	if (msg.author.toString() === doctor){
  		if(alreadyHeal==false){
  			
  			heal(msg, parts[1]);

  			if(alreadyHeal==true){

  				client.channels.get('340390174238310412').send('Alive:\n'+ list.printList() +'\nWho is the werewolf? Please vote with w!vote @username');
  			
				while (!gameCont){
					sTime = new Date().getTime();
		    		counter = setInterval(function(){wait30Secs(msg)}, 500);
					gameCont=true;
				}
  			}

  		}else{
  			msg.channel.send('You\'ve already healed once.');
  		}  		
  	}else{
		msg.channel.send('You are not authorized with this command.');
  	}
  }
  if(parts[0] === config.prefix  + '!' + 'vote'){
  	if (listPlayers.contains(msg.author.toString())){ 
  		vote(msg, parts[1]);
  	}else{
  		msg.reply('You are not playing in the game. Press w!join to vote.');
  	}

  }
  /*if(msg.content === config.prefix  + '!' + 'voteCount'){
  		voteCount(msg);
  }*/

});


function explainRules(msg){
    msg.channel.send('Welcome to a game of werewolf. I am your host, werewolf-bot. Please call me "aniki".\n__**How to play the game:**__\nAmongst the villagers, there is one **Werewolf**, one **Sheriff**, one **Doctor**. The **Werewolf**, **Sheriff** and **Doctor** will be DMed.\nDuring the night, I will tell everyone to sleep and close their eyes. Then the **Werewolf** comes out and kills one person.\nThen the **Sheriff** will wake up and DM the host who he wants to investigate ~~(and kill if he wants to within the same round)~~.\nThen the **Doctor** will wake up and DM the host who she wants to protect.\nDuring the day, I will tell everyone to wake up, and announce who has been killed.\nThe villagers (including the dead) will vote and decide who they think is the werewolf. \nThe suspect with the most votes will be killed by the villagers.\nThe objective of the game for the villagers is to identify the werewolf. For the werewolf, it is to kill all the villagers.\nThis will keep repeating till the villagers kill the werewolf, or the werewolf kills all the villagers.\nP. S. If the **Sheriff** and **Doctor** are dead, they cannot perform their jobs.﻿');
}

function join(msg){

	if(listPlayers.contains(msg.author.toString())){
		msg.reply('You\'ve already joined');
	}
	//if it's Tensai
	else if('<@85614143951892480>'=== msg.author.toString()){
		console.log(`Tensai tried to join the game`);
	}
	else{
		list.insert(msg.author.toString());
		listPlayers.insert(msg.author.toString());
		listDM.insert(msg.author.tag);
	}
	client.channels.get('340390174238310412').send('Players: ' + listPlayers.printList());
	
}

function checkEnoughPeople(msg){
	if (list.getSize()>=4){

		return true;
	}
	else{
		return false;
	} 
		
}	
function assignRoles(){

	x = Math.floor(Math.random() * list.getSize()) ;
	werewolf= list.findAt(x).getData();
	console.log( werewolf +` is the werewolf!`);
	let strWerewolf = werewolf; 
	idWerewolf = strWerewolf.replace(/[<@!>]/g, '');
	client.fetchUser(idWerewolf).then(user => {user.send("You are the werewolf")});
	
	y = Math.floor(Math.random() * list.getSize()) ;
	
	while(x==y){
		y = Math.floor(Math.random() * list.getSize()) ;
	}
	if (x!=y){
		sheriff = list.findAt(y).getData();
		console.log( sheriff +` is the sheriff!`);
		let strSheriff = sheriff; 
		idSheriff = strSheriff.replace(/[<@!>]/g, '');
		client.fetchUser(idSheriff).then(user => {user.send("You are the sheriff")});
	}

	z = Math.floor(Math.random() * list.getSize()) ;
	while((x==z) || (y==z)){
		z = Math.floor(Math.random() * list.getSize()) ;
	}

	if ((x!=z) && (y!=z)){
		doctor = list.findAt(z).getData();
		console.log( doctor +` is the doctor!`);
		let strDoctor= doctor; //Just assuming some random tag.
		idDoctor = strDoctor.replace(/[<@!>]/g, '');
		client.fetchUser(idDoctor).then(user => {user.send("You are the doctor")});
	}
}

function play(msg){
	if (alreadyPressPlay==false){
		alreadyPressPlay=true;
		client.channels.get('340390174238310412').send('Night falls, everyone please go to sleep.');

		assignRoles();
		
		while (!gameStart){
			sTime = new Date().getTime();
		    counter = setInterval(function(){wait5Secs(msg)}, 500);


			gameStart=true;
		}

	}else{
		client.channels.get('340390174238310412').send('Game already started');
	}
}	

async function wait5Secs(msg) {
 	var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDown5Secs - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0){
    	clearInterval(counter);
    	client.channels.get('340390174238310412').send('And the werewolf is awake!\nWerewolf, please DM me who you want to kill.');
		
		client.fetchUser(idWerewolf).then(user => {user.send("The people alive are: \n" + listDM.printDMList() + "\nTo kill, use w!kill number, ie. w!kill 0")});	
 	}
}
function wait30Secs(msg) {
 	var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDownVote - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0){
    	clearInterval(counter);
    	var personWithMostVotes=findPersonWithMostVotes(msg);
    	
        
        if(personWithMostVotes==-1){
          client.channels.get('340390174238310412').send('No one voted, so everyone is safe.');
      }else{
          
          client.channels.get('340390174238310412').send('Time is up! \nDuring the day, the villagers killed '+ suspects.findAt(personWithMostVotes).getData()+'. \nNight falls...');
		  var index = list.indexOf(suspects.findAt(personWithMostVotes).getData());
          if (index==0){
   			list.removeFirst();
			listDM.removeFirst();
		  }else{
			list.removeAt(index);
			listDM.removeAt(index);
		  }
      
      }
        
    	
		if (personWithMostVotes==-1){
            client.channels.get('340390174238310412').send("... and the werewolf is awake!\nWerewolf, please DM me who you want to kill.");
			client.fetchUser(idWerewolf).then(user => {user.send("The people alive are: \n" + listDM.printDMList() + "\nTo kill, use w!kill number, ie. w!kill 0")});
			continueGame();
        }
    	else if (suspects.findAt(personWithMostVotes).getData()===werewolf){
    		client.channels.get('340390174238310412').send("And no one is dead that night. The villagers win!");
    		client.channels.get('340390174238310412').send("Werewolf: "+ werewolf +" Sheriff: "+sheriff+ " Doctor: " +doctor );
    		//end game
    		clear();
    		client.channels.get('340390174238310412').send("Press w!join and w!play to play the game again.");
    	}else if(list.getSize()==1){
    		client.channels.get('340390174238310412').send('The werewolf is the last player alive! The werewolf has won the game!');
			client.channels.get('340390174238310412').send("Werewolf: "+ werewolf +" Sheriff: "+sheriff+ " Doctor: " +doctor );
    		//end game
    		clear();
    		client.channels.get('340390174238310412').send("Press w!join and w!play to play the game again.");
    	}
    	else{
			client.channels.get('340390174238310412').send("... and the werewolf is awake!\nWerewolf, please DM me who you want to kill.");
			client.fetchUser(idWerewolf).then(user => {user.send("The people alive are: \n" + listDM.printDMList() + "\nTo kill, use w!kill number, ie. w!kill 0")});
			continueGame();
    	}


	
    }
}
function noteDead(msg, dead){
	if(list.findAt(dead).getData()===werewolf){
		msg.channel.send('Suicide is a bad option. Please w!kill number again.');
	}
	else if(list.getSize()==2){ //end of the game, where only werewolf and one other role
		deadPerson= dead;
		alreadyKill=true;
		msg.channel.send("You have killed " + listDM.findAt(deadPerson).getData());
		
		if (dead==0){
			list.removeFirst();
			listDM.removeFirst();
		}else{
			list.removeAt(dead);
			listDM.removeAt(dead);
		}

	}else if (dead<list.getSize()){
		deadPerson= dead;
		alreadyKill=true;
		msg.channel.send("You have killed " + listDM.findAt(deadPerson).getData());
	}else{
		msg.channel.send("Unvalid number! Please w!kill number again.");
	}
}
function investigate(msg, inv){
	if (inv<list.getSize()){
		if(list.findAt(inv).getData()===werewolf){
			msg.channel.send(listDM.findAt(inv).getData()+" is the werewolf!");
		}else{
			msg.channel.send(listDM.findAt(inv).getData()+" is not the werewolf. Better luck next time!");
		}
		alreadyInv= true;
		
	}else{
		msg.channel.send("Unvalid number! Please w!kill number again.");
	}
}
function heal(msg, heal){
	if (heal<list.getSize()){
		if(deadPerson==heal){
			msg.channel.send(listDM.findAt(heal).getData()+" is healed!");
			client.channels.get('340390174238310412').send('No one was found dead that night! Good job, Doc!');	
			deadPerson=-1;
		}else{
			msg.channel.send(listDM.findAt(heal).getData()+" is healed!");
			client.channels.get('340390174238310412').send('It’s daytime, wakey wakey! '+ list.findAt(deadPerson).getData() +' has been found dead!');
  			if (deadPerson==0){
  				list.removeFirst();	
  				listDM.removeFirst();
  			}else{
  				list.removeAt(deadPerson);	
  				listDM.removeAt(deadPerson);
  			}
  		
		}

		alreadyHeal=true;
		
	}else{
		msg.channel.send("Unvalid number! Please w!kill number again.");
	}
}
function vote(msg, vote){
	if(!listIfVoted.contains(msg.author.toString())){
		console.log(list.printList);
		if (list.contains(vote)){ //if suspect is alive
			if(suspects.contains(vote)){ //if suspect has been suspected before
				var index= suspects.indexOf(vote);
				var num = votes.findAt(index).getData();
				votes.findAt(index).editData(num+1);
				msg.channel.send(vote+" +" +votes.findAt(index).getData());
				listIfVoted.insert(msg.author.toString());
			}else{ //if suspect is casted first vote
				suspects.insert(vote);
				votes.insert(1);
				msg.channel.send(vote+" +1");
					listIfVoted.insert(msg.author.toString());
			}
		}else{
			msg.channel.send('You probably tried to vote for a dead person or someone outside the game.\nTry w!vote @username again.');
		}
	}else{
		msg.reply('You already voted once.');
	}
}
function findPersonWithMostVotes(msg){
  
 if(suspects.getSize()==0){
     return -1;
     
 }else{
       
  var maxIndex=0;
  var max= votes.findAt(0).getData();


  if (suspects.getSize()==1){
    return 0;

  }else{

      for (var i = 1; i < suspects.getSize(); i++) {
          if (votes.findAt(i).getData() > max) {
              maxIndex = i;
              max = votes.findAt(i).getData();
          }
      }
  }

  return maxIndex;
     
 }
}

function clear(){

	list.clear(); //people who are alive in the game
	listDM.clear(); //people who are alive and get DMed in the game
	listPlayers.clear(); //total list of players
	listIfVoted.clear(); //total list of players who already voted

	suspects.clear();
	votes.clear();

	x=-1;
	y=-1;
	z=-1;

	werewolf="";
	sheriff="";
	doctor="";

	idWerewolf="";
	idSheriff="";
	idDoctor="";

	alreadyPressPlay=false;
	sTime=0;
	counter=0;


	gameStart=false;

	gameCont= false;

	alreadyKill=false;
	alreadyInv=false;
	alreadyHeal=false;

	deadPerson=-1;
}
function continueGame(){
	listIfVoted.clear(); //total list of players who already voted
	suspects.clear();
	votes.clear();

	sTime=0;
	counter=0;

	gameCont= false;

	alreadyKill=false;
	alreadyInv=false;
 	alreadyHeal=false;

	deadPerson=-1;

}

client.login(config.token);
