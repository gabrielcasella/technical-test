const AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-2"
});

exports.handler = (event, context, callback) => {

    var codepipeline = new AWS.CodePipeline({apiVersion: '2016-10-06'});

    var params = {
        pipelineName: process.env.PipelineName,
        maxResults: '1',
    };

    codepipeline.listPipelineExecutions(params, function(err, data) {
        if (err) {
            callback(err);
        } else {
            let summary = data.pipelineExecutionSummaries[0];
            let metadata = {
                "myob-technical-test": {
                    "lastbuildstatus": summary.status,
                    "updated": summary.lastUpdateTime,
                    "lastcommitsha": summary.sourceRevisions[0].revisionId
                }
            };

            callback(null, {
                statusCode: '200',
                body: JSON.stringify(metadata)
            });
        }
    });
};