var Alexa = require('alexa-sdk');
var https = require('https');
var moment = require('moment-timezone');

var constants = require('../constants');
var messages = require('../messages');

var newline = "\n";

function build(alexa) {
  var startSearchHandlers = Alexa.CreateStateHandler(constants.STATES.SEARCHMODE, {
    'AMAZON.StopIntent': function () {
      this.emit(':tell', messages.GOODBYE);
    },
    'AMAZON.HelpIntent': function () {
      output = messages.HELP;
      this.emit(':ask', output, messages.HELP);
    },
    'getNextMeetupIntent': function() {
      getNextFromMeetup(function (response) {
        var responseData = JSON.parse(response);
        var cardContent = "Next Kaiwa Club";

        // Check if we have correct data, If not create an error speech out to try again.
        if (responseData == null || responseData.errors != null && responseData.errors.length > 0 ) {
          output = "There was a problem with getting data please try again";
        } else {
          kaiwaClubDate = moment.utc(responseData[0].time).tz('America/Los_Angeles').format('dddd, MM/DD @ h:mma z');
          cardContent += newline + kaiwaClubDate;
          output = "The next Kaiwa Club is " + kaiwaClubDate;

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
      this.emit(':ask', output, messages.HELP);
    },
    'AMAZON.CancelIntent': function () {
      // Use this function to clear up and save any data needed between sessions
      this.emit(":tell", messages.GOODBYE);
    },
    'SessionEndedRequest': function () {
      // Use this function to clear up and save any data needed between sessions
      this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
      output = messages.HELP;
      this.emit(':ask', output, welcomeRepromt);
    }
  });
  return startSearchHandlers;
}

exports.build = build;

function getOptions()
{
  return {
    host: 'api.meetup.com',
    path: '/LittleTokyoKaiwaClub/events?photo-host=public&page=1&sig_id=' + process.env.MEETUP_SIG_ID + '&sig=' + process.env.MEETUP_SIG,
    method: 'GET'
  };
}

// get the next meetup from the meetup.com api.
function getNextFromMeetup(callback) {
  var options = getOptions();
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
