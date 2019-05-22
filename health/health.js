const AWS = require("aws-sdk");
const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e6;

AWS.config.update({
    region: "ap-southeast-2"
});

var dynamodb = new AWS.DynamoDB();

// Calculate latency
function getTiming(startTime, endTime) {
    var secondDiff = endTime[0] - startTime[0],
        nanoSecondDiff = endTime[1] - startTime[1],
        diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff;

    return diffInNanoSecond / MS_PER_NS;
}

// Check the database connection by listing the tables and checking the application table is present
function checkDatabaseConnection() {
    var table = process.env.TableName;

    var dynamoDb_checks = {
        online: undefined,
        tableFound: undefined,
        startAt: process.hrtime(),
        endAt: undefined,
        latency: undefined
    };

    // Return new promise
    return new Promise(function(resolve, reject) {
        dynamodb.listTables({}, function (err, data) {
            dynamoDb_checks.endAt = process.hrtime();
            if (err) {
                reject(err);
            } else {
                dynamoDb_checks.online = true;
                dynamoDb_checks.tableFound = data.TableNames.includes(table);
                dynamoDb_checks.latency = getTiming(dynamoDb_checks.startAt, dynamoDb_checks.endAt);
                resolve(dynamoDb_checks);
            }
        });
    });
}

// Ping the application API to get the status
function checkAPIConnection() {
    var https = require('https'),
        api_checks = {
            online: undefined,
            statusCode: undefined,
            startAt: process.hrtime(),
            endAt: undefined,
            latency: undefined
        };

    var options = {
        hostname: process.env.HostName,
        path: '/' + process.env.Stage + '/?ping=1',
        method: 'GET'
    };

    // Return new promise
    return new Promise(function(resolve, reject) {
        https.get(options, function (res) {
            api_checks.endAt = process.hrtime();
            api_checks.online = true;
            api_checks.statusCode = res.statusCode;
            api_checks.latency = getTiming(api_checks.startAt, api_checks.endAt);
            resolve(api_checks);
        }).on('error', function (e) {
            api_checks.endAt = process.hrtime();
            api_checks.online = false;
            api_checks.statusCode = 400;
            api_checks.latency = getTiming(api_checks.startAt, api_checks.endAt);
            resolve(api_checks);
        });
    });
}

exports.handler = (event, context, callback) => {

    var response = {
        "API": {},
        "Database": {}
    };

    var APIConnection = checkAPIConnection(),
        databaseConnection = checkDatabaseConnection();


    APIConnection.then(function(APIResult) {
        console.log(JSON.stringify(APIResult));
        response["API"] = {
            "online": APIResult.online,
            "statusCode": APIResult.statusCode,
            "latency": APIResult.latency
        };

        databaseConnection.then(function(DBResult) {
            response["Database"] = {
                "online": DBResult.online,
                "tableFound": DBResult.tableFound,
                "latency": DBResult.latency
            };

            callback(null, {
                statusCode: '200',
                body: JSON.stringify(response),
            });
        }, function(err) {
            callback(err);
        });
    });
};