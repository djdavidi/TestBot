var CronJob = require('cron').CronJob;
var config = require('./config')
var Nightmare = require('nightmare');
var rp = require('request-promise');
var users = config.users;
var url = config.url;
var homeUrl = config.homeUrl;
var randomNumber;
var user;
var words;
var nightmare = new Nightmare({
        show: true,
        'webPreferences': {
            partition: 'nopersist'
        }
    })

var job = new CronJob('* * 10-18/2 * *', function() {
	var d = new Date();
    if (d.getHours() === 10) randomNumber=null;
    if(!randomNumber)randomNumber = Math.floor(Math.random()* (5));
    user = users[randomNumber]
    console.log(user)
    action(user);
    randomNumber++
    if(randomNumber>=users.length) randomNumber=0;

}, null, true).start();

var action = function(user){
console.log(user)
//wordnik random list api
rp(config.wordsEndpoint)
    .then(function(wordList) {
        wordList = JSON.parse(wordList)
        words = [];
        wordList.forEach(function(item) {
            words.push(item.word)
        })
        console.log("words" + words)
    })
    .then(function() {
        nightmare
            .goto(config.url)
            .click('span a')
            .wait(1500)
            .type('input[type="email"]', user.email)
            .type('input[type="password"]', user.password)
            .click(config.signInSelector)
            .wait(1300)
            .click(config.moveSelector)
            .wait(1400)
        for (var i = 0; i < words.length; i++) {
            nightmare
                .insert('input[type="search"]', '')
                .type('input[type="search"]', words[i])
                .wait(2000)
                .click(config.searchSelector)
                .wait(Math.random()*10000)
        }
        nightmare
            .wait(3000)
            .end()
            .then(function(){
            	console.log("done")
            })

    })
}