class AmplifyStorage {
    // set item with the key
    setItem(key,value){
		localStorage.setItem(key, value)
	}
    // get item with the key
    getItem(key){
		localStorage.getItem(key)
	}
    // remove item with the key
    removeItem(key){
		localStorage.removeItem(key)
	}
    // clear out the storage
    clear(){
		localStorage.clear()
	}
    // If the storage operations are async(i.e AsyncStorage)
    // Then you need to sync those items into the memory in this method
    sync(){
		
	}
}