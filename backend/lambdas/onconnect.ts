import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
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
