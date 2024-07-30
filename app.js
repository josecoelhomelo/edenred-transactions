import fs from 'fs'
import axios from 'axios';
let endpoint = 'https://www.myedenred.pt/edenred-customer/api';
let cookie, token;

/**
* Logs in the user with the provided credentials.
* @param {Object} params - The login parameters.
* @param {string} params.endpoint - The login endpoint. If not provided, the default endpoint will be used.
* @param {string} params.email - The user's email.
* @param {string} params.password - The user's password.
* @returns {Promise<boolean>} - A promise that resolves to true if the login is successful.
* @throws {Error} - If the required credentials are missing or if the login fails.
*/
const login = async (params) => {
    endpoint = params.endpoint || endpoint;
    if (!params.email || !params.password) { throw new Error('Credentials are required'); }
    return axios.post(`${endpoint}/authenticate/default`, {
        userId: params.email,
        password: params.password,
    }, {        
        params: {
            appVersion: '1.0',
            appType: 'PORTAL',
            channel: 'WEB'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then((res) => {
        cookie = res.headers['set-cookie'];
        token = res.data.data.token;
        if (!cookie || !token) { throw new Error('Login failed', { cause: res }); }
        return true;
    })
    .catch((err) => {
        throw new Error('Login failed', { cause: err });
    });
}

/**
* Retrieves the identification of the first card in user's account.
* @returns {Promise<string>} A promise that resolves to the card identification.
* @throws {Error} If login is required or if failed to retrieve card identification.
*/
const getCardId = async () => {
    if (!cookie || !token) { throw new Error('Login required'); }
    return axios.get(`${endpoint}/protected/card/list`, {      
        params: {
            appVersion: '1.0',
            appType: 'PORTAL',
            channel: 'WEB'
        },
        headers: {
            'Cookie': cookie,
            'Authorization': token
        }
    })
    .then((res) => res.data.data[0].id)
    .catch((err) => {
        throw new Error('Failed to retrieve card identification', { cause: err })
    });
}

/**
* Retrieves transactions for a specific card.
* If no card identification is provided, it will attempt to retrieve one from the first card in user's account, by using the getCardId function.
* @param {string|null} cardId - The ID of the card (optional)
* @returns {Promise<Array>} - A promise that resolves to an array of transactions
* @throws {Error} - If login is required or if there is an error retrieving the transactions
*/
const getTransactions = async (cardId = null) => {
    if (!cookie || !token) { throw Error('Login required'); }
    cardId = cardId || await getCardId();
    return axios.get(`${endpoint}/protected/card/${cardId}/accountmovement`, {      
        params: {
            appVersion: '1.0',
            appType: 'PORTAL',
            channel: 'WEB'
        },
        headers: {
            'Cookie': cookie,
            'Authorization': token
        }
    })
    .then((res) => res.data.data.movementList)
    .catch((err) => {
        throw Error('Failed to retrieve transactions', { cause: err });
    });
}


/**
* Transforms an array of transactions into a CSV string.
* @param {Array<Object>} transactions - The array of transactions to transform.
* @returns {string} The CSV string representation of the transactions.
* @throws {Error} If the transactions array is empty or not provided.
*/
const transformTransactions = (transactions) => {
    if (!transactions) { return Error('Transactions not found'); }
    const headers = Object.keys(transactions[0]);
    const body = transactions.reduce((acc, transaction) => {
        const values = headers.map(header => {
            let value = transaction[header];
            if (!value) { return ''; }
            return typeof value === 'object' ? JSON.stringify(value) : value;
        });
        return `${acc}${values.join(',')}\n`;
    }, `${headers.join(',')}\n`);
    return body;
}

/**
* Saves the transactions to a file.
* @param {Array} transactions - The transactions to be saved.
* @param {boolean} csv - Indicates whether to save the transactions as CSV or JSON. Default is 'true'.
* @param {string} folder - The folder where the file will be saved. Default is 'transactions'.
* @returns {string} - The path of the saved file.
* @throws {Error} - If transactions is not found.
*/
const saveTransactions = (transactions, csv = true, folder = 'transactions') => {
    if (!transactions) { return Error('Transactions not found'); }
    if (!fs.existsSync(folder)) { fs.mkdirSync(folder); }
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${(`0` + parseInt(date.getMonth()+1)).slice(-2)}-${(`0` + date.getDate()).slice(-2)}T${(`0` + date.getHours()).slice(-2)}-${(`0` + date.getMinutes()).slice(-2)}`;
    const extension = csv ? 'csv' : 'json';
    const path = `${folder}/${timestamp}.${extension}`;
    const body = csv ? transformTransactions(transactions) : JSON.stringify(transactions);      
    fs.writeFileSync(path, body); 
    return path;
}

export default { login, getTransactions, saveTransactions }