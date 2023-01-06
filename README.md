# Helsinki Full Stack Program Part13 - RDMS

#### Availabe commands

To start the server in production mode
`npm run start`

To start the server in developping mode
`npm run dev`

The server will run all migration files alphabetically at first when it is launched. please see these files in backend\migrations\\\*.js

The migrations can rollback from the latest to the first step by step with the cmd
`npm migration:down`

##### Avaliable commands for fly.io PostgreSQL

This project leveraged fly.io PostgreSQL service, so it is possiable to connect to the cloud database directly.
Before connecting to fly.io PostgreSQL, the SSH tunnel should be created at first by following cmd.
`flyctl proxy 5432 -a helsinki-blog-list-rick`

After the tunnel created, we are allowed to connect to the database by terminal with following cmd (the previous terminal which created the tunnel should not be closed untill you are going to disconnect to the database)
`flyctl postgres connect -a helsinki-blog-list-rick`

Show content of the database
`\d`

Show content of a table
`\d table_name`

List all the databases.
`\l`
