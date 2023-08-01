// // import { StatusBar } from 'expo-status-bar';
// // import { StyleSheet, Text, View } from 'react-native';

// // export default function App() {
// //   return (
// //     <View style={styles.container}>
// //       <Text>Open up App.js to start working on your app!</Text>
// //       <StatusBar style="auto" />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });


// import React, { useState, useEffect} from 'react';
// import { Auth, API, graphqlOperation } from 'aws-amplify';
// import { createTodo } from '../src/graphql/mutations';
// import { listTodos } from '../src/graphql/queries';

// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Button,
//   ScrollView,
//   Dimensions,
//   ActivityIndicator
// } from 'react-native';
// const { width } = Dimensions.get('window');
// export default function Home({ updateAuthState }) {
//   const [name, setName] = useState('');
//   const [todos, setTodos] = useState([]);
//   async function signOut() {
//     try {
//       await Auth.signOut();
//       updateAuthState('loggedOut');
//     } catch (error) {
//       console.log('Error signing out: ', error);
//     }
//   }
//   const addTodo = async () => {
//     const input = { name };
//     const result = await API.graphql(graphqlOperation(createTodo, { input }));
//     const newTodo = result.data.createTodo;
//     const updatedTodo = [newTodo, ...todos];
//     setTodos(updatedTodo);
//     setName('');
//   };

//   useEffect(() => {
//     fetchTodos();
//   }, []);
//   async function fetchTodos() {
//     try {
//       const todoData = await API.graphql(graphqlOperation(listTodos));
//       const todos = todoData.data.listTodos.items;
//       console.log(todos);
//       setTodos(todos);
//     } catch (err) {
//       console.log('Error fetching data');
//     }
//   }

//   return (
//     <View style={styles.container}>
//       <Button title="Sign Out" color="tomato" onPress={signOut} />
//       <ScrollView>
//         <TextInput
//           style={styles.input}
//           value={name}
//           onChangeText={text => setName(text)}
//           placeholder="Add a Todo"
//         />
//         <TouchableOpacity onPress={addTodo} style={styles.buttonContainer}>
//           <Text style={styles.buttonText}>Add</Text>
//         </TouchableOpacity>
//         {todos.map((todo, index) => (
//           <View key={index} style={styles.itemContainer}>
//             <Text style={styles.itemName}>{todo.name}</Text>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     marginTop: 20
//   },
//   input: {
//     height: 50,
//     borderBottomWidth: 2,
//     borderBottomColor: 'tomato',
//     marginVertical: 10,
//     width: width * 0.8,
//     fontSize: 16
//   },
//   buttonContainer: {
//     backgroundColor: 'tomato',
//     marginVertical: 10,
//     padding: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//     width: width * 0.8
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 24
//   },
//   itemContainer: {
//     marginTop: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     paddingVertical: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between'
//   },
//   itemName: {
//     fontSize: 18
//   }
// });



import React, {useEffect, useState} from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import {API, graphqlOperation} from 'aws-amplify';
import {createTodo , deleteTodo} from '../src/graphql/mutations';
import {listTodos} from '../src/graphql/queries';

import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';
Amplify.configure(awsExports);

const initialState = {name: '', description: ''};

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({...formState, [key]: value});
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = {...formState};
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, {input: todo}));
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  const removeTodo = async id => {
    try {
      const input = { id };
      const result = await API.graphql(
        graphqlOperation(deleteTodo, {
          input
        })
      );
      const deletedTodoId = result.data.deleteTodo.id;
      const updatedTodo = todos.filter(todo => todo.id !== deletedTodoId);
      setTodos(updatedTodo);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <TextInput
          onChangeText={value => setInput('name', value)}
          style={styles.input}
          value={formState.name}
          placeholder="Name"
        />
        <TextInput
          onChangeText={value => setInput('description', value)}
          style={styles.input}
          value={formState.description}
          placeholder="Description"
        />
        <Pressable onPress={addTodo} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Create todo</Text>
        </Pressable>
        {todos.map((todo) => (
  <View key={todo.id} style={styles.itemContainer}>
    <Text style={styles.itemName}>{todo.name}</Text>
    <Text style={styles.todoDescription}>{todo.description}</Text>
    <TouchableOpacity onPress={() => removeTodo(todo.id)}>
      <Icon name="trash-2" size={18} color="tomato" />
    </TouchableOpacity>
  </View>
))}
      </View>
    </SafeAreaView>
  );
};

{/* <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <TouchableOpacity onPress={() => removeTodo(todo.id)}>
          <Icon name="trash-2" size={18} color="tomato" />
        </TouchableOpacity>
            <Text style={styles.todoDescription}>{todo.description}</Text>
            
          </View>
 */}



export default App;

const styles = StyleSheet.create({
  container: {width: 400, flex: 1, padding: 20, alignSelf: 'center'},
  todo: {marginBottom: 15},
  input: {backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18},
  todoName: {fontSize: 20, fontWeight: 'bold'},
  buttonContainer: {
    alignSelf: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 8,
  },
  buttonText: {color: 'white', padding: 16, fontSize: 18},
  itemContainer: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemName: {
    fontSize: 18
  }
});
