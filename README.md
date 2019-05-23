# myob-technical-test

A simple hello world API that also responds to metadata and health requests.

Hello World: 
https://vcwgpbc01m.execute-api.ap-southeast-2.amazonaws.com/Prod/

Metadata:
https://vcwgpbc01m.execute-api.ap-southeast-2.amazonaws.com/Prod/metadata

Health:
https://vcwgpbc01m.execute-api.ap-southeast-2.amazonaws.com/Prod/health

## Resource information

Root resource:

- The root resource responds with ```Hello World!``` followed by how many times the service has been called. This is achieved
by storing the number of calls in a DynamoDB database. Each new visit the number will increase, or it will be initialized
if it is the first visit.

Metadata resource:

- The metadata resource lists the current build's information, like the status, timestamp when it was last updated and the
last commit sha.


Health resource:

- The health resource provides information about the status of each service, checking that DynamoDB can be accessed and that
the required table exists. It also provides information about the root resource.

## Deployment information

The project consists on a  CI/CD pipeline achieved with AWS CodePipeline and it detects when there is a source change after
a commit is pushed to the main branch, it then builds the project and run some basic unit tests. After that it creates
a change state in the deployment phase which is later executed.

The project is managed with infrastructure as code so it can be deployed easily after configuring the pipeline.

It first declares the needed permissions and creates the appropriate IAM roles, then creates the database table
and to finalise it creates the lambda functions with their associated api gateway.

## Deployment steps

First two IAM roles are created:

- ```cfn-lambda-pipeline``` with DynamoDB, LambdaExecute, CodeDeploy, API Gateway, CloudFormation, S3 and IAM permissions
- ```codebuild-tech-test-myob-service-role``` for the build process, so it should have logs, S3 and the required permissions
testing (in this case DynamoDB and CodePipeline access).

If wanted create a S3 bucket to store the artifacts (can be omitted and one will be created by default).

In AWS CodePipeline:

- Create new pipeline with a github source repository ```gabrielcasella/technical-test``` and pointing to the master branch.
- Select the created S3 bucket or let it create one by default.
- For build provider select ```CodeBuild``` and create a new project with a standard Ubuntu managed instance, build spec file: ```buildspec.yml```
- For deploy provider select ```CloudFormation``` with action ```create or replace a changeset```
- Give the stack a name ```myob-pipeline-stack```
- Give the change set a name ```myob-pipeline-changeset```
- Template: ```BuildArtifact::outputtemplate.yaml```
- For capabilities select ```CAPABILITY_IAM``` and ```CAPABILITY_NAMED_IAM``` so it can create IAM roles for us.
- Role: ```cfn-lambda-pipeline```
- Click "Create Pipeline"

After the pipeline is create we need to add another stage to the deployment process to actually execute the change set so:

- Edit the created pipeline
- Go to "Deploy" and click "Edit"
- Add an action group after the Deploy action group and name it execute-changeset
- Action provider ```AWS CloudFormation```
- Input artifacts ```Build Artifact```
- Action mode ```Execute changeset```
- Use the same stack and changeset names from the previous step.

If everything is correct the project should start building to be deployed, and any commits to the master branch should
trigger the build process.

The health check might not work after the first deployment as the API gateway id needs to be updated.

## Current risks and limitations

Regarding the application I noticed the following risks:

- It is an open API gateway with no authorizers or API keys configured, and it could generate important costs if it is misused
- There is no firewall protecting the API, I could have used WAF & Shield, for example.

Deployment risks:

- The unit tests are scarce and should run also after the application has been deployed to test the actual service by checking
the metadata and health endpoints
- SNS should have been used to quickly communicate any issues with the build process.
- The IAM policies are too open, they could have been restricted to just the required resources.
- The api gateway id has been hardcoded into the template.yaml and it should be a reference.