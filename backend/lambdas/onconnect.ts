import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const MAX_USERID_LEN = 32;
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent) => {
    const { connectionId } = event.requestContext;

    if (!connectionId) {
        return {
            statusCode: 500,
            body: "Error establishing connection via Websocket",
        };
    }

    const { gameId, userId = connectionId.substring(0, MAX_USERID_LEN) } =
        event?.queryStringParameters ?? {};

    if (!gameId) {
        return {
            statusCode: 400,
            body: "Connection request missing gameId.",
        };
    }

    if (userId.length > MAX_USERID_LEN) {
        return {
            statusCode: 400,
            body: "userId is greater than length 32 characters.",
        };
    }

    const command = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
            connectionId,
            gameId,
            userId: userId.substring(0, 32),
            connectedAt: new Date().toISOString(),
        },
    });

    try {
        await ddb.send(command);
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: "Failed to connect: " + JSON.stringify(err),
        };
    }

    return { statusCode: 200, body: "Connected" };
};
