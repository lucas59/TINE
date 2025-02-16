import { StyleSheet, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
module.exports = StyleSheet.create({
    container: {
        height: Math.round(Dimensions.get('window').height),
        alignItems: 'center',
    }, inputContainer: {
        borderBottomColor: '#8594A6',
        backgroundColor: '#FFFF',
        borderRadius: 30,
        borderBottomWidth: 1,
        width: 250,
        height: 45,
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputBox: {
        height: 45,
        marginLeft: 16,
        borderBottomColor: '#8594A6',
        flex: 1,
    },
    button: {
        width: 300,
        backgroundColor: '#4f83cc',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffff',
        textAlign: 'center'
    },
    signupButton: {
        backgroundColor: "#034358",
    },

    inputIcon: {
        width: 30,
        height: 30,
        justifyContent: 'center'
    }, buttonContainer: {
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 250,
        borderRadius: 30,
    },
});