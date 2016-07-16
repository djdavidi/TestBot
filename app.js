var CronJob = require('cron').CronJob;
var config = require('./config')
var Nightmare = require('nightmare');
var rp = require('request-promise');
var words;


var job1 = new CronJob('* 30 * * * *', function() {
    search(config.users[doit], config.desktop);
}, null, true,'America/New_York')

var search = function(user, platformConfig) {
    rp(config.wordsEndpoint)
        .then(function(wordList) {
            wordList = JSON.parse(wordList)
            words = [];
            wordList.forEach(function(item) {
                words.push(item.word);
            });
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
                .wait(1000)
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
                    .wait(1000)
                    .type('input[type="search"]', '\u000d')
                    .wait(1500)
            }
            nightmare
                .wait(3000)
                .end()
                .catch(function(err) {
                    console.log("err " + err)
                })
        })
}
