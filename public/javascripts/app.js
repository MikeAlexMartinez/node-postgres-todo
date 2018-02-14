'use strict';

angular.module('nodeTodo', [])
  .controller('mainController', ($scope, $http) => {
    $scope.formData = {};
    $scope.todoData = {};

    // Get all todos
    $http.get('/api/v1/todos')
      .success((data) => {
        $scope.todoData = data;
        console.log(data);
      })
      .error((err) => {
        console.log(err);
      });

    // Create a new todo
    $scope.createTodo = function () {
      $http.post('/api/v1/todos', $scope.formData)
        .success((data) => {
          $scope.formData = {};
          $scope.todoData = data;
          console.log(data);
        })
        .error((err) => {
          console.log('Error: ' + err);
        });
    };

    $scope.deleteTodo = function (todoId) {
      $http.delete('/api/v1/todo/' + todoId)
        .success((data) => {
          $scope.todoData = data;
          console.log(data);
        })
        .error((data) => {
          console.log('Error: ' + data);
        });
    };
  });