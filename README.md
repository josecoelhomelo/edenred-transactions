Node.js module to retrieve transactions from an Edenred card. 
<p><sup>Only tested with the Portuguese host/version (https://www.myedenred.pt).</sup></p>

# Installation
`npm install edenred-transactions`

# Usage

### getTransactions
Retrieves transactions in object format.

```js
const edenred = require('edenred-transactions');

edenred.getTransactions('host', 'username', 'password').then(res => {
    console.log(res);
});
```

### exportTransactions
Exports transactions to a CSV file.

```js
const edenred = require('edenred-transactions');

edenred.exportTransactions('host', 'username', 'password').then(res => {
    console.log(res);
});
```