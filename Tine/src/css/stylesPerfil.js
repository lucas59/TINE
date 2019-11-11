import { StyleSheet, Dimensions } from 'react-native';
module.exports = StyleSheet.create({
    header: {
        height: Math.round(Dimensions.get('window').height),
        width: 395
    },
    avatar: {
        width: 170,
        height: 170,
        alignSelf: 'center',
        position: 'absolute'
    },
    name: {
        fontSize: 22,
        color: "#FFFFFF",
        fontWeight: '600',
    },
    body: {
        alignSelf: 'center',
        bottom: 60,
        position: 'absolute'

    },
    body_m: {
        alignSelf: 'center',
},
    bodyContent: {
        flex: 1,
        alignItems: 'center',
        padding: 30,
       
    },
    name: {
        fontSize: 28,
        color: "#696969",
        fontWeight: "600"
    },
    info: {
        fontSize: 16
    },
    description: {
        fontSize: 16,
        color: "#696969",
        marginTop: 10,
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: 10,
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 250,
        borderRadius: 30,
    },


    

});