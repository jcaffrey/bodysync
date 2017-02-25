##  Bodysync Backend API

#### HSA DEV
#### February 2017

This file contains some comments on set up instructions, what we've done, and the technologies we've used. 
Talk to Jeremy or Joey for further details. 
This is intended only for devs. 

We relied heavily on Sequelize for Express [docs](http://docs.sequelizejs.com/en/1.7.0/articles/express/) to set things up.


Starting up the api with some dummy data from `/bodysync/backend/`: 


```
$ # in one shell, start db
$ brew install mysql
$ brew services start mysql # start daemon 
$ mysql -uroot # connect client (depends on your machine's mysql config)
mysql> source ~/Desktop/hsadev/bodysync/backend/config/dev-db-script.sql # will create the db bodysync, has to be an abs path

$ in some other shell, start app
$ npm install
$ npm start # will sync tables w/ sequelize

mysql> # back in the connected client
mysql> source ~/Desktop/hsadev/bodysync/backend/config/dev-db-dump.sql # will create some dummy data to view on the front end

```