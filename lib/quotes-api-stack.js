import { Stack } from 'aws-cdk-lib'


class QuotesApiStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'QuotesApiQueue', {
    //   visibilityTimeout: Duration.seconds(300)
    // });
  }
}

export { QuotesApiStack }
