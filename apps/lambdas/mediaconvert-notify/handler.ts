import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({ region: process.env.REGION });

interface EventBridgeEvent {
  detail: {
    status: string;
    userMetadata?: {
      videoId?: string;
    };
    errorMessage?: string;
  };
}

export const handler = async (event: EventBridgeEvent) => {
  try {
    const detail = event.detail;

    const status = detail.status;
    const videoId = detail.userMetadata?.videoId;
    if (!videoId) return;

    if (status === "COMPLETE") {
      const outputKey = `${videoId}/index.m3u8`;

      await ddb.send(
        new UpdateItemCommand({
          TableName: process.env.TABLE_NAME,
          Key: { videoId: { S: videoId } },
          UpdateExpression: "SET #st = :ready, outputKey = :ok",
          ConditionExpression: "attribute_exists(videoId)",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: {
            ":ready": { S: "READY" },
            ":ok": { S: outputKey }
          }
        })
      );
    }

    if (status === "ERROR") {
      const errorMessage =
        detail.errorMessage || "MediaConvert job failed";

      await ddb.send(
        new UpdateItemCommand({
          TableName: process.env.TABLE_NAME,
          Key: { videoId: { S: videoId } },
          UpdateExpression: "SET #st = :err, errorMessage = :msg",
          ConditionExpression: "attribute_exists(videoId)",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: {
            ":err": { S: "ERROR" },
            ":msg": { S: errorMessage }
          }
        })
      );
    }

    return { statusCode: 200 };
  } catch (err) {
    console.error(err);
    throw err;
  }
};