

let db;

const request = indexedDB.open("budget",1)

request.onupgradeneeded = event => {
    let db = event.target.results;
    db.createObjectStore("pending",{autoincrement:true})
}

request.onsuccess = event => {
    db = event.target.results;
    if(navigator.online){
        dbChecker()
    }  
}

function dbChecker(){
    const transaction = db.transaction["pending", "rewrite"]
    const storeHandler = transaction.objectStore("pending")
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
                const transaction = db.transaction["pending", "rewrite"]
                const storeHandler = transaction.objectStore("pending")
                storeHandler.clear()
            });
        }
    }
};
window.addEventListener("online", dbChecker)