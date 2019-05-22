const AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

// For ping just return a 200 status code
function ping (event, callback) {
    if (event.queryStringParameters && event.queryStringParameters.ping) {
        callback(null, {
            statusCode: '200'
        });
        return true;
    }
}

// Connect to DynamoDB and get the calls count
function getText() {
    var table = process.env.TableName,
        application = process.env.ApplicationName,
        paramsPut = {
            TableName: table,
            Item:{
                "ApplicationName": application,
                "Calls": 0
            },
            ConditionExpression: "attribute_not_exists(ApplicationName)" // Prevent rewriting the key if it exists
        };

    // Return new promise
    return new Promise(function(resolve, reject) {

        // Lets try first to add the item in case it is a new deployment, if it already exists it won't be rewritten
        docClient.put(paramsPut, function (err, data) {

            // Reject only if the error is not because the item exists
            if (err && err.code != "ConditionalCheckFailedException") {
                reject(err);
            } else {
                var paramsUpdate = {
                    TableName: table,
                    Key: {
                        "ApplicationName": application
                    },
                    UpdateExpression: "SET Calls = Calls + :inc",
                    ExpressionAttributeValues: {
                        ":inc": 1
                    },
                    ReturnValues: "UPDATED_NEW"
                };

                // As the item already exists do an atomic update
                docClient.update(paramsUpdate, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve('Hello World! This service has been called ' + data.Attributes.Calls + ' times.');
                    }
                });
            }
        });
    });
}

exports.handler = (event, context, callback) => {

    // If it is a ping event for health checks lets return early
    if (ping(event, callback)) {
        return;
    }

    // Initialize the promise
    var text = getText();

    // Process the result
    text.then(function(result){
        callback(null, {
            statusCode: '200',
            body: result,
        });
    }, function(err) {
        callback(err);
    });
};