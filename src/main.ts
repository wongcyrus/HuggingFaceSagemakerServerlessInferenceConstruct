import { App, Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { HuggingFaceSagemakerServerlessInferenceConstruct } from "./lib/HuggingFaceSagemakerServerlessInferenceConstruct";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const hfConstruct = new HuggingFaceSagemakerServerlessInferenceConstruct(
      this,
      "huggingFaceSagemakerServerlessInferenceConstruct",
      {
        hfModelId: "cardiffnlp/twitter-roberta-base-offensive",
        hfTask: "text-classification",
      }
    );
    new PythonFunction(this, "lambda-offensiveTextModeratorFunction", {
      runtime: Runtime.PYTHON_3_9,
      memorySize: 512,
      timeout: Duration.minutes(5),
      index: "index.py",
      handler: "lambda_handler",
      entry: path.join(
        __dirname,
        "..",
        "lambda",
        "offensiveTextModeratorFunction"
      ),
      environment: {
        huggingFaceodelEndpointName: hfConstruct.endpointName,
      },
      initialPolicy: [hfConstruct.invokeEndPointPolicyStatement],
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, "HuggingFaceSagemakerServerlessInferenceConstruct-dev", {
  env: devEnv,
});
// new MyStack(app, 'HuggingFaceSagemakerServerlessInferenceConstruct-prod', { env: prodEnv });

app.synth();
