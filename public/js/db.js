

let db;

const request = indexedDB.open("budget",1)

request.onupgradeneeded = event => {
    let db = event.target.results;
    db.createObjectStore("new_transaction",{autoincrement:true})
}

request.onsuccess = event => {
    db = event.target.results;
    if(navigator.online){
        dbChecker()
    }  
}

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const  budgetObjectStore = transaction.objectStore('new_transaction');
    budgetObjectStore.add(record);
};

function dbChecker(){
    const transaction = db.transaction["new_transaction", "rewrite"]
    const storeHandler = transaction.objectStore("new_transaction")
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
            .then(() => {
                const transaction = db.transaction["new_transaction", "rewrite"]
                const storeHandler = transaction.objectStore("pending")
                storeHandler.clear()
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};
window.addEventListener("online", dbChecker)