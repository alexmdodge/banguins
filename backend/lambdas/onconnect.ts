import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = async (event: any) => {
    console.log("Connect event:", JSON.stringify(Object.keys(event)));
    console.log(
        "Connect requestContext:",
        JSON.stringify(Object.keys(event.requestContext)),
    );
    console.log(
        "Connect requestContext:",
        JSON.stringify(Object.keys(event["queryStringParameters"] ?? {})),
    );

    const command = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
            connectionId: event.requestContext.connectionId,
        },
    });

    try {
        const response = await ddb.send(command);
        console.log(response);
    } catch (err) {
        return {
            statusCode: 500,
            body: "Failed to connect: " + JSON.stringify(err),
        };
    }

    return { statusCode: 200, body: "Connected" };
};
