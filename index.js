const fs = require('fs');
const express = require('express');
const mysql = require('mysql-await');
const app = express();
const port = 3000;
app.use(express.json())

const connection = mysql.createConnection(JSON.parse(fs.readFileSync(`mysql-config.json`)));
connection.on('errror', (err) => {
    console.log(`Connection Error ${err.code}`);
})


//
// app.put('/userlogin', (req, res) => {
//     let body = (req.body)
//     let userCheckQuery = "SELECT id, name, uuid, level, experience, has_vip FROM users WHERE name LIKE " + "'" + body.name + "'"
//     console.log(userCheckQuery)
//     let query = connection.query(userCheckQuery)
//     let result;
//     query
//         .on('error', function (err) {
//             // Handle error, an 'end' event will be emitted after this as well
//         })
//         .on('result', function (row) {
//             result = row
//         })
//         .on('end', function () {
//             console.log(result)
//             let userExists = result !== undefined;
//             let currentDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))
//                 .toISOString().slice(0, 19).replace('T', ' ');
//             if (userExists) {
//                 let userInsertQuery = `UPDATE users SET last_session = '${currentDate}' WHERE name LIKE '${body.name}'`
//                 query = connection.query(userInsertQuery)
//                 res.send(JSON.stringify(result));
//                 return;
//             } else {
//                 let userInsertQuery = `INSERT INTO users (name, uuid, level, experience, joined, last_session, has_vip)
//                 VALUES ('${body.name}','${body.uuid}',${0},${0},'${currentDate}','${currentDate}',${0})`
//                 console.log(userInsertQuery)
//                 query = connection.query(userInsertQuery)
//                 query = connection.query(userCheckQuery)
//                 query
//                     .on('error', function (err) {
//                         // Handle error, an 'end' event will be emitted after this as well
//                     })
//                     .on('result', function (row) {
//                         result = row
//                     })
//                 console.log(result)
//                 res.send(JSON.stringify(result));
//                 return;
//             }
//         });
//
// })


app.put('/userlogin', (req, res) => {
    let body = req.body;
    (async () => {

        let result = await connection.awaitQuery(`
            SELECT * 
            FROM users 
            WHERE users.name = '${body.name}'
        `);

        let currentDate = new Date(
            new Date().getTime() -
            (new Date().getTimezoneOffset() * 60000)
        )
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        if (result.length !== 0) {
            await connection.awaitQuery(`
                UPDATE users 
                SET last_session = '${currentDate}' 
                WHERE name = '${body.name}'
            `);


            res.send(JSON.stringify({
                id: result[0].id,
                name: result[0].name,
                uuid: result[0].uuid,
                level: result[0].level,
                experience: result[0].experience,
                hasVIP: result[0].has_vip,
            }));
            return;
        }

        await connection.awaitQuery(`
            INSERT INTO users (
                name,
                uuid,
                level,
                experience,
                joined,
                last_session,
                has_vip
            )
            VALUES (
                '${body.name}',
                '${body.uuid}',
                ${0},
                ${0},
                '${currentDate}',
                '${currentDate}',
                ${0}
            )
        `);

        result = await connection.awaitQuery(`
            SELECT * 
            FROM users 
            WHERE users.name = '${body.name}'
        `);


        res.send(JSON.stringify({
            id: result[0].id,
            name: result[0].name,
            uuid: result[0].uuid,
            level: result[0].level,
            experience: result[0].experience,
            hasVIP: result[0].has_vip,
        }));

    })();
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



