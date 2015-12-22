# repository.dynamodb
A generic repository pattern for dynamodb written for node.js

## Usage

Construct the Repository using the aws region, dynamoDb table name, name of the id key and optionally name of the range key. 

### With both id and range
```javascript

let Repository = require('repository-dynamodb');
let repository = new Repository('eu-west-1', 'tableone', 'id', 'range');
```
### With just id
```javascript

let Repository = require('repository-dynamodb');
let repository= new Repository('eu-west-1', 'tableone', 'id');
```

## API
```javascript
repository.findBy(id, range, callback);
repository.findBy(id, callback);
repository.addOrReplace(item, callback);
repository.removeBy(id, range, callback);
repository.removeBy(id, callback);
```

### Extending
If you want to provide an additional function specific to your repository, the dynamodb `docClient` is provided:

```javascript
repository.listCurrentArticles = function scanDynamoDbForCurrentArticles(callback) {
    let params = {
        TableName: 'news',
        ExpressionAttributeNames: {
            "#D": "date",
            "#E": "expiration"
        },
        ExpressionAttributeValues: {
            ":NOW": new Date().toISOString()
        },
        FilterExpression: ':NOW between #D and #E'
    };
    this.docClient.scan(params, callback);
};
```
