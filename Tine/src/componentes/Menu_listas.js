import React, { Component } from 'react';
import { Button, Icon } from 'react-native-elements';
import { View, StyleSheet } from 'react-native';

export default class Menu_listas extends Component {
    static navigationOptions = {
        title: 'TINE',
        headerStyle: {
            backgroundColor: '#1E8AF1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
        headerRight: (
            <Icon
                reverse
                name='face'
                type='material'
                color='#1E8AF1'
                onPress={() => console.log('perfil')} />
        ),

    };

    render() {
        return (

            <>
                <View style={{flex :1, justifyContent: 'center', margin: 15 }}>
                    <Button
                        title="Listas de tareas"
                        onPress={() => {
                            this.props.navigation.navigate('lista_tareas');
                        }}
                    />

                    <Button
                        style={{marginTop: 15, position: 'relative'}}
                        onPress={() => {
                            this.props.navigation.navigate('lista_asistencias');
                        }}
                        title="Lista de asistencias"
                    />
                </View>
            </>
        )
    }
}
