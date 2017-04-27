/**
 * Created by Kong on 4/24/2017
 */
// REQUIRE STUFF
var mysql = require('mysql'),
    inq = require('inquirer'),
    table = require('cli-table'),
// CREATE CONNECTION TO DATABASE
    connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'bamazon'
    });
// START CONNECTION
connection.connect(function (up) {
    if (up) throw up;
    console.log('Success ' + connection.threadId);
    buyStuff();
});
// BUY STUFF
function buyStuff() {
    let select = 'SELECT * FROM `products`';
    connection.query(select, function (up, data) { // GET LIST TO DISPLAY
        if (up) throw up;
        let stuff = [];
        for (let i = 0; i < data.length; i++) {
            stuff.push(data[i].item_id + '.' + data[i].product_name + ' $' + data[i].price);
        }
        // PICK ITEM AND HOW MANY TO BUY
        inq.prompt([
            {
                type: 'list',
                name: 'option',
                message: 'What do you want to purchase?',
                choices: stuff
            },
            {
                type: 'input',
                name: 'quantity',
                message: 'How many would you like to buy?',
                validate: function (input) {
                    if (Number.isInteger(parseFloat(input)) && input > 0) return true;
                    else {
                        console.log('\nMust be whole number greater than 0.');
                        return false;
                    }
                }
            }

        ]).then(function (res) {
            let id = res.option.split('.');
            id = id[0] - 1;
            // NONE LEFT IN STOCK
            if (data[id].stock_quantity === '0') {
                console.log('\nSorry the item you are trying to purchase is no longer in stock.');
                buyStuff();
            }
            // SOME IN STOCK BUT TRIED TO BUY TOO MANY
            else if (data[id].stock_quantity < res.quantity) {
                console.log('\nSorry we only have ' + data[id].stock_quantity + ' left in stock. Please try again');
                buyStuff();
            }
            // HAVE ENOUGH IN STOCK
            else {
                connection.query('UPDATE `products` SET ? WHERE ?',
                    [{stock_quantity: data[id].stock_quantity - res.quantity},
                        {item_id: id + 1}]);
                buyStuff();
            }
        })
    });
}