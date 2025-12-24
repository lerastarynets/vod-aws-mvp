import {
    MediaConvertClient,
    CreateJobCommand
  } from "@aws-sdk/client-mediaconvert";
  import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
  
  const ddb = new DynamoDBClient({ region: process.env.REGION });
  
  let mc: MediaConvertClient | undefined;
  
  function getMediaConvertClient(): MediaConvertClient {
    if (!mc) {
      mc = new MediaConvertClient({ region: process.env.REGION });
    }
    return mc;
  }
  
  interface S3Event {
    Records: Array<{
      s3: {
        bucket: { name: string };
        object: { key: string };
      };
    }>;
  }
  
  export const handler = async (event: S3Event) => {
    try {
      const record = event.Records[0];
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key);
  
      const videoId = key.split("/")[0]; // {videoId}/filename.mp4
  
      const mcClient = await getMediaConvertClient();
  
      const job = await mcClient.send(
        new CreateJobCommand({
          Role: process.env.MEDIACONVERT_ROLE,
          JobTemplate: process.env.TEMPLATE_NAME,
          UserMetadata: { videoId },
          Settings: {
            Inputs: [{ 
              FileInput: `s3://${bucket}/${key}`,
              AudioSelectors: {
                "Audio Selector 1": {
                  DefaultSelection: "DEFAULT"
                }
              }
            }],
            OutputGroups: [
              {
                OutputGroupSettings: {
                  Type: "HLS_GROUP_SETTINGS",
                  HlsGroupSettings: {
                    Destination: `s3://${process.env.OUTPUTS_BUCKET}/${videoId}/index`
                  }
                }
              }
            ]
          },
        })
      );
  
      await ddb.send(
        new UpdateItemCommand({
          TableName: process.env.TABLE_NAME,
          Key: { videoId: { S: videoId } },
          UpdateExpression: "SET #st = :s",
          ConditionExpression: "attribute_exists(videoId)",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: {
            ":s": { S: "PROCESSING" }
          }
        })
      );
  
      return { statusCode: 200 };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };