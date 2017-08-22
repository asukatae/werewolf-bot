const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var LinkedList = require('singly-linked-list');
var list = new LinkedList();
var listPlayers = new LinkedList();

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

var countDown30Secs = 60;
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
    msg.channel.send('Welcome to a game of werewolf!\nCommands:\n`w!rules` `w!join` `w!play`');
  }
  if (msg.content === config.prefix  + '!' + 'rules') {
	explainRules(msg);
  }
  if (msg.content === config.prefix  + '!' + 'join') {
	join(msg);
  }
  if (msg.content === config.prefix  + '!' + 'play') {
	if(checkEnoughPeople(msg)){
		play(msg);
	}
	else{
		msg.channel.send('We don\'t have enough people to play the game.');
	}
  }

  if(parts[0] === config.prefix  + '!' + 'kill'){
  	if (msg.author.toString() === werewolf){
  		if(alreadyKill==false){
			noteDead(msg, parts[1]);
			if(alreadyKill== true){
				client.channels.get('341523915849465856').send('Sheriff, please DM me who you want investigate.');
  				client.fetchUser(idSheriff).then(user => {user.send("The people alive are:\n"+ list.printDMList() +"\nTo investigate, use w!inv number")});
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
  				client.channels.get('341523915849465856').send('Doctor, please DM me who you want to heal.');
  				client.fetchUser(idDoctor).then(user => {user.send("The people alive are: \n"+ list.printDMList() +"\nTo heal, use w!heal number")});
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

  				client.channels.get('341523915849465856').send('Alive:\n'+ list.printList() +'\nWho is the werewolf? Please vote with w!vote @username');
  			
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

});


function explainRules(msg){
    msg.channel.send('Welcome to a game of werewolf. I am your host, werewolf-bot. Please call me "aniki".\n__**How to play the game:**__\nAmongst the villagers, there is one **Werewolf**, one **Sheriff**, one **Doctor**. The **Werewolf**, **Sheriff** and **Doctor** will be DMed.\nDuring the night, I will tell everyone to sleep and close their eyes. Then the **Werewolf** comes out and kills one person.\nThen the **Sheriff** will wake up and DM the host who he wants to investigate (and kill if he wants to within the same round).\nThen the **Doctor** will wake up and DM the host who she wants to protect.\nDuring the day, I will tell everyone to wake up, and announce who has been killed.\nThe villagers (including the dead) will vote and decide who they think is the werewolf. \nThe suspect with the most votes will be killed by the villagers.\nThe objective of the game for the villagers is to identify the werewolf. For the werewolf, it is to kill all the villagers.\nThis will keep repeating till the villagers kill the werewolf, or the werewolf kills all the villagers.\nP. S. If the **Sheriff** and **Doctor** are dead, they cannot perform their jobs.﻿');
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
	}
	client.channels.get('341523915849465856').send('Players: ' + listPlayers.printList());

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
		client.channels.get('341523915849465856').send('Night falls, everyone please go to sleep.');

		assignRoles();
		
		while (!gameStart){
			sTime = new Date().getTime();
		    counter = setInterval(function(){wait5Secs(msg)}, 500);


			gameStart=true;
		}

	}else{
		client.channels.get('341523915849465856').send('Game already started');
	}
}	

async function wait5Secs(msg) {
 	var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDown5Secs - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0){
    	clearInterval(counter);
    	client.channels.get('341523915849465856').send('And the werewolf is awake!\nWerewolf, please DM me who you want to kill.');
		
		client.fetchUser(idWerewolf).then(user => {user.send("The people alive are: \n" + list.printDMList() + "\nTo kill, use w!kill number, ie. w!kill 0")});	
 	}
}
function wait30Secs(msg) {
 	var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDown30Secs - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0){
    	clearInterval(counter);
    	client.channels.get('341523915849465856').send('Time is up! \nDuring the day, the villagers killed _. \nNight falls...');
		
    }
}
function noteDead(msg, dead){
	if(list.findAt(dead).getData()===werewolf){
		msg.channel.send('Suicide is bad for you. Please w!kill number again.');
	}
	else if (dead<list.getSize()){
		deadPerson= dead;
		alreadyKill=true;
		console.log("killed " + list.findAt(deadPerson).getData());
	}else{
		msg.channel.send("Unvalid number! Please w!kill number again.");
	}
}
function investigate(msg, inv){
	if (inv<list.getSize()){
		if(list.findAt(inv).getData()===werewolf){
			msg.channel.send(list.findAt(inv).getData()+" is the werewolf!");
		}else{
			msg.channel.send(list.findAt(inv).getData()+" is not the werewolf. Better luck next time!");
		}
		alreadyInv= true;
		console.log("investigated " + list.findAt(inv).getData());
	}else{
		msg.channel.send("Unvalid number! Please w!kill number again.");
	}
}
function heal(msg, heal){
	if (heal<list.getSize()){
		if(deadPerson==heal){
			client.channels.get('341523915849465856').send('No one was found dead that night! Good job, Doc!');	
			deadPerson=-1;
		}else{
			client.channels.get('341523915849465856').send('It’s daytime, wakey wakey! '+ list.findAt(deadPerson).getData() +' has been found dead!');
  			list.removeAt(deadPerson);	
		}

		alreadyHeal=true;
		
	}else{
		msg.channel.send("Unvalid number! Please w!kill number again.");
	}
}
function vote(msg, vote){
	if (list.contains(vote)){
		
		msg.reply('You have voted for '+vote); 

	}else{
		msg.channel.send('You probably tried to vote for a dead person or someone outside the game.\nTry w!vote @username again.');
	}
}

client.login(config.token);
