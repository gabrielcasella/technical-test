const AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    var table = "ApplicationCalls";

    var application = 'myob-technical-test';

    var params = {
        TableName: table,
        Key:{
            "ApplicationName": application
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            callback(JSON.stringify(err, null, 2));
        } else {
            callback(null, {
                statusCode: '200',
                body: 'Hello World!',
            });
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });

    var params = {
        TableName: table,
        Key:{
            "ApplicationName": application
        },
        UpdateExpression: "SET Calls = Calls + :inc",
        ExpressionAttributeValues:{
            ":inc": {"N": "1"}
        },
        ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                statusCode: '200',
                body: 'Hello World! ' + JSON.stringify(data, null, 2),
            });
        }
    });
};