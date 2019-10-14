import React, { Component } from 'react';
import { StyleSheet, Text, View, ToastAndroid, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import { Button, Icon, Divider, Input } from 'react-native-elements';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
import NetInfo from "@react-native-community/netinfo";
import BackgroundTimer from 'react-native-background-timer';


export default class Alta_tarea extends Component {
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


    componentDidMount() {
        myTimer = BackgroundTimer.setInterval(() => {
            NetInfo.isConnected.fetch().done((isConnected) => {
                if (isConnected == true) {
                    this.setState({ connection_Status: "Online" });
                    console.log("online");
                }
                else {
                    this.setState({ connection_Status: "Offline" });
                    console.log("offline");
                }
            })

        }, 5000);

    }

    componentWillUnmount() {
        BackgroundTimer.clearInterval(myTimer);
    }

    constructor(props) {
        super(props);
        this.state = {
            isDateTimePickerVisible_inicio: false,
            isDateTimePickerVisible_fin: false,
            tarea_id: '',
            tarea_titulo: '',
            tarea_inicio: '',
            tarea_fin: ''
        }
        this.obtener_tarea();
    }

    obtener_tarea = async () => {
        var tarea = await AsyncStorage.getItem('tarea_mod');
        var tarea_2 = JSON.parse(tarea);
        var hora_inicio = moment(new Date(tarea_2[1])).format();
        var hora_fin = moment(new Date(tarea_2[2])).format();
        this.setState({ tarea_id: tarea_2[0] });
        this.setState({ tarea_titulo: tarea_2[3] });
        this.setState({ tarea_inicio: hora_inicio });
        this.setState({ tarea_fin: hora_fin });
    }

    saveData = async () => {

        const { tarea_titulo, tarea_id, tarea_inicio, tarea_fin } = this.state;
        let modificar_tarea = {
            titulo: tarea_titulo,
            inicio: tarea_inicio,
            fin: tarea_fin,
            id: tarea_id
        }
        console.log(modificar_tarea);
        if (this.state.connection_Status == "Offline") {
            db.transaction(function (txx) {
                txx.executeSql('UPDATE tarea SET estado = ? ,fin = ?, inicio = ?, titulo = ? WHERE id = ?', [1, modificar_tarea.fin, modificar_tarea.inicio, modificar_tarea.titulo, modificar_tarea.id], (tx, results) => {
                    console.log(results);
                    if (results.rowsAffected > 0) {
                        console.log("Modificó");
                    } else {
                        console.log("error");
                    }
                }
                );
            });
            this.props.navigation.navigate('lista_tareas');
        }
        else {

            console.log(modificar_tarea);
            fetch(server.api + 'Modificar_tarea', {
                method: 'POST',
                headers: {
                    'Aceptar': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modificar_tarea)
            })
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    const retorno = data;
                    console.log(retorno.mensaje);
                    if (retorno.retorno == true) {
                        ToastAndroid.show('La tarea se modificó correctamente', ToastAndroid.LONG);
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

    showDateTimePicker_inicio = () => {
        this.setState({ isDateTimePickerVisible_inicio: true });
    };

    hideDateTimePicker_inicio = () => {
        this.setState({ isDateTimePickerVisible_inicio: false });
    };

    showDateTimePicker_fin = () => {
        this.setState({ isDateTimePickerVisible_fin: true });
    };

    hideDateTimePicker_fin = () => {
        this.setState({ isDateTimePickerVisible_fin: false });
    };

    handleDatePicked_inicio = pickeddate => {
        var horafin_comp = moment(this.state.tarea_fin).format('HH:mm:ss');
        var horainicio_comp = moment(pickeddate).format('HH:mm:ss');
        var fechafin_comp = moment(this.state.tarea_fin).format('MMMM Do, YYYY');
        var fechainicio_comp = moment(pickeddate).format('MMMM Do, YYYY');
        console.log(horainicio_comp);
        if (fechafin_comp < fechainicio_comp) {
            var fin = moment(pickeddate).add(1, 'hours');
            this.setState({ tarea_fin: moment(fin).format() });
        }
        else if (fechafin_comp == fechainicio_comp && horafin_comp <= horainicio_comp) {
            var fin = moment(pickeddate).add(1, 'hours');
            this.setState({ tarea_fin: fin.format() });
        }
        this.setState({ tarea_inicio: moment(pickeddate).format() });
        this.setState({ tarea_fin: moment(this.state.tarea_fin).format() });
        this.hideDateTimePicker_inicio();
    };

    handleDatePicked_fin = pickeddate => {
        var horafin_comp = moment(pickeddate).format('HH:mm:ss');
        var horainicio_comp = moment(this.state.tarea_inicio).format('HH:mm:ss');
        var fechafin_comp = moment(pickeddate).format('MMMM Do, YYYY');
        var fechainicio_comp = moment(this.state.tarea_inicio).format('MMMM Do, YYYY');
        if (fechafin_comp < fechainicio_comp) {
            var fin = moment(pickeddate).subtract(1, 'hours');
            this.setState({ tarea_inicio: fin.format() });
        }
        else if (fechafin_comp == fechafin_comp && horafin_comp <= horainicio_comp) {
            var fin = moment(pickeddate).subtract(1, 'hours');
            this.setState({ tarea_inicio: fin.format() });
        }
        this.setState({ tarea_fin: moment(pickeddate).format() });
        this.setState({ tarea_inicio: moment(this.state.tarea_inicio).format() });
        this.hideDateTimePicker_fin();
    };

    render() {
        return (
            <View style={styles.container}>
                <Input
                    onChangeText={(tarea_titulo) => this.setState({ tarea_titulo })}
                    value={this.state.tarea_titulo}

                />
                <Divider style={{ backgroundColor: '#00748D' }} />
                <Button
                    title={"Fecha de inicio: " + moment(this.state.tarea_inicio).format('MMMM Do YYYY, HH:mm').toString()}
                    onPress={this.showDateTimePicker_inicio}
                    type="clear"
                />
                <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible_inicio}
                    onConfirm={(date) => this.handleDatePicked_inicio(date)}
                    onCancel={this.hideDateTimePicker_inicio}
                    mode={'datetime'}
                    date={moment(this.state.tarea_inicio).toDate()}
                />
                <Divider style={{ backgroundColor: '#00748D' }} />
                <Button
                    title={"Fecha de fin: " + moment(this.state.tarea_fin).format('MMMM Do YYYY, HH:mm').toString()}
                    onPress={this.showDateTimePicker_fin}
                    type="clear"
                />
                <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible_fin}
                    onConfirm={(date) => this.handleDatePicked_fin(date)}
                    onCancel={this.hideDateTimePicker_fin}
                    mode={'datetime'}
                    date={moment(this.state.tarea_fin).toDate()}
                />
                <Divider style={{ backgroundColor: '#00748D' }} />
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText} onPress={this.saveData}>Aceptar</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputBox: {
        alignItems: 'center',
        width: 300,
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        marginVertical: 10
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,
        backgroundColor: '#00748D',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center'
    }
});