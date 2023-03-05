import { Logger } from "@aws-lambda-powertools/logger";
import { CloudWatchLogs, LogGroup } from "@aws-sdk/client-cloudwatch-logs";
import { chunk, } from "remeda";

const logger = new Logger({ serviceName: "update-retention" });
const cloudWatchClient = new CloudWatchLogs({});

const CHUNK_SIZE = 100;
const RETENTION_IN_DAYS = 180; // 6 months

export const updateAll = async () => {
    const allLogGroups = await cloudWatchClient.describeLogGroups({});
    logger.info("retrieving log groups", { allLogGroupsLength: allLogGroups.logGroups?.length });

    if (!allLogGroups.logGroups) {
        return;
    }
    const chunks = chunk(allLogGroups.logGroups, CHUNK_SIZE);

    for (const chunk of chunks) {
        const putOperationPromises = chunk.filter(doesNeverExpire).map(async (logGroup) => {
            try {
                await cloudWatchClient.putRetentionPolicy({
                    logGroupName: logGroup.logGroupName,
                    retentionInDays: RETENTION_IN_DAYS,
                });
            } catch (e) {
                logger.error("Failed to update retention policy", {
                    logGroupName: logGroup.logGroupName,
                    error: e,
                });
            }
        });

        logger.info("updating chunk of log groups", { chunkSize: chunk.length });
        await Promise.all(putOperationPromises);
    }
}

const doesNeverExpire = (logGroup: LogGroup) => !logGroup.retentionInDays || logGroup.retentionInDays === 0