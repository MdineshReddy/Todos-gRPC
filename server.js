const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

// load the proto file
const packageDefinition = protoLoader.loadSync("todo.proto", {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load a gRPC package definition as a gRPC object
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// Get our todoPackage from our todo.proto file
const todoPackage = grpcObject.todoPackage;

// Create a gRPC server
const server = new grpc.Server();
// Set the port, our server will be listening on
server.bind("0.0.0.0:5000", grpc.ServerCredentials.createInsecure());

// Map the services with their implementations
server.addService(todoPackage.Todo.service, {
  createTodo: createTodo,
  readTodos: readTodos,
  readTodosStream: readTodosStream,
});

// start the server
server.start();

// temporarily stores our todos
const todos = [];

function createTodo(call, callback) {
  //   console.log(call);
  const todoText = call.request.text;
  const todoItem = {
    id: todos.length + 1,
    text: todoText,
  };
  todos.push(todoItem);

  //   Send reply back to client using callback(error, response)
  callback(null, todoItem);
}

function readTodos(call, callback) {
  callback(null, { items: todos });
}

function readTodosStream(call, callback) {
  todos.forEach((todo) => call.write(todo));
  call.end();
}
