let db;

const request = indexedDB.open("budget_tracker",1)

request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
}

request.onsuccess = function(event) {
    db = event.target.result;
    if(navigator.online){
        dbChecker();
    }  
}

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');
    transactionObjectStore.add(record);
};

function dbChecker(){
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction')
    const getAll = transactionObjectStore.getAll()
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
                const transactionObjectStore = transaction.objectStore('new_transaction');
                transactionObjectStore.clear();
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};
window.addEventListener("online", dbChecker)