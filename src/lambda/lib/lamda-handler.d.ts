// NOTE: ported from @types/aws-lambda v8.10.15
// @source https://github.com/DefinitelyTyped/DefinitelyTyped/blob/9fe08c154/types/aws-lambda/index.d.ts

/**
 * AWS Lambda handler function.
 * http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
 *
 * @param event – event data.
 * @param context – runtime information of the Lambda function that is executing.
 * @param callback – optional callback to return information to the caller, otherwise return value is null.
 * @return In the node8.10 runtime, a promise for the lambda result.
 */
export type Handler<TEvent = any, TResult = any> = (
	event: TEvent,
	context: Context,
	callback: Callback<TResult>,
) => void | Promise<TResult>

/**
 * Optional callback parameter.
 * http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
 *
 * @param error – an optional parameter that you can use to provide results of the failed Lambda function execution.
 *                It can be a string for Lambda Proxy Integrations
 *                https://docs.aws.amazon.com/apigateway/latest/developerguide/handle-errors-in-lambda-integration.html
 * @param result – an optional parameter that you can use to provide the result of a successful function execution. The result provided must be JSON.stringify compatible.
 */
export type Callback<TResult = any> = (error?: Error | null | string, result?: TResult) => void

// Context
// http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
export interface Context {
	callbackWaitsForEmptyEventLoop: boolean
	functionName: string
	functionVersion: string
	invokedFunctionArn: string
	memoryLimitInMB: number
	awsRequestId: string
	logGroupName: string
	logStreamName: string
	// identity?: CognitoIdentity
	clientContext?: ClientContext
	getRemainingTimeInMillis(): number
}

export interface ClientContext {
	client: ClientContextClient
	custom?: any
	env: ClientContextEnv
}

export interface ClientContextClient {
	installationId: string
	appTitle: string
	appVersionName: string
	appVersionCode: string
	appPackageName: string
}

export interface ClientContextEnv {
	platformVersion: string
	platform: string
	make: string
	model: string
	locale: string
}
