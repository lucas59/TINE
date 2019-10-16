import React, { Component } from 'react';
import { Icon, Avatar } from 'react-native-elements';
import { Button } from 'react-native-paper';
import { View, StyleSheet, ImageBackground, TouchableHighlight } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
export default class Menu_listas extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'TINE',
            headerStyle: {
                backgroundColor: '#00748D',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerRight: (
                <Icon
                    reverse
                    name='account-circle'
                    type='material-community'
                    color='#00748D'
                    onPress={async () => navigation.navigate('perfil', { session: await AsyncStorage.getItem('usuario') })} />
            ),
        }
    };
    constructor(props) {

        super(props);
        this.state = {
            tarea: 1,
            asistencias: 1,
            imagen_empresa: '',
            nombre_empresa: ''
        }
        this.inicio();
    }
    configuraciones = async () => {
        let session = await AsyncStorage.getItem('empresa');
        let sesion = JSON.parse(session);
        let tarea_send = {
            id_empresa: sesion[0],
        };
        console.log('empresa conectada', tarea_send);
        await fetch(server.api + 'configuraciones_empresa', {
            method: 'POST',
            headers: {
                Aceptar: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tarea_send),
        })
            .then(res => {
                return res.json();
            })
            .then(async data => {
                const retorno = data;
                console.log(retorno.retorno);
                if (retorno.retorno == true) {
                    try {
                        await AsyncStorage.setItem(
                            'configuraciones',
                            JSON.stringify(retorno.mensaje[0]),
                        );
                    } catch (e) {
                        console.log('error', e);
                        // saving error
                    }
                } else {
                    alert(retorno.mensaje);
                }
                this.setState({ cargando: false });
            })
            .catch(function (err) {
                console.log('error', err);
            });
    };

    async inicio() {
        this.configuraciones();
        try {
            let session = await AsyncStorage.getItem('empresa');
            let sesion = JSON.parse(session);
            console.log("imagen", session);
            this.setState({ 'imagen_empresa': sesion[2] });
            this.setState({ 'nombre_empresa': sesion[1] });
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
        console.log(server.img + this.state.imagen_empresa);
        return (
            <>

                <ImageBackground style={styles.imgBackground}
                    resizeMode='cover'
                    source={require('../imagenes/menu.png')}
                    style={{
                        width: '100%',
                        height: '100%',
                        flex: 1
                    }}>
                    <View style={{ position: 'relative', top: 110, alignItems: 'center', alignContent: 'center' }}>
                        <Avatar
                            size="xlarge"
                            rounded
                            height={170}
                            width={170}
                            source={{
                                uri:
                                    server.img + this.state.imagen_empresa,
                            }}
                        />
                    </View>
                    <View style={styles.container}>

                        <View style={styles.buttonContainer}>
                            <TouchableHighlight onPress={() => {
                                this.props.navigation.navigate('lista_tareas');
                            }}>
                                {this.state.tarea ? <Button
                                    mode="contained"
                                    onPress={() => {
                                        this.props.navigation.navigate('lista_tareas');
                                    }}
                                    color="#00748D"
                                    width={250}
                                    height={60}
                                    style={{ borderRadius: 30,borderRadius: 30,flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                >
                                    Listas de tareas
                            </Button> : null}
                            </TouchableHighlight>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableHighlight onPress={() => {
                                this.props.navigation.navigate('lista_asistencias');
                            }}>
                                {this.state.asistencias ? <Button
                                    onPress={() => {
                                        this.props.navigation.navigate('lista_asistencias');
                                    }}
                                    mode="contained"
                                    color="#00748D"
                                    width={250}
                                    height={60}
                                    style={{ borderRadius: 30,flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                >
                                    Lista de asistencias
    </Button> : null}
                            </TouchableHighlight>
                        </View>
                    </View>
                </ImageBackground>

            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0
    },
    buttonContainer: {
        margin: 20,
        flex: 1
    },
    perfil: {
    }
});