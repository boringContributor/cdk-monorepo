#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PolicyStack } from "./stacks/policy/policy-stack";

const app = new cdk.App();

const stage = app.node.tryGetContext("stage");

new PolicyStack(app, "PolicyStack", {
  stackName: `policy-stack-${stage}`,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1',
  },
});
