import React, { Component } from 'react';
import { Button, Icon } from 'react-native-elements';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class Menu_listas extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
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
                    onPress={async () => navigation.navigate('perfil', { session: await AsyncStorage.getItem('usuario') })} />
            ),
        }
    };

    render() {
        return (

            <View style={styles.container}>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Listas de tareas"
                        onPress={() => {
                            this.props.navigation.navigate('lista_tareas');
                        }}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={() => {
                            this.props.navigation.navigate('lista_asistencias');
                        }}
                        title="Lista de asistencias"
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    buttonContainer: {
        margin: 15
    }
});