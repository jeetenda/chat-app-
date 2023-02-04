// @refresh reset

import React, { useState, useEffect, useCallback } from 'react'
import { GiftedChat, InputToolbar, Bubble } from 'react-native-gifted-chat'
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet, TextInput, View, YellowBox, Button } from 'react-native'
import * as firebase from 'firebase'
import 'firebase/firestore'

const firebaseConfig = {
    //Your firebase config here
    apiKey: "AIzaSyAzHPO6WJN7bHm_aPXXuqQ31Dpqds4gutA",
    authDomain: "jitendra-chat-app.firebaseapp.com",
    projectId: "jitendra-chat-app",
    storageBucket: "jitendra-chat-app.appspot.com",
    messagingSenderId: "742578041466",
    appId: "1:742578041466:web:5abdf1ecde89ce389ec1c3",
    measurementId: "G-0033Q6MCHB"
}

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig)
}

YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {
    const [user, setUser] = useState(null)
    const [name, setName] = useState('')
    const [messages, setMessages] = useState([])

    useEffect(() => {
        readUser()
        const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
            const messagesFirestore = querySnapshot
                .docChanges()
                .filter(({ type }) => type === 'added')
                .map(({ doc }) => {
                    const message = doc.data()
                    //createdAt is firebase.firestore.Timestamp instance
                    //https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp
                    return { ...message, createdAt: message.createdAt.toDate() }
                })
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            appendMessages(messagesFirestore)
        })
        return () => unsubscribe()
    }, [])

    const appendMessages = useCallback(
        (messages) => {
            setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
        },
        [messages]
    )

    async function readUser() {
        const user = await AsyncStorage.getItem('user')
        if (user) {
            setUser(JSON.parse(user))
        }
    }
    async function handlePress() {
        const _id = Math.random().toString(36).substring(7)
        const user = { _id, name }
        await AsyncStorage.setItem('user', JSON.stringify(user))
        setUser(user)
    }
    async function handleSend(messages) {
        const writes = messages.map((m) => chatsRef.add(m))
        await Promise.all(writes)
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
                <Button onPress={handlePress} title="Start chat" />
            </View>
        )
    }

    const renderBubble = props => {
        return (
          <Bubble
            {...props}
    
           
            wrapperStyle={{
                
              right: { borderBottomRightRadius: 15, backgroundColor:'rgb(51, 122, 183)', color:'#337ab7' },
              left: { borderTopLeftRadius: 25 , backgroundColor:'#5bc0de'}, color:'white',
            }}
    
          
    
            containerToPreviousStyle={{
              right: { borderTopRightRadius: 15 },
              left: { borderTopLeftRadius: 15 },
            }}
            containerToNextStyle={{
              right: { borderTopRightRadius: 15 },
              left: { borderTopLeftRadius: 15 },
            }}
            containerStyle={{
               
              right: { borderTopRightRadius: 15 },
              left: { borderTopLeftRadius: 15 },
            }}
          />
        );
      };
    const customtInputToolbar = props => {
        return (
          <InputToolbar
            {...props}
            containerStyle={{
              backgroundColor: "",
              borderTop:'2px solid red',
              borderTopColor: "#5bc0de",
              borderTopWidth: 1,
              padding: 1
            }}
          />
        );
      };

    return <View style={styles.MainContainer}> 
    
    <GiftedChat 
    renderBubble={renderBubble}
    messages={messages}
    renderInputToolbar={props => customtInputToolbar(props)}
    renderUsernameOnMessage={true}
     user={user} 
     onSend={handleSend}
        messagesContainerStyle={{
            backgroundColor: '#fff'
        }}
        textInputStyle={{
            backgroundColor: '#fff',
            borderRadius: 20,
        }}
    />
    </View>
}

const styles = StyleSheet.create({
    MainContainer :  {
        flex:1,
        padding: 2,
        borderWidth: 5,
        borderColor: '#5bc0de',
        
    },

    container: {
        flex: 1,
        backgroundColor: '#337ab7',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    input: {
        backgroundColor: 'white',
        height: 50,
        width: '100%',
        borderWidth: 1,
        padding: 15,
        marginBottom: 20,
        borderColor: 'gray',
    },
})
