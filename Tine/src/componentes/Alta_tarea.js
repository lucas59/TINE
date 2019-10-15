import React, { Component } from 'react';
import { Text, View, PermissionsAndroid, BackHandler, Alert, ImageBackground } from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import { Icon } from 'react-native-elements';
import { Stopwatch } from 'react-native-stopwatch-timer';
//import Geolocation from '@react-native-community/geolocation';
import Geolocation from 'react-native-geolocation-service';
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
import styles from '../css/styleAlta_tarea';
import { Button } from 'react-native-paper';
import Toast from 'react-native-simple-toast';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
export default class Alta_tarea extends Component {
    comprobar_conexion() {
        NetInfo.isConnected.fetch().done((isConnected) => {
            if (isConnected == true) {
                this.setState({ connection_Status: "Online" });
                console.log("online");
            }
            else {
                this.setState({ connection_Status: "Offline" });
            }
        })
    }
    componentDidMount() {
        this.comprobar_conexion();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

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
            cargando: false,
            permisos: 0
        };
        this.toggleStopwatch = this.toggleStopwatch.bind(this);
        this.resetStopwatch = this.resetStopwatch.bind(this);
        this.handleBackPress = this.handleBackPress.bind(this);

    }

    handleBackPress = () => {
        Alert.alert(
            'Salir de la tarea',
            '¿Está seguro de salir de la tarea?',
            [
                { text: 'Si', onPress: () => this.props.navigation.goBack() },
                { text: 'No' }
            ]
        );
        return true;
    };

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Alta de tarea',
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




    toggleStopwatch = async () => {
        this.setState({ stopwatchStart: !this.state.stopwatchStart, stopwatchReset: false });
        let fecha = moment(new Date()).format();
        var longitud;
        var latitud;
        var granted = 0;
        if (Platform.OS == 'ios') {
            await check(PERMISSIONS.IOS.LOCATION_ALWAYS)
                .then(result => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log(
                                '1.This feature is not available (on this device / in this context)',
                            );
                            break;
                        case RESULTS.DENIED:
                            console.log(
                                '2.The permission has not been requested / is denied but requestable',
                            );
                            break;
                        case RESULTS.GRANTED:
                            this.setState({ permisos: 1 });
                            console.log('3.The permission is denied and not requestable anymore');
                            break;
                        case RESULTS.BLOCKED:
                            console.log('4.The permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch(error => {
                    // …
                });
        } else if (Platform.OS == 'android') {
            await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                .then(result => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log(
                                '1.This feature is not available (on this device / in this context)',
                            );
                            break;
                        case RESULTS.DENIED:
                            console.log(
                                '2.The permission has not been requested / is denied but requestable',
                            );
                            break;
                        case RESULTS.GRANTED:
                            console.log('granted 1: ', this.state.permisos);
                            this.setState({ permisos: 1 });
                            console.log('granted 2: ', this.state.permisos);
                            console.log('3.The permission is acepted');
                            break;
                        case RESULTS.BLOCKED:
                            console.log('4.The permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch(error => {
                    // …
                });
        }
        console.log('granted: ', this.state.permisos);
        if (this.state.permisos === 1) {
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
                        this.saveData();
                    }
                },
                (error) => alert(error.message),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        } else {
            alert("Location permission denied")
        }



    }

    resetStopwatch() {
        this.setState({ stopwatchStart: false, stopwatchReset: true });
        this.setState({ inicio: '' })
        this.setState({ fin: '' })
    }

    getFormattedTime(time) {
        this.currentTime = time;
    };

    promesa() {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(function (txn) {
                    txn.executeSql("SELECT seq FROM sqlite_sequence where name = 'tarea'", [], (tx, res) => {
                        resolve(res.rows.item(0).seq);
                    });
                });
            }, 1000);
        });
    }

    saveData = async () => {
        this.comprobar_conexion();
        this.setState({ cargando: true });
        let myArray = await AsyncStorage.getItem('empresa');
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let empresa_id = JSON.parse(myArray);
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
        console.log("estado: ", this.state.connection_Status);
        if (this.state.connection_Status == "Offline") {
            console.log(fin);
            console.log(inicio);
            console.log(titulo);
            console.log(tarea_send.empleado_id);
            console.log(tarea_send.empresa_id);
            console.log("latitud ini: " + lat_ini);
            console.log("long ini: " + long_ini);
            console.log("latitud fin: " + lat_fin);
            console.log("long fin: " + long_fin);
            var ult_tarea;
            db.transaction(function (txx) {
                txx.executeSql('INSERT INTO tarea (fin, inicio,titulo,empleado_id,empresa_id, latitud_ini, longitud_ini, latitud_fin, longitud_fin, estado) VALUES (?,?,?,?,?,?,?,?,?,?)', [fin, inicio, titulo, tarea_send.empleado_id, tarea_send.empresa_id, lat_ini, long_ini, lat_fin, long_fin, 0], (tx, results) => {
                    if (results.rowsAffected > 0) {
                        console.log("insertó");
                    } else {
                        console.log("error");
                    }
                }
                );
            });
            Toast.show('La tarea se ingreso correctamente');
            this.props.navigation.navigate('lista_tareas');
        }
        else {
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
                        Toast.show('La tarea se ingresó correctamente');
                        Toast.show('La tarea se ingreso correctamente');
                        AsyncStorage.setItem('tarea', JSON.stringify(tarea_send));
                        this.props.navigation.navigate('lista_tareas');
                    } else {
                        alert(retorno.mensaje);
                    }
                })
                .catch(function (err) {
                    console.log('error', err);
                })
        }
    }


    render() {
        return (

            <ImageBackground
                resizeMode='cover'
                source={require('../imagenes/main.png')}
                style={{
                    width: '100%',
                    height: '100%',
                    flex: 1
                }}>
                <View style={styles.container}>
                    <Stopwatch laps msecs start={this.state.stopwatchStart}
                        reset={this.state.stopwatchReset}
                        options={options}
                        msecs={false}
                        getTime={this.getFormattedTime} />
                    <TextInput
                        label="Titulo de la tarea"
                        style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 30 }}
                        onChangeText={(titulo) => this.setState({ titulo })}
                        placeholder="¿En qué estás trabajando?"
                        selectionColor="#00748D"
                        underlineColor="#00748D"
                        autoFocus={true}
                        theme={{
                            colors: {
                                primary: '#00748D',
                                underlineColor: 'transparent',
                            }

                        }}
                        value={this.state.titulo}
                    />
                    {this.state.cargando ? <Button disabled={true} style={{ width: 160, height: 50 }} color="#00748D" loading={true} mode={!this.state.stopwatchStart ? "outlined" : "contained"} onPress={this.toggleStopwatch}></Button> :
                        <Button style={{ width: 160, height: 50 }} color="#00748D" mode={!this.state.stopwatchStart ? "outlined" : "contained"} onPress={this.toggleStopwatch}>
                            <Text style={{ fontSize: 23 }}>{!this.state.stopwatchStart ? "Iniciar" : "Parar"}</Text>
                        </Button>
                    }
                </View>
            </ImageBackground>
        )
    }
}

const options = {
    container: {
        backgroundColor: '#E8E8E8',
        padding: 5,
        borderRadius: 200,
        borderWidth: 6,
        borderColor: '#00748D',
        width: 260,
        height: 260,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 50,
        color: 'black',
    },
};

