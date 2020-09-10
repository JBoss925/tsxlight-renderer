## TSXLight

TSXLight is a proof of concept, react-style server-side rendering engine for the web and electron. It works based on a base component class which can be extended and used with a custom JSX factory. The framework also keeps track of current users of the system and gives them each an individual renderer. Each individual renderer has its own state, its own line of communication with the user, its own callbacks, etc. This separates each of the users' systems from one another. The pages that are sent to the user are shells with the information already resolved, and a small callback script to trigger callbacks on the server via a socket. Additionally, TSXLight provides a few more features on top of the react-style component tree, with a built in event emitter system and the like.

Much like react, it has some lifecycle hooks. Although there are fewer restrictions in terms of when you can perform specific operations, so the lifecycle hooks are fairly unneeded, and the only real hook is the afterRender() hook which is called once the component is rendered.

## Some unique choices

TSXLight also has a few unique choices. The settings.json file controls most of these unique base settings. For instance, the renderer can be set to have at most 1 active connection per user, and upon opening a duplicate tab it will invalidate the other tab until that tab is refreshed (at which point the new tab will be invalidated). 

TSXLight also builds a page system on top of the component tree. The idea is that the page is registered under an ID, and that ID can be used from anywhere in the app to transition to that page with callbacks for when the page loads and unloads to handle custom transition logic.

Additionally TSXLight comes prebuilt with a state store. This means that state can easily persist between renders by using the saveState() and loadState() hooks, which also rerenders the components. To rerender without saving state in the store, the forceUpdate() function can be used.


## Juice Messenger
As a proof of concept, I have implemented a placeholder app with basic logic, called Juice Messenger. It demonstrates how callbacks work, how the component tree re-renders upon state changes, and how it is quite similar to react.


## Need these globally (may need to sudo if access is denied for any reason):

#### npm i --g typescript
#### npm i --g ts-node
#### npm i --g node
#### npm i --g electron
