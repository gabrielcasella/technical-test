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

function inArray(element, index, needle) {
    return element[index] === needle;
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
            "Database": {
                "online": dynamoDb_checks.online,
                "tableFound": dynamoDb_checks.tableFound,
                "latency": dynamoDb_checks.latency
            }
        }

        callback(null, JSON.stringify(response));
    });
};