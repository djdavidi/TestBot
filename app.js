var CronJob = require('cron').CronJob;
var config = require('./config')
var Nightmare = require('nightmare');
var randomNumber;
var user;
var words;

var job = new CronJob('* * 10-18/2 * *', function() {
    user = users[randomNumber]
    console.log(user)
    action(user);
    randomNumber++
    if (randomNumber >= users.length) randomNumber = 0;

}, null, true).start();
// if mobile config.mobileuseragent || 
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
                // give it a desktop user agent mac
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
