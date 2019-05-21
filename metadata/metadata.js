const AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-2"
});

exports.handler = (event, context, callback) => {

    var codepipeline = new AWS.CodePipeline({apiVersion: '2016-10-06'});

    var params = {
        pipelineName: 'myob-pipeline', /* required */
        maxResults: '1',
    };

    codepipeline.listPipelineExecutions(params, function(err, data) {
        if (err) {
            callback(err);
        } else {
            metadata = {"technical-test": data.pipelineExecutionSummaries[0]};
            callback(null, {
                statusCode: '200',
                body: metadata
            });
        }
    });
};