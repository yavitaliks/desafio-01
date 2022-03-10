const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const {username} = request.headers;

    const user = users.find(user => user.username === username)
    
    if(!user){
      return response.status(404).json({error: "User dont exist"})
    }
    request.user = user;
    return next();
    
}

//User Create
app.post('/users', (request, response) => {
  //request data
  const {name, username} = request.body;

  // check is user exist
  const userAlreadyExists = users.some(user => user.username === username);
  if(userAlreadyExists){
    return response.status(400).json({error: "User alreade exist"})
  }
  //create user
  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);
  // response user data 
  return response.status(201).json(user); 

});

//Tools Users created
app.get('/users', (request, response) => {
  return response.status(201).json(users); 
});

//User ToDos
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.status(201).json(user.todos);
});

//Create ToDos from user
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;

  const {user} = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

    user.todos.push(todo);
    return response.status(201).json(todo);
});

//Update ToDo where id == 
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;
  const {id} = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({error: 'Mensagem do erro'})
  }
  
  todo.title = title;
  todo.deadline = new Date(deadline);
  
  return response.status(201).json(todo)
});

//Update one options (done)
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params

  const todo = user.todos.find(todo => todo.id === id)
  if(!todo){
    return response.status(404).json({error: "ToDo dont exist"})
  }

  todo.done = true;
  
  return response.status(201).json(todo)
});

// Delete ToDo
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1 ){
    return response.status(404).json({error: "ToDo dont exist"})
  }

  user.todos.splice(todoIndex, 1);
  
  return response.status(204).json();
});

module.exports = app;