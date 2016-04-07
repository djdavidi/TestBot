var CronJob = require('cron').CronJob;
var config = require('./config')
var Nightmare = require('nightmare');
var rp = require('request-promise');
var randomNumber;
var user;
var words;
var indexPointer = Math.floor(Math.random()*5);;
var counter = 0;
var platform;

var job = new CronJob('* * 8-18/1 * *', function() {
    if(counter<=4) platform = config.desktop;
    else if(counter>4) platform = config.mobile;
    action(config.users[indexPointer],platform);
    indexPointer++;
    counter++;
    if(counter===10)counter = 0;
    if(indexPointer===config.users.length) indexPointer=0;

}, null, true,'America/New_York')

var action = function(user, platformConfig) {
    rp(config.wordsEndpoint)
        .then(function(wordList) {
            console.log("user" + JSON.stringify(user))
            wordList = JSON.parse(wordList)
            words = [];
            wordList.forEach(function(item) {
                words.push(item.word)
            })
        })
        .then(function() {
            var nightmare = new Nightmare({
                    show: true,
                    'webPreferences': {
                        partition: 'nopersist'
                    }
                })
            nightmare
                .useragent(platformConfig.userAgent)
                .viewport(1000, 700)
                .goto(config.url)
                .click(platformConfig.goToSignIn)
                .wait(1500)
                .type('input[type="email"]', user.email)
                .type('input[type="password"]', user.password)
                .click(config.signInSelector)
                .wait(1300)
                .goto(config.homeUrl)
                .wait(1400)
            for (var i = 0; i < words.length; i++) {
                nightmare
                    .insert('input[type="search"]', '')
                    .type('input[type="search"]', words[i])
                    .wait(500)
                    .type('document', '\u000d')
                    .click(config.searchSelector)
                    .wait(1500)
            }
            nightmare
                .wait(3000)
                .end()
                .then(function() {
                    doit++
                    if (users.length > doit) desktop(users[doit]);
                    else doit = 0;
                })
                .catch(function(err) {
                    console.log("err " + err)
                })
        })
}
