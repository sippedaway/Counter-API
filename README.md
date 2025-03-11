[![Node.JS](https://img.shields.io/badge/node.js-339933?logo=Node.js&logoColor=white)](#)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?logo=vercel&logoColor=white)
[![GitHub created at](https://img.shields.io/github/created-at/sippedaway/Counter-API
)](#)
[![GitHub last commit](https://img.shields.io/github/last-commit/sippedaway/Counter-API
)](#)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K31AMKAQ)

# Counter-API
A simple API to hold counters (a number) inside an infinite amount of branches. Add Authentication keys, various projects (roots) and more, completely for free!

**Example:** Add +1 counter to the root `example` branch `main`: https://counter.sipped.org/punch/example/a5a8ca2c49a30a1bd9f15da562edbd7c/main

## Why did I create this?
I was working on my personal [blog](https://blog.sipped.org) and I really wanted to have a Views counter on each page, however finding a free, simple and effortless way to do it would either take too long or be too annoying. And so I created this simple Counter-API in just an hour or less, hosted it on Vercel and here it is!

## How to use it
### First of all, let's understand the _basics_.

- **Root**: a root is basically a project, where you can add an infinite amount of **branches** that have their own counts. A root doesn't have a count, it simple serves as a repository for all branches. You can add/remove **authentication keys** and **branches**. When you create a root, you must specify an **ADMIN password** for the root, which serves as the password to manage all things inside a root.
- **Branch**: added into a **root** (requires **ADMIN password** to be added). Each branch has its own **count**, which is the number. When creating a **root**, the branch `main` is added by default with the **count** 0.
- **Authentication key**: added into a **root** (requires **ADMIN password** to be added). Required to run `/get/` and `/punch/`, which we'll talk about later on.

In order to use Counter-API, you can either:
- **Run a `GET` API call** in a website, project, app... or using a tool like [Postman](https://www.postman.com/) or a free online alternative like [Reqbin](https://reqbin.com/)
- **Just run the page** inside your browser!

## All API endpoints
Counter-API is hosted with Vercel at https://counter.sipped.org.

<details>
<summary>Create a root</summary>
<br>

`https://counter.sipped.org/create/:ROOTNAME/:PASSWORD`

Creates a root and a branch called `main` with Count 0

Variables:
- `:ROOTNAME` - a name for your root
- `:PASSWORD` - the ADMIN Password for your root
</details>

### Admin-only
Roots:

<details>
<summary>Delete a root (Admin)</summary>
<br>
  
`https://counter.sipped.org/manage/:ROOTNAME/:PASSWORD/delete`

Careful! Deletes a root, its data, branches and auth keys permanently. Does not ask for any confirmation!

Variables:
- `:ROOTNAME` - your root name
- `:PASSWORD` - the ADMIN Password for your root

</details>

<details>
<summary>Get all information about a root (Admin)</summary>
<br>

`https://counter.sipped.org/manage/:ROOTNAME/:PASSWORD`

Returns all information about a root: all authentication keys and their names, branches and their counts, and the ADMIN password

Variables:
- `:ROOTNAME` - your root name
- `:PASSWORD` - the ADMIN Password for your root

</details>

Authentication keys:

<details>
<summary>Create an Authentication key for root (Admin)</summary>
<br>

`https://counter.sipped.org/manage/:ROOTNAME/:PASSWORD/create/key/:KEYNAME`

Creates an authentication key in root (token under the name :KEYNAME) that can be later used for `/get/` or `/punch/`

Variables:
- `:ROOTNAME` - your root name
- `:PASSWORD` - the ADMIN Password for your root
- `:KEYNAME` - the name for your authentication key. This is NOT the authentication key token itself

</details>

<details>
<summary>Remove an Authentication key from root (Admin)</summary>
<br>

`https://counter.sipped.org/manage/:ROOTNAME/:PASSWORD/remove/key/:KEYNAME`

Removes an authentication key from root entirely

Variables:
- `:ROOTNAME` - your root name
- `:PASSWORD` - the ADMIN Password for your root
- `:KEYNAME` - the name for your authentication key. This is NOT the authentication key token itself. Does not ask for confirmation, cannot be reverted!

</details>

Branches:

<details>
<summary>Create a Branch in root (Admin)</summary>
<br>

`https://counter.sipped.org/manage/:ROOTNAME/:PASSWORD/create/branch/:BRANCHNAME`

Creates a branch in root (with Count 0) that can be later used in `/get/` or `/punch/`

Variables:
- `:ROOTNAME` - your root name
- `:PASSWORD` - the ADMIN Password for your root
- `:BRANCHNAME` - the name for your branch

</details>

<details>
<summary>Remove a Branch from root (Admin)</summary>
<br>

`https://counter.sipped.org/manage/:ROOTNAME/:PASSWORD/remove/branch/:BRANCHNAME`

Removes a branch from root entirely. Does not ask for confirmation, cannot be reverted!

Variables:
- `:ROOTNAME` - your root name
- `:PASSWORD` - the ADMIN Password for your root
- `:BRANCHNAME` - the name of your branch

</details>

<details>
<summary>Set count for a Branch in root (Admin)</summary>
<br>

`https://counter.sipped.org/manage/:ROOTNAME/:PASSWORD/:BRANCHNAME/set-count/:COUNT`

Sets a branch's count. Does not ask for confirmation, cannot be reverted!

Variables:
- `:ROOTNAME` - your root name
- `:PASSWORD` - the ADMIN Password for your root
- `:BRANCHNAME` - the name for your branch
- `:COUNT` - the count (must be a number)

</details>

### Requires authentication key:

<details>
<summary>Get a branch's count</summary>
<br>

`https://counter.sipped.org/get/:ROOTNAME/:KEY/:BRANCHNAME`

Returns the Count of a branch inside a root. Does not change anything.

**Note:** Requires an authentication key TOKEN, not the authentication key name!

Variables:
- `:ROOTNAME` - your root name
- `:KEY` - the authentication key token
- `:BRANCHNAME` - the name for your branch

</details>

<details>
<summary>Add +1 to a branch's count and get the count (Punch)</summary>
<br>

`https://counter.sipped.org/punch/:ROOTNAME/:KEY/:BRANCHNAME`

Adds +1 to the Count of a branch inside a root, and then returns the new Count.

**Note:** Requires an authentication key TOKEN, not the authentication key name!

Variables:
- `:ROOTNAME` - your root name
- `:KEY` - the authentication key token
- `:BRANCHNAME` - the name for your branch

</details>

## Used in:
- [sipped/blog](https://blog.sipped.org) - my personal blog! Each blog page has its own views counter. Root: `blog`

Want to have your own project mentioned here? **Contact me [here](#contact)!**

## Version
### 1.0
- **Release:** March 13 2025

## Credits
- [sipped](https://github.com/sippedaway)

Support me and get early access to Counter-API (and all my other projects) updates, changes and early looks __for as low as $3__: https://ko-fi.com/sipped

## Contact
- Personal email - say hi, questions, feedback: hello@sipped.org
- Business email - legal, business inquiries, partnership: business@sipped.org

Issue? Leave a GitHub Issue, thanks!
