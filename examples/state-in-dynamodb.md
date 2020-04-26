
Storing state in AWS DynamoDB can be done with the following configuration. We use [`dynamo-plus`](https://github.com/Sleavely/dynamo-plus) to interact with DynamoDB but you could just as well use the built-in DocumentClient in the `aws-sdk`.

For our example, we've created a table called `exodus-migrations` where the Primary Key is `roundId` and our Sort Key is `filename`. Only the history is persisted - the `lastRan` property is computed.


**exodus.config.js**

```js
module.exports = exports = {
  // Expose the database client to our state handlers
  context: async () => {
    const dynamo = require('dynamo-plus').DynamoPlus({
      region: 'eu-west-1',
    })
    return {
      dynamo,
    }
  },

  // Iterate over the history and update the entries in our table.
  storeState: async (state, { dynamo }) => {
    await dynamo.putAll({
      TableName: 'exodus-migrations',
      Items: state.history,
    })
  },

  // Fetch history and guess-timate when the tool last ran
  fetchState: async ({ dynamo }) => {
    const history = await dynamo.scanAll({
      TableName: 'exodus-migrations',
    })
    const lastRan = (new Date(
      history.reduce((latest, migration) => {
        const migrationFinished = +(new Date(migration.finishedAt))
        if (migrationFinished > latest) latest = migrationFinished
        return latest
      }, 0)
    )).toJSON()

    return {
      history,
      lastRan,
    }
  },
}

```

Final result?

![Screenshot of DynamoDB table](https://i.imgur.com/xIZaGLR.png)
