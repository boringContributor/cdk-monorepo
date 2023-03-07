import { Construct } from 'constructs';
import { CfnSchedule, CfnScheduleGroup } from 'aws-cdk-lib/aws-scheduler';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { LambdaWithLogGroup } from '../../../constructs/lambda-with-loggroup';
import * as path from 'path';

export class OneTimeSchedule extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
    
        const consumerFn = this.createConsumer();

        this.createOneTimeSchedule(consumerFn.lambda.functionArn);
      }

      private createConsumer() {
        return new LambdaWithLogGroup(this, 'schedule-consumer', {
            entry: path.join(__dirname, `../../../../packages/functions/policy/create-retention.ts`),
        })
      }

      private createRole(fnArn: string) {
        // can you add assume role?
        const role = new Role(this, 'scheduler-role', {
          assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
        })
    
        role.addToPolicy(
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [fnArn],
          })
        );
    
        return role;
      }

      private createOneTimeSchedule (functionArn: string) {
        const instanceIds = ['i-0592cdaf40c14c22a'];


        // DLQ for any schedules that fail
        const DLQ = new Queue(this, 'queue', {
          queueName: 'policy-manager-dlq',
        });
    
        // create a group for our schedules
        const group = new CfnScheduleGroup(this, 'policy-manager', {
          name: 'policy-manager'
        })
    
        new CfnSchedule(this, 'one-time-schedule', {
          groupName: group.name,
          flexibleTimeWindow: {
            mode: 'OFF',
          },
          scheduleExpression: `at(2023-03-07T22:43:00)`,
          // find more timezones here https://www.iana.org/time-zones
          scheduleExpressionTimezone: 'Europe/Berlin',
          description: 'One time scheduled lambda',
          target: {
            deadLetterConfig: {
              arn: DLQ.queueArn,
            },
            arn: functionArn,
            roleArn: this.createRole(functionArn).roleArn,
            input: JSON.stringify({ InstanceIds: instanceIds }),
          },
        });
      }
}