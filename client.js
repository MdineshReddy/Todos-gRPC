const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

// load the Todo proto file
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

// Initiate client
const client = new todoPackage.Todo(
  "localhost:5000",
  grpc.credentials.createInsecure()
);

// Read the text for our todo from commandline
// Ex: node client.js "Do Laundry"
// Here argv[0] = node, argv[1]=client.js and argv[2]="Do Laundry"
const todoText = process.argv[2];

// create a todo
client.createTodo(
  {
    id: -1,
    text: todoText,
  },
  (err, response) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Succesfully Created a ${response.text} Todo`);
    readTodos();
    readTodosStream();
  }
);

// Read Todos
function readTodos() {
  client.readTodos({}, (err, response) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Todos List:\n " + JSON.stringify(response));
    console.log("\n");
  });
}

// readTodos as a stream
function readTodosStream() {
  const call = client.readTodosStream();

  call.on("data", (todo) => {
    console.log("Todo Stream: " + JSON.stringify(todo));
  });

  call.on("end", () => {
    console.log("Server done!");
  });
  console.log("\n");
}
