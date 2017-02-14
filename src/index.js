var Alexa = require('alexa-sdk');

var constants = require('./constants');
var newSessionHandlers = require('./handlers/newSession');
var startSearchHandlers = require('./handlers/startSearch');

exports.handler = function (event, context, callback) {
  console.log(context.clientContext.env.locale);
  var alexa = Alexa.handler(event, context);
  alexa.appId = constants.APP_ID;
  alexa.registerHandlers(newSessionHandlers.build(alexa), startSearchHandlers.build(alexa));
  alexa.execute();
};
