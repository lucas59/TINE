import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, PermissionsAndroid, Keyboard } from 'react-native';
const { server } = require('../config/keys');
import { Button, Input, Icon } from 'react-native-elements';
import { TouchableHighlight } from 'react-native';
import { Stopwatch } from 'react-native-stopwatch-timer';
import Geolocation from '@react-native-community/geolocation';
import moment from "moment";
export default class Alta_tarea extends Component {

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

    constructor(props) {
        super(props);
        this.state = {
            titulo: '',
            inicio: '',
            fin: '',
            timerStart: false,
            stopwatchStart: false,
            totalDuration: 90000,
            timerReset: false,
            stopwatchReset: false,
            long_ini: null,
            lat_ini: null,
            lat_fin: null,
            long_fin: null,
            cargando: false
        };
        this.toggleStopwatch = this.toggleStopwatch.bind(this);
        this.resetStopwatch = this.resetStopwatch.bind(this);

    }

    toggleStopwatch = async () => {
        Keyboard.dismiss();
        this.setState({ stopwatchStart: !this.state.stopwatchStart, stopwatchReset: false });
        let fecha = moment(new Date()).format();
        var longitud;
        var latitud;
        Geolocation.getCurrentPosition(
            (position) => {
                longitud = JSON.stringify(position.coords.longitude);
                latitud = JSON.stringify(position.coords.latitude);
                if (this.state.stopwatchStart) {
                    console.log("inicio" + longitud);
                    console.log("inicio" + latitud);
                    this.setState({ inicio: fecha });
                    this.setState({ long_ini: longitud });
                    this.setState({ lat_ini: latitud });
                } else {
                    console.log("fin" + longitud);
                    console.log("fin" + latitud);
                    this.setState({ fin: fecha });
                    this.setState({ long_fin: longitud });
                    this.setState({ lat_fin: latitud });
                }
            },
            (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );


    }

    resetStopwatch() {
        this.setState({ stopwatchStart: false, stopwatchReset: true });
        this.setState({ inicio: '' })
        this.setState({ fin: '' })
    }

    getFormattedTime(time) {
        this.currentTime = time;
    };

    saveData = async () => {
        this.setState({ cargando: true });
        Keyboard.dismiss();
        let myArray = await AsyncStorage.getItem('empresa');
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let empresa_id = JSON.parse(myArray);

        console.log(sesion.documento);
        console.log(myArray);
        const { titulo, inicio, fin, long_ini, lat_ini, long_fin, lat_fin } = this.state;
        let tarea_send = {
            titulo: titulo,
            inicio: inicio,
            fin: fin,
            long_ini: long_ini,
            lat_ini: lat_ini,
            long_fin: long_fin,
            lat_fin: lat_fin,
            empleado_id: sesion.id,
            empresa_id: empresa_id[0]

        }
        console.log(tarea_send);
        if (tarea_send.inicio == '' && tarea_send.fin == '') {
            this.setState({ cargando: false });
            alert("Inicie la tarea");
        }
        else if (tarea_send.inicio != '' && tarea_send.fin == '') {
            this.setState({ cargando: false });
            alert("Finalize la tarea");
        }
        else if (tarea_send.titulo == '') {
            this.setState({ cargando: false });
            alert("Ingrese le nombre de la tarea");
        }
        else {
            /*
            fetch(server.api + 'Alta_tarea', {
                method: 'POST',
                headers: {
                    'Aceptar': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tarea_send)
            })
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    const retorno = data;
                    console.log(retorno.mensaje);
                    if (retorno.retorno == true) {
                        this.setState({ cargando: false });
                        alert("La tarea se dio de alta correctamente");
                        AsyncStorage.setItem('tarea', JSON.stringify(tarea_send));
                    } else {
                        alert(retorno.mensaje);
                    }
                })
                .catch(function (err) {
                    console.log('error', err);
                })
*/

        }
    }


    render() {
        return (

            <>
                <View style={styles.container}>
                    <Input
                        onChangeText={(titulo) => this.setState({ titulo })}
                        placeholder="Titulo de la tarea"
                    />
                    <Stopwatch laps msecs start={this.state.stopwatchStart}
                        reset={this.state.stopwatchReset}
                        options={options}
                        getTime={this.getFormattedTime} />
                    <TouchableHighlight onPress={this.toggleStopwatch}>
                        <Text style={{ fontSize: 30 }}>{!this.state.stopwatchStart ? "Iniciar" : "Parar"}</Text>
                    </TouchableHighlight>

                    <TouchableOpacity style={styles.button}>
                        <Button style={styles.buttonText} onPress={this.saveData} title="Aceptar" loading={this.state.cargando} />
                    </TouchableOpacity>

                </View>
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBox: {
        width: 300,
        backgroundColor: '#eeeeee',
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#002f6c',
        marginVertical: 10
    },
    button: {
        width: 300,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center'
    },
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});



const options = {
    container: {
        backgroundColor: '#000',
        padding: 5,
        borderRadius: 5,
        width: 220,
    },
    text: {
        fontSize: 30,
        color: '#FFF',
        marginLeft: 7,
    }
};

