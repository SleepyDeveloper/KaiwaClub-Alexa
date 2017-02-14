var constants = require('../constants');
var messages = require('../messages');

function build(alexa) {
  var newSessionHandlers = {
    'LaunchRequest': function () {
      this.handler.state = constants.STATES.SEARCHMODE;
      output = messages.WELCOME;
      this.emit(':ask', output, messages.WELCOME_REPROMPT);
    },
    'getNextMeetupIntent': function () {
      this.handler.state = constants.STATES.SEARCHMODE;
      this.emitWithState('getNextMeetupIntent');
    },
    'AMAZON.StopIntent': function () {
      this.emit(':tell', messages.GOODBYE);
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
    },
  };
  return newSessionHandlers;
}

exports.build = build;
