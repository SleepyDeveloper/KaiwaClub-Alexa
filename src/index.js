var Alexa = require('alexa-sdk');
var https = require('https');
var moment = require('moment-timezone');

var states = {
    SEARCHMODE: '_SEARCHMODE',
};

var sig_id = '40137342';
var sig = 'b09941c406bbc4defb0a7b09a25216112a1392b6';

var welcomeMessage = "Kaiwa Club. You can ask me for the next meetup or say help. What will it be?";

var welcomeRepromt = "You can ask me for the next meetup or  say help. What will it be?";

var HelpMessage = "Here are some things you can say: When is the next meetup? What would you like to do?";

var moreInformation = "See your Alexa app for more information."

var goodbyeMessage = "OK, I hope to see you at Kaiwa Club.";

var newline = "\n";

var alexa;

var newSessionHandlers = {
    'LaunchRequest': function () {
        this.handler.state = states.SEARCHMODE;
        output = welcomeMessage;
        this.emit(':ask', output, welcomeRepromt);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
        // Use this function to clear up and save any data needed between sessions
        this.emit(":tell", goodbyeMessage);
    },
    'SessionEndedRequest': function () {
        // Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
        output = HelpMessage;
        this.emit(':ask', output, welcomeRepromt);
    },
};

var startSearchHandlers = Alexa.CreateStateHandler(states.SEARCHMODE, {
    'AMAZON.StopIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.HelpIntent': function () {
        output = HelpMessage;
        this.emit(':ask', output, HelpMessage);
    },
    'getNextMeetupIntent': function() {
        getNextFromMeetup(function (response) {

          var responseData = JSON.parse(response);

          var cardContent = "Next Kaiwa Club";

          // Check if we have correct data, If not create an error speech out to try again.
          if (responseData == null || responseData.errors != null && responseData.errors.length > 0 ) {
              output = "There was a problem with getting data please try again";
          }
          else {

              kaiwaClubDate = moment.utc(responseData[0].time).tz('America/Los_Angeles')
              cardContent += "\n" + kaiwaClubDate.format('dddd, MM/DD @ h:mma z');
              output = "The next Kaiwa Club is " + kaiwaClubDate.format('dddd, MMMM Do YYYY, h:mma z');

              var venue = responseData[0].venue;
              var address = venue.name + newline + venue.address_1 + newline + venue.city + ", " + venue.state;
              cardContent += newline + address;

              output += " See your Alexa app for more information.";
          }
          var cardTitle = "Next Kaiwa Club";

          alexa.emit(':tellWithCard', output, cardTitle, cardContent);

        });
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', output, HelpMessage);
    },
    'AMAZON.CancelIntent': function () {
        // Use this function to clear up and save any data needed between sessions
        this.emit(":tell", goodbyeMessage);
    },
    'SessionEndedRequest': function () {
        // Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
        output = HelpMessage;
        this.emit(':ask', output, welcomeRepromt);
    }
});

exports.handler = function (event, context, callback) {
    alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startSearchHandlers);
    alexa.execute();
};

// get the next meetup from the meetup.com api.
function getNextFromMeetup(callback) {
  var options = {
    //https://api.meetup.com/LittleTokyoKaiwaClub/events?photo-host=public&page=1&sig_id=&sig=
    host: 'api.meetup.com',
    path: '/LittleTokyoKaiwaClub/events?photo-host=public&page=1&sig_id=' + sig_id + '&sig=' + sig,
    method: 'GET'
  };

  var req = https.request(options, (res) => {

      var body = '';

      res.on('data', (d) => {
          body += d;
      });

      res.on('end', function () {
          callback(body);
      });

  });
  req.end();

  req.on('error', (e) => {
      console.error(e);
  });
}

String.prototype.trunc =
      function (n) {
          return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
      };
