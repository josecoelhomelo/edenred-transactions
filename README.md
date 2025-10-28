Node.js module to retrieve transactions from an Edenred card. 

> **NOTE:** Only tested with the Portuguese version (https://www.myedenred.pt)

## Installation

Install the package using npm:

```shell
npm install edenred-transactions
```

After installing, import it into your project:

```js
import edenred from 'edenred-transactions';
```

## Example

Saving transactions to a CSV file:

```js
import edenred from 'edenred-transactions';
try {
    await edenred.login({
        user: 'your-email@provider.com',
        password: 'YourPassword123456'
    });
    const transactions = await edenred.getTransactions(); 
    edenred.saveTransactions(transactions);
} catch(err) {
    console.error(err);
}
```

## Methods

### `login`

Logs in with the provided credentials.

```js
edenred.login({
    endpoint: 'https://www.myedenred.pt/edenred-customer/api',
    user: 'your-email@provider.com',
    password: 'YourPassword123456'
});
```

| Property | Definition |
| -------- | ---------- |
| `endpoint` | Optional; defaults to the Portuguese endpoint |
| `user` | The user name, e-mail address or hash |
| `password` | The user password or PIN |
| `type` | Optional; defaults to `default` and can be set to `pin` |

By using the default authentication, and in order to validate the login process, the module will prompt the user to enter the 2FA code that is sent to their e-mail. This function returns the authentication token for later use, if needed.\
To bypass the 2FA prompt, you need specific user hash and PIN code, which you can retrieve while logging in through the mobile app. This involves intercepting traffic with a tool like [HTTP Toolkit](https://httptoolkit.com) or [Burp Suite](https://portswigger.net/burp).

### `getTransactions`

Retrieves transactions for a specific card. If no card identification is provided, the module will attempt to retrieve one from the first card in the user's account.

```js
edenred.getTransactions('123456');
```

### `saveTransactions`

Saves the transactions to a file, either in CSV or JSON format.\
Use the second parameter in boolean to indicate whether to save in CSV format, which defaults to `true`.\
The third parameter indicates the folder where the file will be saved. Default is `transactions`.

```js
edenred.saveTransactions(transactionsArray, false, 'some-folder');
```