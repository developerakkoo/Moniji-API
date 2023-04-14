// const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
// const { uInt32 } = aleaRNGFactory(2);
// const generator1 = uInt32(); 
// console.log(generator1)

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
        {id: '_id', title: 'ID'},
        {id: 'createdAt', title: 'week'}
    ]
});
 
const   order= 
    [
        { _id:("6437daa4ac99075d7295b82d"), createdAt: 1 },
        { _id: ("6437e83403f532512b30f70b"), createdAt: 2 },
        { _id: ("6437e83803f532512b30f70d"), createdAt: 15 },
        { _id: ("6437e83903f532512b30f70f"), createdAt: 15 },
        { _id: ("6437e83a03f532512b30f711"), createdAt: 24 }
      ]
    

csvWriter.writeRecords(order)       // returns a promise
    .then(() => {
        console.log('...Done');
    });



