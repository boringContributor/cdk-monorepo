import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Schedule } from "aws-cdk-lib/aws-events";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import * as path from "path";
import { OneTimeSchedule } from "./constructs/one-time-schedule";
import { ScheduledLambda } from "./constructs/scheduled-lambda";

export class PolicyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = scope.node.tryGetContext("stage");

    const scheduledLambdaFn = new ScheduledLambda(this, `update-retention-fn-${stage}`, {
      lambdaProps: {
        functionName: `update-retention-${stage}`,
        entry: path.join(
          __dirname,
          `../../../packages/functions/policy/update-retention.ts`
        ),
        logGroupProps: {
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_WEEK,
        },
        environment: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
      },
      ruleProps: {
        schedule: Schedule.rate(Duration.days(30)),
      },
    });

    const cloudWatchPolicy = new PolicyStatement({
      actions: ["logs:PutRetentionPolicy", "logs:DescribeLogGroups"],
      resources: ["arn:aws:logs:*:*:*"],
    })

    scheduledLambdaFn.lambda.role?.attachInlinePolicy(new Policy(this, `update-retention-policy-${stage}`, {
      statements: [cloudWatchPolicy]
    }));

    new OneTimeSchedule(this, `one-time-schedule-${stage}`)
  }
}
