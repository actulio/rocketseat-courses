import React from 'react'
import { 
	View,
	Text,
	StyleSheet,
	Image,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Alert,
	Keyboard
} from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location'
import { MaterialIcons } from '@expo/vector-icons';

import api from '../services/api';
import {connect, disconnect, subscribeToNewDevs} from '../services/socket';

const Profile = ({ navigation }) => {

	const [devs, setDevs] = React.useState([]);
	const [currentRegion, setCurrentRegion] = React.useState(null);
	const [techs, setTechs] = React.useState('');
	
	React.useEffect(() => {
		async function loadInitialPosition() {
			const {granted} = await requestPermissionsAsync(); 
			if(granted){
				const { coords } = await getCurrentPositionAsync({
					enableHighAccuracy: true,
				});

				const { latitude, longitude } = coords;
				setCurrentRegion({
					latitude,
					longitude,
					latitudeDelta: 0.02,
					longitudeDelta: 0.02,
				});
			}
		}
		loadInitialPosition();
	}, []);

	React.useEffect(() => {
		subscribeToNewDevs(dev => setDevs([...devs, dev]));
	},[devs])

	function setupWebSocket() {

		disconnect();

		const { latitude, longitude } = currentRegion;

		connect(
			latitude,
			longitude,
			techs
		);
	}

	async function loadDevs() {

		if(techs.length){
			const { latitude, longitude} = currentRegion;
	
			const response = await api.get('/search', {
				params: {
					latitude,
					longitude,
					techs: techs
				}
			});
			setDevs(response.data.devs);
			setupWebSocket();
			Keyboard.dismiss();
		}else {
			Alert.alert('Preencha a tecnologia!');
		}
	}

	function handleRegionChange(region) {
		setCurrentRegion(region);
	}


	if(!currentRegion){
		return null;
	}

	return (
		<>
			<MapView 
				onRegionChangeComplete={handleRegionChange} 
				initialRegion={currentRegion} 
				style={styles.map}
			>
				{devs.map(dev => {
					return (
						<Marker
							key={dev._id}
							coordinate={{
								latitude: dev.location.coordinates[1],
								longitude: dev.location.coordinates[0]
							}}
						>
							<Image
								style={styles.avatar}
								source={{ uri: dev.avatar_url }}
							/>
							<Callout onPress={() => {
								navigation.navigate('Profile', {
									github_username: dev.github_username
								})
							}}>
								<View style={styles.callout}>
									<Text style={styles.devName}>{dev.name}</Text>
									<Text style={styles.devBio}>{dev.bio}</Text>
									<Text style={styles.devTechs}>{dev.techs.join(', ')}</Text>
								</View>
							</Callout>
						</Marker>
					)
				})}

			</MapView>
			<KeyboardAvoidingView style={styles.searchForm} behavior="padding" keyboardVerticalOffset={100}>
				<TextInput
					style={styles.searchInput}
					placeholder="Buscar tecnologias"
					placeholderTextColor="#999"
					autoCapitalize="words"
					autoCorrect={false}
					value={techs}
					onChangeText={setTechs}
				/>
				<TouchableOpacity style={styles.loadButton} onPress={loadDevs}>
					<MaterialIcons name="my-location" size={20} color="#FFF" />
				</TouchableOpacity>
			</KeyboardAvoidingView>
		</>

	)
}

const styles = StyleSheet.create({
	map: {
		flex: 1
	},
	avatar: {
		width: 54,
		height: 54,
		borderRadius: 4,
		borderWidth: 4,
		borderColor: '#FFF'
	},
	callout: {
		width: 260,
	},
	devName: {
		fontWeight: 'bold',
		fontSize: 16 
	},
	devBio: {
		color: '#666',
		marginTop: 5
	},
	devTechs: {
		marginTop: 5
	},
	searchForm: {
		position: 'absolute',
		bottom: 20,
		left: 20,
		right: 20,
		zIndex: 5,
		flexDirection: 'row',
	},
	searchInput: {
		flex: 1,
		height: 50,
		backgroundColor: '#FFF',
		color: '#333',
		borderRadius: 25,
		paddingHorizontal: 20,
		fontSize: 16,
		shadowColor: '#000',
		shadowOpacity: 0.2,
		shadowOffset: {
			width: 4,
			height: 4,
		},
		elevation: 2,
	},
	loadButton: {
		height: 50,
		width: 50,
		backgroundColor: '#8e4dff',
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 15,
	}
})

export default Profile;