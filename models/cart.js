module.exports = function Cart(OldCart){
    this.items = OldCart.items || {};
    this.totalQty = OldCart.totalQty || 0;
    this.totalPrice = OldCart.totalPrice || 0;

    this.add = function(item, id) {
        
    //    console.log(item);
        var StoredItems = this.items[id];
        if(!StoredItems){
            StoredItems = this.items[id] = {item: item, qty:0, price:0}
        }
    //    console.log(StoredItems);
        StoredItems.qty++;
        StoredItems.price = StoredItems.item.price * StoredItems.qty;
        this.totalQty++;
        this.totalPrice +=  StoredItems.item.price;
         
    };

    this.generateArray = function(){
        var arr = [];

        for( var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };
    
}