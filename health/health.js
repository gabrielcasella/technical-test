const AWS = require("aws-sdk");
const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e6;
const table_name = 'ApplicationCalls';

AWS.config.update({
    region: "ap-southeast-2"
});

var dynamodb = new AWS.DynamoDB();

function getTiming(startTime, endTime) {
    var secondDiff = endTime[0] - startTime[0];
    var nanoSecondDiff = endTime[1] - startTime[1];
    var diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff;

    return diffInNanoSecond / MS_PER_NS;
}

exports.handler = (event, context, callback) => {

    var dynamoDb_checks = {
        online: undefined,
        tableFound: undefined,
        startAt: process.hrtime(),
        endAt: undefined,
        latency: undefined
    };

    dynamodb.listTables({}, function (err, data) {
        dynamoDb_checks.endAt = process.hrtime();
        if (err) {
            console.log(err, err.stack);
        } else {
            dynamoDb_checks.online = true;
            dynamoDb_checks.tableFound = data.TableNames.includes(table_name);
            dynamoDb_checks.latency = getTiming(dynamoDb_checks.startAt, dynamoDb_checks.endAt);
        }

        var response = {
            "API": {
                "online": false,
                "latency": 0
            },
            "Database": {
                "online": dynamoDb_checks.online,
                "tableFound": dynamoDb_checks.tableFound,
                "latency": dynamoDb_checks.latency
            }
        }

        var https = require('https');

        var api_checks = {
            online: undefined,
            statusCode: undefined,
            startAt: process.hrtime(),
            endAt: undefined,
            latency: undefined
        };

        var options = {
            hostname: 'vcwgpbc01m.execute-api.ap-southeast-2.amazonaws.com',
            path: '/Stage/?ping=1',
            method: 'GET'
        };
        https.get(options, function(res) {
            api_checks.online = true;
            api_checks.endAt = process.hrtime();
            api_checks.statusCode = res.statusCode;
            api_checks.latency = getTiming(api_checks.startAt, api_checks.endAt);
            response["API"] = {
                "online": api_checks.online,
                "statusCode": api_checks.statusCode,
                "latency": api_checks.latency
            };
            callback(null, {
                statusCode: '200',
                body: JSON.stringify(response),
            });
        }).on('error', function(e) {
            console.log(e);
            api_checks.online = false;
            api_checks.statusCode = e.statusCode;
            api_checks.endAt = process.hrtime();
            api_checks.latency = getTiming(api_checks.startAt, api_checks.endAt);
            response["API"] = {
                "online": api_checks.online,
                "statusCode": api_checks.statusCode,
                "latency": api_checks.latency
            };
            callback(null, {
                statusCode: '200',
                body: JSON.stringify(response),
            });
        });
    });
};