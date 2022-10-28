import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import path, {join} from 'path';
import {fileURLToPath} from 'url';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

const __filename = fileURLToPath(import.meta.url);

class QuotesApiStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);
    
    const table = new Table(this, 'quotes-table', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const handlerFunction = new Function(this, 'quotesHandler', {
      runtime: Runtime.NODEJS_16_X,
      memorySize: 512,
      handler: 'app.handler',
      code: Code.fromAsset(join(path.dirname(__filename), '../lambdas')),
      environment: {
        MY_TABLE: table.tableName
      }
    });

    // grant permissions
    table.grantReadWriteData(handlerFunction);


    const api = new RestApi(this, 'quotes-api', {
      description: 'Quotes API',
    });

    // Integration
    const handlerIntegration = new LambdaIntegration(handlerFunction)

    const mainPath = api.root.addResource('quotes');

    mainPath.addMethod('GET', handlerIntegration); // get all
    mainPath.addMethod('POST', handlerIntegration); // post a quote

  }
}

export { QuotesApiStack }
