const AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    callback(null, {
        statusCode: '200',
        body: 'Hello World!',
    });
};