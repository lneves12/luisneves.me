---
template: blog-post
title: "How To Gradually Introduce React.js - Don’t be afraid of legacy "
slug: introduce-reactjs-old-application-spa
date: 2019-10-14 00:03
description: How To Gradually Introduce React.js in an Old Application and
  migrate it to a SPA - Don’t be afraid of legacy
featuredImage: /assets/0_2-uaee0groi6bv6x.png
---
One of the dreams of most developers is to start a project from scratch, where legacy is not present in the dictionary and everything looks like a bed of roses.

Just because this is a wish and a best-case scenario, it doesn’t mean it’s the best option for all the cases. I can’t tell you how many refactors I’ve seen that ended up messier than the original mess. Legacy applications can have a lot of historical details that might be overlooked with a simplistic view and without the right project experience, time, and resources bandwidth.

In this piece, I’ll go through the use case of how we integrated [Uyuni](https://github.com/uyuni-project/uyuni) with React.js and transformed it from a slow multi-page application into a fast single-page application (SPA).

# Use Case

Uyuni is an application more than 15 years old and the upstream community project from which the widely used SUSE Manager is derived. As you can imagine, an application with such a long period of existence has a large number of legacy technologies and a huge codebase. At a certain point, we had to decide which strategies would be the most appropriate so as not to stay behind and to keep evolving the product according to the new trends and user demands.

If you want to keep shipping new features while introducing new technologies, you should do it iteratively; otherwise, you’ll have a hard time.

When it comes to front-end technologies, generally speaking, there are some rules that I believe can help you not to be locked to a specific technology. For instance, always think twicewhen:

* Adding a new library. Just because it will save you a couple of days at that moment it doesn’t necessarily mean it will be worth in the long term.
* Coupling your business logic to a specific framework. If all your logic is completely independent and only relies on the language native features, it doesn’t really matter which framework you use, whether it’s React.js, Vue.js, or Angular: The code should be reusable.

In Uyuni, in order to modernize our UI and technology stack, we decided to pick React.js. The React.js team did a great job of making it easy to integrate into existing applications. Looking at the official [documentation](https://reactjs.org/docs/add-react-to-a-website.html), we can see that adding React.js in the middle of a page is as simple as defining a new HTML element id that will serve as the container/root for our new application and simply calling the method `ReactDOM.render`(`<App />`, `htmlContainer`). A huge plus to this method that many people don’t know is that you can execute it as many times as you need on the same page, which can be quite handy.

The strategy we followed was to take advantage of the flexibility of this method to start introducing independent React.js trees. This way we could gradually implement new features and refactor old parts of the UI. In the following image, the blue boxes are now using React.js, and the red ones are still using the legacy server-side rendered JSP stack.

![blog 1](/assets/blog_1.png "blog 1")

Having this structure settled, we could progressively add React.js to more pages on demand.

OK, everything looks simple and straightforward! But we have a rich UI. What happens if these independent parts need to communicate with each other? How do we bundle all these small apps and inject data from the server?

In our case, this communication and shared state are still done through the server. Even with a client-side rendering engine, every page click still returns a full server page. This can also help to have a faster first-page render because all the needed information will be available in one single request — although sometimes we also rely on JSON API for more dynamic pages.

To register these new apps and inject data into them from a server-side templating technology, we took advantage of the new ES6 feature dynamic imports and its support in webpack for code splitting.

Using this strategy, webpack will automatically create a new bundle file for each React.js application that will only be fetched when the application is loaded. Uyuni only needs to be aware of the `main.bundle.js` file, which will export a global function that is capable of loading any registered application.

![webpack architecture diagram](https://miro.medium.com/max/510/0*sAO7jMCommj1_AzU)

![*main.bundle.js — base code needed to bootstrap any app through the global function spaImportReactPage*](https://miro.medium.com/max/1592/0*zv96Q8PlsVwUaHCx "*main.bundle.js — base code needed to bootstrap any app through the global function spaImportReactPage*")

*main.bundle.js - base code needed to bootstrap any app through the global function spaImportReactPage*

![*Registering a new app and entry point for its JS bundle*](https://miro.medium.com/max/1600/0*qOxyf2jS6hK7meRU "*Registering a new app and entry point for its JS bundle*")

*Registering a new app and entry point for its JS bundle*

This way it will be simple to asynchronously load any registered React.js application by name from any server-side templating technology. The method `spaImportReactPage` will return a promise with a renderer function that can be used to render our app anywhere and inject some initial state into it.

![*Example of the usage of the function SpaImportReactPage in html templating*](/assets/blog_1.png "*Example of the usage of the function SpaImportReactPage in html templating*")

Note: Bear in mind that this code is being executed inline on the HTML without any Babel transpilation. Therefore, if you need to support old browsers like Internet Explorer, you might need to add a polyfill for promises!

# **Faster Development Cycle**

Another problem we faced was that even having a more recent stack, we couldn’t use the fast development that a green React.js application can have, such as instant recompilation or hot reload. As a page isn’t fully independent and still relies on a webserver to inject data and render legacy parts, we still have to deploy these new bits on wherever the server is running.

Gladly this looked like a more *complex* problem than it really was. Using [webpack-dev-server](https://github.com/webpack/webpack-dev-server) and [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware), we can have a local webpack server doing all the black magic of recompiling our JavaScript changes and hot updates. This way we can serve all the updated files from our local environment, but still, proxy everything that isn’t front-end related and depends on a back-end server. It can be either a local development server or a remote shared test server. Thus, if you only need to work on the front end, there is no need to install the whole back end as before and still enjoy all the awesome webpack/hot-reload features.

![Feel free to take a peek on our webpack proxy configuration: <https://github.com/uyuni-project/uyuni/tree/master/web/html/src/build>](https://miro.medium.com/max/395/0*V-SrcNnmDRYV2anu "Feel free to take a peek on our webpack proxy configuration: <https://github.com/uyuni-project/uyuni/tree/master/web/html/src/build>")

*Feel free to take a peek on our webpack proxy configuration: <https://github.com/uyuni-project/uyuni/tree/master/web/html/src/build>*

# **Single Page Application**

Despite having a more recent stack and a fast development cycle, we were still not entirely happy with the final result. As we still had an old multi-page architectural style, every time a user clicked on a new page, a full refresh would happen. Although this architecture can work for simpler and less dynamic web applications, in our case it was affecting the overall experience of using the UI.

It was clear that the right direction to improve this behavior would be to move from a multi-page to a SPA architecture. When starting a new application from scratch, this can be achieved by developing an independent front-end application that controls all the pages with client routing through [react-router](https://github.com/ReactTraining/react-router) and fetches all the needed data from a JSON/graphql API. However, moving an existing legacy application towards this style can be an unfeasible effort without huge refactors.

![Green areas represent the cost on a new page](https://miro.medium.com/max/809/0*JgMQ03Axzb5nYfsY "Green areas represent the cost on a new page")

*Green areas represent the cost on a new page*

After some research and consideration, we decided to use a more pragmatic approach and follow a hybrid architectural style between a multi-page and SPA. Basically, the idea is that our routes are defined by the links themselves, and the server keeps rendering all the full pages in the same way. But instead of doing a full refresh of the page, we fetch the same link URL through an Ajax call, only replacing the needed parts on the page. This can save a lot of time while initializing a new JavaScript engine, to fetch and parse common resources, and to paint unchanged pieces. It also helps to avoid reconnecting WebSocket connections on every page.

After trying our own solution and some of the existing open source libraries, we decided to base our solution on top of the library [Senna.js](https://sennajs.com/). Other considered libraries were turbolinks and pjax, but they didn’t fulfill all of the requirements.

The major challenges we faced were:

1. Adapting badly behaved code, which was creating memory leaks on each page transition
2. Making sure that the React.js old trees DOM structure was completely unmounted

Anyway, the amount of work needed was minimal compared to an architectural refactor.

![Green areas represent the cost on a new page](https://miro.medium.com/max/913/0*6u7CqWxW2vRcoO2u "Green areas represent the cost on a new page")

*Green areas represent the cost on a new page*

Feel free to take a look at our main configuration with Senna.js/SPA: [https://github.com/uyuni-project/uyuni/tree/master/web/html/src/core/spa](https://twitter.com/luis_neves12)

# Making Transitions Even Better

All this work opened the door to a lot of possible improvements in the future. Since we have a SPA without refreshing a page on every click, we can now easily improve the transitions between pages, both in terms of speed and smoothness.

After adding this new SPA engine, we started to notice that some transitions could seem a bit clunky. Whereas a transition between two old pages would seem slick and fast, between two React pages, a white blinking page could be noticed.

As the React rendering is done client-side, this behavior is to be expected. Senna.js has no way of guessing when the new page is ready to be transitioned to. Basically, the white screen appears when the old page is removed and the new page is already mounted on the screen, but React.js is still in the process of finalizing the first initial render. This doesn’t happen in old pages because when the new page reaches the browser, it will be already rendered in the server.

The good thing is that Senna.js transitions behavior can be easily extended. Thus, we don’t have to use the synchronous default transition.

![**Image with white screen:** old page -> remove old page -> transition -> add new page -> white screen -> finish render](https://miro.medium.com/max/1305/0*r4UqVtDfigppeCXB "**Image with white screen:** old page -> remove old page -> transition -> add new page -> white screen -> finish render")

**\*Image with white screen:** old page -> remove old page -> transition -> add new page -> white screen -> finish render*

Instead, we can extend it to be asynchronous and only show the new page when the render is finished, leaving the old page as a placeholder. Basically, it will render both pages on the screen and only show the new one when everything is ready.

![**Image with asynchronous transition:** old page -> add new page -> finish render -> remove old page -> finish transition](https://miro.medium.com/max/1305/0*rXt_4QY78n5gFdM2 "**Image with asynchronous transition:** old page -> add new page -> finish render -> remove old page -> finish transition")

**\*Image with asynchronous transition:** old page -> add new page -> finish render -> remove old page -> finish transition*

Extra work can be done on the timing when the fetching happens to take advantage of the fact that all pages are fetched through Ajax. By default, the fetching happens when the user clicks a link.

However, this can be optimized. For instance, we could start fetching a page when the user shows the intent of clicking a link while hovering over it for some seconds or (even more extreme) start fetching it on the mouse-down event. The click event only happens after the mouse-up event, therefore we could save some milliseconds due to hardware limitations speed between the mouse-down and mouse-up events. After doing some tests with this strategy, we noticed improvement of around 100ms on each transition.

# Conclusion

To sum up, even if we still have a lot of room for improvement, we are quite happy with our endeavors so far. Compared to what we had before, we are getting closer to having a web application that looks like a native desktop application. Even having all these improvements, we didn’t have big architectural refactors. This can be valuable, especially in a product where most of the developers are back-end-focused, hence reducing the friction of new contributions in the front end.

Feel free to reach out with a comment if you want to discuss something further.