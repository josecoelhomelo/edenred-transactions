const fs = require('node:fs');
const ObjectsToCsv = require('objects-to-csv');
const axios = require('axios');
let transactions = [];

const fetchData = (api, email, password) => new Promise((resolve, reject) => {
    if (!api || !email || !password) { return reject('Host and credentials required'); }
    let cookie, token;

    axios.post(`${api}/edenred-customer/api/authenticate/default?appVersion=1.0&appType=PORTAL&channel=WEB`, {
            userId: email,
            password: password,
        },
        {            
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(res => {  
            cookie = res.headers['set-cookie'];
            token = res.data.data.token;
            
            return axios.get(`${api}/edenred-customer/api/protected/card/list?appVersion=1.0&appType=PORTAL&channel=WEB`, {
                headers: {
                    'cookie': cookie,
                    'authorization': token
                }
            })
        })
        .catch(err => reject('Login failed'))
        .then(res => {
            return axios.get(`${api}/edenred-customer/api/protected/card/${res.data.data[0].id}/accountmovement?appVersion=1.0&appType=PORTAL&channel=WEB`, {
                headers: {
                    'cookie': cookie,
                    'authorization': token
                }
            })
        })
        .catch(err => reject('Failed to retrieve ID'))
        .then(res => {
            res.data.data.movementList.forEach(item => {
                transactions.push({
                    date: item.transactionDate,
                    description: item.transactionName,      
                    amount: item.amount
                });
            });
            resolve(transactions);
        })
        .catch(err => reject('Failed to retrieve transactions'));
});
const getTransactions = (api, email, password) => new Promise((resolve, reject) => {
    fetchData(api, email, password)
        .then(res => resolve(res))
        .catch(err => reject(err));
});
const exportTransactions = (api, email, password) => new Promise((resolve, reject) => {
    fetchData(api, email, password)
        .then(async object => { 
            const folder = 'transactions'; 
            if (!fs.existsSync(folder)) { fs.mkdirSync(folder); }
            const date = new Date(); 
            const timestamp = `${date.getFullYear()}-${(`0` + parseInt(date.getMonth()+1)).slice(-2)}-${(`0` + date.getDate()).slice(-2)}T${(`0` + date.getHours()).slice(-2)}-${(`0` + date.getMinutes()).slice(-2)}`;
            const path = `${folder}/${timestamp}.csv`;        
            const csv = new ObjectsToCsv(object); 
            await csv.toDisk(path);
            resolve(path);          
        })
        .catch(err => reject(err));
});
module.exports = {
    getTransactions,
    exportTransactions
};