const AWS = require('aws-sdk')

const dynamo = new AWS.DynamoDB.DocumentClient();

const MY_TABLE = process.env.MY_TABLE

const listQuotes = async () => {
    const params = {
        TableName: MY_TABLE
    };
    return dynamo
                .scan(params)
                .promise()
                .then((data) => {
                    return data.Items
                })
}

const saveQuote = async (data) => {
    const date = new Date();
    const time = date.getTime();

    const quote = {
        id: time.toString(),
        quote: data.quote,
        author: data.author
    }

    const params = {
        TableName: MY_TABLE,
        Item: quote
    }

    return await dynamo
                .put(params)
                .promise()
                .then(() => {
                    return quote;
                })
}

const updateQuote = async (id, data) => {
    const quote = {
        id,
        quote: data.quote,
        author: data.author
    }

    const params = {
        TableName: MY_TABLE,
        Key: {
            id
        },
        Item: quote
    }

    return await dynamo
                .put(params)
                .promise()
                .then(() => {
                    return quote;
                })
}

const sendRes = (status, body) => {
    const response = {
        statusCode: status,
        headers: {
            'Content-Type': 'application/json'
        },
        body
    }
    return response;
}

const deleteQuote = async(id) => {

    const params = {
        TableName: MY_TABLE,
        Key: {
            id
        }
    }
    return await dynamo
            .delete(params)
            .promise()
            .then(() => {
                return id;
            })
}

const anotherUpdateQuote = async (id, data) => {
    const datetime = new Date().toISOString()

    const params = {
        TableName: MY_TABLE,
        Key: {
            id
        },
        ExpressionAttributeValues: {
            ":quote": data.quote,
            ":author": data.author,
            ":updatedAt": datetime
        },
        UpdateExpression: "SET quote = :quote, author = :author, updatedAt = :updatedAt",
        ReturnValues: "UPDATED_NEW"
    }

    await dynamo
            .update(params)
            .promise()
            .then(() => {
                return 'Item Updated'
            })
}

const getQuote = async(id) => {
    const params = {
        TableName: MY_TABLE,
        Key: {
            id
        }
    }
    
    return await dynamo
                .get(params)
                .promise()
                .then((data) => {
                    return data.Item;
                })
}

exports.handler = async (event, context) => {
    console.log('Event:::', event);
    const path = event.resource;
    const httpMethod = event.httpMethod;
    const route = httpMethod.concat(' ').concat(path); // ex: GET todos/

    const data = JSON.parse(event.body);

    let body;

    let statusCode =  200;

    try {
        switch(route) {
            case 'GET /quotes':
                body = await listQuotes();
                break;
            case 'GET /quotes/{id}':
                body = await getQuote(event.pathParameters.id);
                break;
            case 'PUT /quotes/{id}':
                body = await updateQuote(event.pathParameters.id, data);
                break;
            case 'PATCH /quotes/{id}':
                body = await anotherUpdateQuote(event.pathParameters.id, data);
                break;
            case 'POST /quotes':
                body = await saveQuote(data);
                break;
            case `DELETE /quotes/{id}`:
                body = await deleteQuote(event.pathParameters.id);
                break;
            default:
                throw new Error(`unsupported route: ${route}`);
        }
    } catch (error) {
        console.log(error);
        statusCode = 400;
        body = error.message;
    } finally {
        console.log(body);
        body = JSON.stringify(body);
    }

    return sendRes(statusCode, body);
};

