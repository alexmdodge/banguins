#!/usr/bin/env node
import { AssetCode, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import {
  CfnDeployment,
  CfnIntegration,
  CfnRoute,
  CfnStage,
  WebSocketApi,
} from "aws-cdk-lib/aws-apigatewayv2";
import { App, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { CfnOutput } from "aws-cdk-lib";
import config from "./config.json";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";

const BANGUINS_STACK_ID = "banguins-app";
const BANGUINS_API_NAME = "BanguinsAppApi";
const BANGUINS_TABLE_NAME = "banguins_connections";
const LAMBDAS_ROOT = join(__dirname, "lambdas");

class BanguinsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Step 1 - Initialize API
    const name = `${id}-api`;
    const api = new WebSocketApi(this, name, {
      apiName: BANGUINS_API_NAME,
    });

    // Step 2 - Initialize DDB Table
    const APP_API_TABLE_NAME = `${name}-table`;
    const table = new Table(this, APP_API_TABLE_NAME, {
      tableName: BANGUINS_TABLE_NAME,
      partitionKey: {
        name: "connectionId",
        type: AttributeType.STRING,
      },
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Step 3 - Setup Lambda Functions
    const lambdasDefaults: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      depsLockFilePath: join(LAMBDAS_ROOT, "package-lock.json"),
      environment: {
        TABLE_NAME: BANGUINS_TABLE_NAME,
      },
      runtime: Runtime.NODEJS_LATEST,
    };

    const connectFunc = new NodejsFunction(this, "connect-lambda", {
      entry: join(LAMBDAS_ROOT, "onconnect.ts"),
      ...lambdasDefaults,
    });

    const disconnectFunc = new Function(this, "disconnect-lambda", {
      code: new AssetCode("./ondisconnect"),
      handler: "ondisconnectLambda.handler",
      runtime: Runtime.NODEJS_LATEST,
      timeout: Duration.seconds(300),
      memorySize: 256,
      environment: {
        TABLE_NAME: BANGUINS_TABLE_NAME,
      },
    });

    const messageFunc = new Function(this, "message-lambda", {
      code: new AssetCode("./sendmessage"),
      handler: "sendmessageLambda.handler",
      runtime: Runtime.NODEJS_LATEST,
      timeout: Duration.seconds(300),
      memorySize: 256,
      initialPolicy: [
        new PolicyStatement({
          actions: ["execute-api:ManageConnections"],
          resources: [
            "arn:aws:execute-api:" +
              config["region"] +
              ":" +
              config["account_id"] +
              ":" +
              api.apiId +
              "/*",
          ],
          effect: Effect.ALLOW,
        }),
      ],
      environment: {
        TABLE_NAME: BANGUINS_TABLE_NAME,
      },
    });

    table.grantReadWriteData(connectFunc);
    table.grantReadWriteData(disconnectFunc);
    table.grantReadWriteData(messageFunc);

    // access role for the socket api to access the socket lambda
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [
        connectFunc.functionArn,
        disconnectFunc.functionArn,
        messageFunc.functionArn,
      ],
      actions: ["lambda:InvokeFunction"],
    });

    const role = new Role(this, `${name}-iam-role`, {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });
    role.addToPolicy(policy);

    // lambda integration
    const connectIntegration = new CfnIntegration(
      this,
      "connect-lambda-integration",
      {
        apiId: api.apiId,
        integrationType: "AWS_PROXY",
        integrationUri:
          "arn:aws:apigateway:" +
          config["region"] +
          ":lambda:path/2015-03-31/functions/" +
          connectFunc.functionArn +
          "/invocations",
        credentialsArn: role.roleArn,
      },
    );
    const disconnectIntegration = new CfnIntegration(
      this,
      "disconnect-lambda-integration",
      {
        apiId: api.apiId,
        integrationType: "AWS_PROXY",
        integrationUri:
          "arn:aws:apigateway:" +
          config["region"] +
          ":lambda:path/2015-03-31/functions/" +
          disconnectFunc.functionArn +
          "/invocations",
        credentialsArn: role.roleArn,
      },
    );
    const messageIntegration = new CfnIntegration(
      this,
      "message-lambda-integration",
      {
        apiId: api.apiId,
        integrationType: "AWS_PROXY",
        integrationUri:
          "arn:aws:apigateway:" +
          config["region"] +
          ":lambda:path/2015-03-31/functions/" +
          messageFunc.functionArn +
          "/invocations",
        credentialsArn: role.roleArn,
      },
    );

    const connectRoute = new CfnRoute(this, "connect-route", {
      apiId: api.apiId,
      routeKey: "$connect",
      authorizationType: "NONE",
      target: "integrations/" + connectIntegration.ref,
    });

    const disconnectRoute = new CfnRoute(this, "disconnect-route", {
      apiId: api.apiId,
      routeKey: "$disconnect",
      authorizationType: "NONE",
      target: "integrations/" + disconnectIntegration.ref,
    });

    const messageRoute = new CfnRoute(this, "message-route", {
      apiId: api.apiId,
      routeKey: "sendmessage",
      authorizationType: "NONE",
      target: "integrations/" + messageIntegration.ref,
    });

    const deployment = new CfnDeployment(this, `${name}-deployment`, {
      apiId: api.apiId,
    });

    new CfnStage(this, `${name}-stage`, {
      apiId: api.apiId,
      autoDeploy: true,
      deploymentId: deployment.ref,
      stageName: "dev",
    });

    deployment.node.addDependency(connectRoute);
    deployment.node.addDependency(disconnectRoute);
    deployment.node.addDependency(messageRoute);

    // add the domain name of the ws api to the cloudformation outputs
    new CfnOutput(this, "websocket-api-endpoint", {
      description: "The endpoint for the websocket api",
      value: api.apiEndpoint + "/dev",
      exportName: "websocket-api-endpoint",
    });
  }
}

const app = new App();
new BanguinsStack(app, BANGUINS_STACK_ID);
app.synth();
