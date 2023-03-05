import { injectLambdaContext, Logger } from "@aws-lambda-powertools/logger";
import middy from "@middy/core";
import * as Retention from "../../core/policy/retention-service";

const logger = new Logger({ serviceName: "update-retention" });


const main = async (): Promise<void> => {
    await Retention.updateAll();
};

export const handler = middy(main).use(injectLambdaContext(logger));
