let fs = require('fs');

function onCallbackMessenger(event) {
  let eventStr = JSON.stringify(event);
  console.log(eventStr);
}

module.exports.callbackMessenger = onCallbackMessenger;