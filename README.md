# CDK Examples

This project demonstrates how to use AWS CDK with Turborepo and DDD.

## Goals
I want to answer the following questions by giving examples and resources:
- How to structure a CDK project
- How to apply DDD to a serverless architecture
- How to use Turborepo to manage a CDK project
- How to leverage certain sevices with the CDK

Each stack focuses on a specific AWS services and tries to show how to use it with the CDK.


## Project Structure

The project is structured as follows:

- `iac/` - contains the CDK project and everything related to the backend infrastructure
- `services/` - contains the services that are deployed to the backend infrastructure

Services are structured in a very simplified [DDD](https://en.wikipedia.org/wiki/Domain-driven_design) manner. This is inspired by a great [introduction to DDD by Dax Raad](https://www.youtube.com/watch?v=MC_dS5G1jqw).

![test](./assets/ddd.svg)

## Stacks

Every example is a separate stack.
The project contains the following stacks:

- `PolicyStack` - contains infrastrcuture for the policy service. It is intended to be used to update or enforce AWS policies e.g. change the retention of log groups globally or enforce a specific tag on all resources. This stack demonstrates the usage of the Event Bridge Scheduler and Lambda.
    -  [Visuals for common patterns in Event Driven Architecture](https://serverlessland.com/event-driven-architecture/visuals)

## FYI

- The CDK still has some problems with a monorepo setup. You need to install `esbuild` on the root of the project in order to build your `NodeJSFunctions`. See [this pr](https://github.com/aws/aws-cdk/pull/18216/files)