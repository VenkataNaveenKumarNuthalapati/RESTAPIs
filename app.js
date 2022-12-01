let express = require("express");
let app = express();
app.use(express.json());

let path = require("path");
let db_path = path.join(__dirname, "todoApplication.db");

let sqlite = require("sqlite");
let { open } = sqlite;
let sqlite3 = require("sqlite3");

let db;
let initializeDbServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen("3000", () => {
      console.log("Server running at http://localhost/3000/");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

initializeDbServer();

// GET method with path `/todos/`; /todos/?status=TO%20DO

app.get("/todos/", async (request, response) => {
  const {
    offset = "",
    limit = "",
    status = "",
    search_q = "",
    priority = "",
    order = "",
    orderby = "",
  } = request.query;
  let getQuery;

  if (priority !== "" && status !== "") {
    getQuery = `select * from todo
                        where status = '${status}' and
                        priority = '${priority}';`;
  } else if (status !== "") {
    getQuery = `select * from todo
                        where status = '${status}';`;
  } else if (priority !== "") {
    getQuery = `select * from todo
                        where priority = '${priority}';`;
  } else if (search_q !== "") {
    getQuery = `select * from todo
                        where todo LIKE '%${search_q}%';`;
  }

  let details = await db.all(getQuery);
  response.send(details);
});

//  GET method by id : /todos/:todoId/

app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let Query = `SELECT * FROM todo WHERE id = ${todoId};`;
  let todoResult = await db.get(Query);
  response.send(todoResult);
});
/// POST Method //
app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status } = request.body;
  let query = `INSERT INTO todo
                   VALUES(${id},'${todo}','${priority}','${status}');`;
  let result = await db.run(query);
  response.send("Todo Successfully Added");
});

// PUT Method:

app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  const { status = "", priority = "", todo = "" } = request.body;
  let sqlQuery;
  let msg;
  if (status !== "") {
    sqlQuery = `UPDATE todo SET status = '${status}'
    WHERE id = ${todoId};`;
    msg = "Status Updated";
  } else if (priority !== "") {
    sqlQuery = `UPDATE todo SET priority = '${priority}'
    WHERE id = ${todoId};`;
    msg = "Priority Updated";
  } else if (todo !== "") {
    sqlQuery = `UPDATE todo SET todo = '${todo}'
    WHERE id = ${todoId};`;
    msg = "Todo Updated";
  }
  let result = await db.run(sqlQuery);
  response.send(msg);
});

// DELETE METHOD
app.delete("/todos/:todoId", async (request, response) => {
  let { todoId } = request.params;
  let sqlQuery = `DELETE FROM todo 
                    WHERE id = ${todoId};`;
  let result = await db.run(sqlQuery);
  response.send("Todo Deleted");
});

module.exports = app;
