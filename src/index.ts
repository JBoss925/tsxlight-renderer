// The entry point of the app!

// Declare dummy namespace for heroku
declare namespace JSX {
  interface Element { }
  interface ElementClass { }
  interface IntrinsicElements { div: any; }
}

function main() {

  // TODO: Update mainClass to your app's main class!
  let mainClass = require('./lightweight');
  let expressClass = require('./expressIndex');
}

main();