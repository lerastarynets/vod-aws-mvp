import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({ region: process.env.REGION });

interface APIGatewayEvent {
  pathParameters?: {
    id?: string;
  };
}

interface VideoResponse {
  videoId: string;
  title: string;
  status?: string;
  playbackUrl?: string;
  errorMessage?: string;
}

export const handler = async (event: APIGatewayEvent) => {
  try {
    const videoId = event.pathParameters?.id;
    if (!videoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "videoId is required" })
      };
    }

    console.log(`Getting video ${videoId}`);
    
    const result = await ddb.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          videoId: { S: videoId }
        }
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Video not found" })
      };
    }

    const item = result.Item;

    const response: VideoResponse = {
      videoId,
      title: item.title?.S ?? "Untitled",
      status: item.status?.S
    };

    if (item.status?.S === "READY") {
      response.playbackUrl = `${process.env.CLOUDFRONT_DOMAIN}/${item.outputKey?.S}`;
    }

    if (item.status?.S === "ERROR") {
      response.errorMessage = item.errorMessage?.S ?? "Processing failed";
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(response)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};