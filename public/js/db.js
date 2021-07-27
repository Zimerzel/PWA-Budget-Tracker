let db;

const request = indexedDB.open("budget_tracker",1)

request.onupgradeneeded = event => {
    const db = event.target.results;
    db.createObjectStore('new_transaction',{autoIncrement:true});
}

request.onsuccess = event => {
    db = event.target.result;
    if(navigator.online){
        dbChecker();
    }  
}

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const storeHandler = transaction.objectStore('new_transaction');
    storeHandler.add(record);
};

function dbChecker(){
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const storeHandler = transaction.objectStore('new_transaction')
    const getAll = storeHandler.getAll()
    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch('/api/transaction', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept:"application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
        
            })
            .then(response => response.json())
            .then(serverResponse => {
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const storeHandler = transaction.objectStore('new_transaction');
                storeHandler.clear();
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};
window.addEventListener("online", dbChecker)