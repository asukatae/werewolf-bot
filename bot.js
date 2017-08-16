const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var LinkedList = require('singly-linked-list');
var list = new LinkedList();

var x;
var y;
var z;

var werewolf;
var sheriff;
var doctor;

var idWerewolf;
var idSheriff;
var idDoctor;

var alreadyPressPlay=0;
var sTime;
var counter;

var countDown = 5;
var timeIsCountingDown=true;
var gameOver=false;

client.on('ready', () => {
  client.user.setGame('Let\'s play werewolf!');
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  var content = msg.content //contains all the text Ex: !addrole Member
  var parts = content.split(" "); //splits everything up on spaces so you'll have an array of two strings
  var roleName = parts[1]; //gets the second element of the array (since array indexing starts at 0)
  
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
  if (parts[0] === config.prefix  + '!' + 'kill') {
 	client.channels.get('341523915849465856').send(parts[1]+' has been killed')
  }

});

function explainRules(msg){
    msg.channel.send('Welcome to a game of werewolf. I am your host, werewolf-bot. Please call me "aniki".\n__**How to play the game:**__\nAmongst the villagers, there is one **Werewolf**, one **Sheriff**, one **Doctor**. The **Werewolf**, **Sheriff** and **Doctor** will be DMed.\nDuring the night, I will tell everyone to sleep and close their eyes. Then the **Werewolf** comes out and kills one person.\nThen the **Sheriff** will wake up and DM the host who he wants to investigate (and kill if he wants to within the same round).\nThen the **Doctor** will wake up and DM the host who she wants to protect.\nDuring the day, I will tell everyone to wake up, and announce who has been killed.\nThe villagers (including the dead) will vote and decide who they think is the werewolf. \nThe suspect with the most votes will be killed by the villagers.\nThe objective of the game for the villagers is to identify the werewolf. For the werewolf, it is to kill all the villagers.\nThis will keep repeating till the villagers kill the werewolf, or the werewolf kills all the villagers.\nP. S. If the **Sheriff** and **Doctor** are dead, they cannot perform their jobs.﻿');
}

function join(msg){

	if(list.contains(msg.author.toString())){
		msg.reply('You\'ve already joined');
	}
	//if it's Tensai
	else if('<@85614143951892480>'=== msg.author.toString()){
		console.log(`Tensai tried to join the game`);
	}
	else{
		list.insert(msg.author.toString());
	}
	msg.channel.send('Players: ' + list.printList());

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
	client.fetchUser(idWerewolf).then(user => {user.send("You are the werewolf")})
	
	
	y = Math.floor(Math.random() * list.getSize()) ;
	
	while(x==y){
		y = Math.floor(Math.random() * list.getSize()) ;
	}
	if (x!=y){
		sheriff = list.findAt(y).getData();
		console.log( sheriff +` is the sheriff!`);
		let strSheriff = sheriff; 
		idSheriff = strSheriff.replace(/[<@!>]/g, '');
		client.fetchUser(idSheriff).then(user => {user.send("You are the sheriff")})

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
		client.fetchUser(idDoctor).then(user => {user.send("You are the doctor")})

	}
}

function play(msg){
	if (alreadyPressPlay==0){
		alreadyPressPlay=1;
		msg.channel.send('Night falls, everyone please go to sleep.');

		assignRoles();
		
		while (!gameOver){
			sTime = new Date().getTime();
		    counter = setInterval(function(){UpdateTime(msg)}, 500);


			gameOver=true;
		}

	}else{
		msg.channel.send('Game already started');
	}
	
}	

function UpdateTime(msg) {
 	var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDown - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0){
    	clearInterval(counter);
    	msg.channel.send('And the werewolf is awake!\nWerewolf, please DM me who you want to kill.');
			
    }
}


client.login(config.token);
