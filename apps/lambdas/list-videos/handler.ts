import {
  DynamoDBClient,
  QueryCommand
} from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({ region: process.env.REGION });

const PAGE_SIZE = 10;

interface APIGatewayEvent {
  queryStringParameters?: {
    nextToken?: string;
  } | null;
}

export const handler = async (event: APIGatewayEvent) => {
  try {
    const query = event.queryStringParameters || {};

    const exclusiveStartKey = query.nextToken
      ? JSON.parse(Buffer.from(query.nextToken, "base64").toString("utf8"))
      : undefined;

    const command = new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: process.env.INDEX_NAME,
      KeyConditionExpression: "entityType = :entityType",
      ExpressionAttributeValues: {
        ":entityType": { S: "VIDEO" }
      },
      Limit: PAGE_SIZE,
      ExclusiveStartKey: exclusiveStartKey,
      ScanIndexForward: false,
      ProjectionExpression: "videoId, title, #st, createdAt",
      ExpressionAttributeNames: {
        "#st": "status"
      }
    });

    const result = await ddb.send(command);

    const items = (result.Items || []).map(item => ({
      videoId: item.videoId.S,
      title: item.title?.S || "",
      status: item.status?.S || "",
      createdAt: item.createdAt?.S || ""
    }));

    const nextToken = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
      : null;

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*"
      },
      body: JSON.stringify({
        items,
        nextToken
      })
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*"
      },
      body: JSON.stringify({ message: "Internal error" })
    };
  }
};