Node.js module to retrieve transactions from an Edenred card. 
> **NOTE:** Only tested with the Portuguese version (https://www.myedenred.pt)

# Installation
Install the package using npm:
```
npm install edenred-transactions
```

After installed, import it into your project:
```js
import edenred from 'edenred-transactions';
```

# Example
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

# Methods

### login
Logs in with the provided credentials, which are passed by an object consisted of:
- Endpoint (optional; defaults to Portuguese endpoint)
- E-mail address
- Password
```js
edenred.login({
    endpoint: 'https://www.myedenred.pt/edenred-customer/api',
    user: 'your-email@provider.com',
    password: 'YourPassword123456'
});
```
In order to validate the login process, the app will prompt the user to enter the 2FA code that is sent to their e-mail. This function returns the authentication token for later use, if needed.

### getTransactions
Retrieves transactions for a specific card. If no card identification is provided, the app will attempt to retrieve one from the first card in the user's account.
```js
edenred.getTransactions('123456');
```

### saveTransactions
Saves the transactions to a file, either in CSV or JSON format.\
Use the second parameter in boolean to indicate whether to save in CSV format, which defaults to `true`.\
The third parameter indicates the folder where the file will be saved. Default is `transactions`.
```js
edenred.saveTransactions(transactionsArray, false, 'some-folder');
```