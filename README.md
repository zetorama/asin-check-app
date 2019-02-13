# asin-check-app

So, it was a take-home assignment for a software engineer position from a very nice company.

## Tech Challenge


> Given an Amazon product ASIN (a unique identifier amazon uses for its products), build an application that can fetch the category, rank & product dimensions of that product on Amazon, store that data in some sort of database, and display the data on the front-end. For example, the details for ASIN "B002QYW8LW" can be found [here](http://www.amazon.com/dp/B002QYW8LW).
>
> PS. You're probably going to think the best solution for the challenge would be to use Amazon's Product API & you're right - but registering for that is a mission! The API isn't available and you will need to figure out an alternative method :)

## Technology used

- Typescript
- React, Mobx/MST, Bootstrap
- Jest/Enzyme
- Netlify’s Functions _(these were new to me)_
- MongoDB (Atlas)

## UI Preview

![ui](https://www.dropbox.com/s/bhj0za9yxjcjkj8/Screenshot%202019-02-12%2022.30.33.png?raw=1)

## Scripts
```
yarn start # starts dev server (i.e. runs `yarn serve:*`)
yarn serve:web # serves React app on localhost:3000
yarn serve:lambda # immitates Netlify's lambdas on localhost:9000
```
