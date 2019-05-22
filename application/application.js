const AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

function ping (event, callback) {
    if (event.queryStringParameters && event.queryStringParameters.ping) {
        callback(null, {
            statusCode: '200'
        });
        return true;
    }
}

exports.handler = (event, context, callback) => {

    // If it is a ping event for health checks lets return early
    if (ping(event, callback)) {
        return;
    }

    var table = "ApplicationCalls";

    var application = 'myobTechnicalTest';

    var params = {
        TableName:table,
        Item:{
            "ApplicationName": application,
            "Calls": 0
        },
        ConditionExpression: "attribute_not_exists(ApplicationName)"
    };

    docClient.put(params, function(err, data) {
        if (err && err.code != "ConditionalCheckFailedException") {
            callback(err);
        } else {
            params = {
                TableName: table,
                Key:{
                    "ApplicationName": application
                },
                UpdateExpression: "SET Calls = Calls + :inc",
                ExpressionAttributeValues:{
                    ":inc": 1
                },
                ReturnValues:"UPDATED_NEW"
            };

            docClient.update(params, function(err, data) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, {
                        statusCode: '200',
                        body: 'Hello World! This service has been called ' + data.Attributes.Calls + ' times.',
                    });
                }
            });
        }
    });
};