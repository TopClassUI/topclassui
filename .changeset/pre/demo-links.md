---
"topclassui": patch
---

The demos the CLI copies link to a named fragment such as `#billing` or a query on the page such as `?page=2`, and their forms submit with GET to the page they are on, instead of example paths like `/shop`, `/blog?page=2` or `/subscribe`, which led to a 404 on any site that renders them.
