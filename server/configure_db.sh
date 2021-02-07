#!/bin/bash

export PGPASSWORD='postgres'

echo "Configuring db"

dropdb -U postgres authtodolist
createdb -U postgres authtodolist

psql -U postgres authtodolist < ./database.sql

echo "db configured"