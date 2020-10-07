---
template: blog-post
title: How To Gradually Introduce React.js in an Old Application and migrate it
  to a SPA - Don’t be afraid of legacy
slug: introduce-reactjs-old-application-spa
date: 2019-10-14 00:03
description: How To Gradually Introduce React.js in an Old Application and
  migrate it to a SPA - Don’t be afraid of legacy
featuredImage: /assets/0_2-uaee0groi6bv6x.png
---
One of the dreams of most developers is to start a project from scratch, where legacy is not present in the dictionary and everything looks like a bed of roses.

Just because this is a wish and a best-case scenario, it doesn’t mean it’s the best option for all the cases. I can’t tell you how many refactors I’ve seen that ended up messier than the original mess. Legacy applications can have a lot of historical details that might be overlooked with a simplistic view and without the right project experience, time, and resources bandwidth.

In this piece, I’ll go through the use case of how we integrated [Uyuni](https://github.com/uyuni-project/uyuni) with React.js and transformed it from a slow multi-page application into a fast single-page application (SPA).