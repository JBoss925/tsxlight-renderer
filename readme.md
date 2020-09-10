## TSXLight

TSXLight is a proof of concept, react-style server-side rendering for HTML. It works based on a base component class which can be extended and used with a custom JSX factory. The framework also keeps track of current users of the system and gives them each an individual renderer. Each individual renderer has its own state, its own line of communication with the user, its own callbacks, etc. This separates each of the users' systems from one another. The pages that are sent to the user are shells with the information already resolved, and a small callback script to trigger callbacks on the server via a socket. Additionally, TSXLight provides a few more features on top of the react-style component tree, with a built in event emitter system and the like.

## Juice Messenger
As a proof of concept, I have implemented a placeholder app with basic logic, called Juice Messenger. It demonstrates how callbacks work, how the component tree re-renders upon state changes, and how it is quite similar to react.


## Need these globally (may need to sudo if access is denied for any reason):

#### npm i --g typescript
#### npm i --g ts-node
#### npm i --g node
#### npm i --g electron
