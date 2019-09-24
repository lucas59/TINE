import React, { Component } from 'react';
import { Icon } from 'react-native-elements';
import { Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class Menu_listas extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'TINE',
            headerStyle: {
                backgroundColor: '#008FAD',
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
                    color='#008FAD'
                    onPress={async () => navigation.navigate('perfil', { session: await AsyncStorage.getItem('usuario') })} />
            ),
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            tarea: 1,
            asistencias: 1
        }
    }

    async componentDidMount() {
        try {
            const value = await AsyncStorage.getItem('configuraciones');
            if (value !== null) {
                this.setState({ 'tarea': JSON.parse(value).tareas.data[0] });
                this.setState({ 'asistencias': JSON.parse(value).asistencias.data[0] });
            }
        } catch (e) {
            console.log("error", e);
        }
    }





    render() {
        return (
            <View style={styles.container}>
                <View style={styles.buttonContainer}>
                    {this.state.tarea ? <Button
                        mode="contained"
                        onPress={() => {
                            this.props.navigation.navigate('lista_tareas');
                        }}
                        color="#008FAD"
                    >
                        Listas de tareas
                        </Button> : null}
                </View>
                <View style={styles.buttonContainer}>
                    {this.state.asistencias ? <Button
                        onPress={() => {
                            this.props.navigation.navigate('lista_asistencias');
                        }}
                        mode="contained"
                        color="#008FAD"
                    >
                        Lista de asistencias
                        </Button> : null}

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