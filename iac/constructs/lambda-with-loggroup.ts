import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Architecture, IDestination, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface Props {
    entry: string;
    duration?: Duration;
    envVariables?: Record<string, string>;
    memorySize?: number;
    bundling?: any;
    onFailure?: IDestination;
    retries?: number;
}

export class LambdaWithLogGroup extends Construct {
    lambda: NodejsFunction;
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const {
            entry,
            duration = Duration.minutes(1),
            envVariables,
            memorySize = 128,
            bundling,
            onFailure,
            retries = 0
        } = props;

        this.lambda = new NodejsFunction(this, `fn`, {
            memorySize: memorySize,
            timeout: duration,
            handler: 'main',
            entry: entry,
            environment: envVariables,
            bundling: bundling,
            runtime: Runtime.NODEJS_16_X,
            architecture: Architecture.ARM_64,
            onFailure,
            retryAttempts: retries,
        });

        new LogGroup(this, `consumer-log-group`, {
            logGroupName: '/aws/lambda/' + this.lambda.functionName,
            retention: RetentionDays.ONE_WEEK,
            removalPolicy: RemovalPolicy.DESTROY
        });
    }
}
