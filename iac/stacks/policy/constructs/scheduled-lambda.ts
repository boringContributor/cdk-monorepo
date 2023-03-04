import { Rule, RuleProps } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup, LogGroupProps } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

interface LambdaProps extends NodejsFunctionProps {
  logGroupProps?: Omit<LogGroupProps, "logGroupName">;
}

interface ScheduledLambdaProps {
  lambdaProps?: LambdaProps;
  ruleProps: RuleProps;
}

const defaultLambdaProps: Partial<NodejsFunctionProps> = {
  handler: "handler",
  memorySize: 128,
  runtime: Runtime.NODEJS_18_X,
};

export class ScheduledLambda extends Construct {
  lambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: ScheduledLambdaProps) {
    super(scope, id);

    this.lambda = this.createLambda(props.lambdaProps);
    this.scheduleLambda(props.ruleProps);
  }

  private createLambda(lambdaProps?: ScheduledLambdaProps["lambdaProps"]) {
    const lambda = new NodejsFunction(this, "Lambda", {
      ...defaultLambdaProps,
      ...lambdaProps,
    });

    new LogGroup(this, "LogGroup", {
      // replace the default log group
      logGroupName: "/aws/lambda/" + lambda.functionName,
      ...lambdaProps?.logGroupProps,
    });
    return lambda;
  }

  private scheduleLambda(ruleProps: ScheduledLambdaProps["ruleProps"]) {
    const rule = new Rule(this, "Schedule", ruleProps);
    rule.addTarget(new LambdaFunction(this.lambda));
  }
}
