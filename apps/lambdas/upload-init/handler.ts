import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const ddb = new DynamoDBClient({ region: process.env.REGION });
const s3 = new S3Client({ region: process.env.REGION });

interface APIGatewayEvent {
  body?: string;
}

export const handler = async (event: APIGatewayEvent) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const title = body.title || "Untitled";
    const filename = (body.filename || "upload.mp4").replace(/[^a-zA-Z0-9._-]/g, "_");
    const videoId = crypto.randomUUID();
    const uploadKey = `${videoId}/${filename}`;

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.UPLOADS_BUCKET,
        Key: uploadKey,
        ContentType: body.contentType || "video/mp4",
      }),
      { expiresIn: 3600 }
    );

    const now = new Date().toISOString();

    await ddb.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          videoId: { S: videoId },
          title: { S: title },
          status: { S: "PENDING" },
          inputKey: { S: uploadKey },
          createdAt: { S: now },
          updatedAt: { S: now }
        }
      })
    );

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ videoId, uploadUrl, uploadKey })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Internal error" };
  }
};