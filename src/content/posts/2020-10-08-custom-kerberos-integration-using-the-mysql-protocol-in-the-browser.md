---
template: blog-post
title: Custom Kerberos integration using the MySQL protocol in the browser
slug: kerberos-mysql-browser
date: 2020-10-08 14:06
description: Custom Kerberos integration using the MySQL protocol in the browser
---
When you put these 3 words together: Kerberos, MySQL authentication, and a Browser, they can look quite daunting at first glance.

My goal with this post is to briefly explain how we integrated them all in a very simple and neat way.

I am not going too deep in the concepts I just mentioned but mainly will focus on the solution itself. There are plenty of resources already across the whole internet explaining those concepts.

## **Use Case**

The application in the matter is MemSQL Studio, a stateless UI to manage and interact with a MemSQL cluster.

First of all, let’s take a quick look at its architecture:

* Studio has no state. The UI is simply a tool to interact with a cluster in a simpler way. All the authentication logic and displayed information is powered by the cluster.
* MemSQL wire protocol is MySQL compatible, which allows us to use any existing MySQL driver.
* Studio can run without any backend server and solely inside a browser. Well, we still need a light server to server static resources, but that dependency could easily be removed if needed
* For communication with the cluster we use a forked version of the mysqljs driver inside a browser worker thread. We can say that the Studio "backend" lives inside the worker. 
  You can take look at following [blogpost](https://www.memsql.com/blog/web-workers-client-side-react-redux/) to read more in deep about that.
* All the authentication logic is managed by the MySQL driver

Kerberos is an authentication protocol that is widely used in the enterprise world. The main goal is to provide a secure Single Sign-On mechanism to reuse the existing system authenticated credentials:

* User logs in into their laptop.
* System generates a Kerberos service ticket.
* Any used APP is automatically logged in reusing that system service ticket.

**Goal:** make studio part of the SSO flow

## Challenges

Looking at the existing MySQL drivers, the support for Kerberos authentication is very limited and its existence depends on system native libraries, which is impossible to achieve inside a browser context.

Our first approach was to implement that support inside our mysqljs fork and ship Studio as an electron desktop application. In order for that to work, we extended our mysqljs driver to support the GSSAPI, a standardized authentication API that supports Kerberos authentication.

*Limitations:*

* This solution would give us full control, but Kerberos authentication would only work for the desktop application, which is not ideal.
* Shipping an application in a different target binary and adding new third party libraries has a huge maintenance cost that lasts forever. This cost shouldn't be taken lightly.



## Final solution

Luckily, the browsers already provide a native Kerberos implementation for HTTP requests using the SPNEGO protocol, although that API is very limited on what you can do with it.

The remaining question now is: how do we integrate that with the MySQL protocol inside the browser?

Thinking a little outside the box, the answer can be simpler than it looks:

* We extended the MySQL *"Auth Switch Request Packet"* so that when it receives the *"auth_gssapi_client"* auth request, it will do an HTTP get request to a custom API endpoint controlled by Studio.
* This new endpoint, instead of implementing the full Spnego protocol, implements only the first part of it. We don't want to have Kerberos service ticket validation logic in Studio, as said previously that logic should be part of the cluster authentication.
* This first part consists of:

  * if the HTTP header "Authorization Negotiate" is not present, it returns a ***401*** with a response header: ***WWW-Authenticate: Negotiate***. This will force the browser to initialize the Spnego protocol and contact the Kerberos KDC to authenticate the user. More information about how this works can be found at [https://www.chromium.org/developers/design-documents/http-authentication](https://www.chromium.org/developers/design-documents/http-authentication)
  * If the previous header is present, we assume that the browser has already authenticated the user, so we just return back the service ticket from the "Authorization Negotiate" header
* We grab the service ticket on the response and inject it inside the MySQL authentication packet.
* The MemSQL cluster can now validate the service ticket and authenticate the user.

At the end of the day, we were quite happy with this solution. It works everywhere, not that many lines of code to maintain and no external third party libraries involved.