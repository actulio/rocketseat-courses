import React from 'react'
import './styles.css';
import { Link, useHistory} from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import logo from '../../assets/logo.svg';
import api from '../../services/api';
import axios from 'axios';

interface Item {
	id: number,
	title: string,
	image_url: string
}

const CreatePoint = () => {

	const [items, setItems] = React.useState<Item[]>([]);
	const [ufs, setUfs] = React.useState<string[]>([]);
	const [cities, setCities] = React.useState<string[]>([]);
	const [selectedPosition, setSelectedPosition] = React.useState<[number, number]>([0 ,0]);
	const [initialPosition, setInitialPosition] = React.useState<[number, number]>([0 ,0]);
	const [selectedItems, setSelectedItems] = React.useState<number[]>([])
	const [selectedUf, setSelectedUf] = React.useState('0');
	const [selectedCity, setSelectedCity] = React.useState('');
	const [formData, setFormData] = React.useState({
		name: '',
		email: '',
		whatsapp: ''
	});

	const history = useHistory();

	React.useEffect(() => {
		api.get('items').then( response => {
			setItems(response.data);
		})
	}, []);

	React.useEffect(() => {
		axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
			.then(response => {
				const ufAbbr = response.data.map( (uf: any) => uf.sigla);
				setUfs(ufAbbr);
			})
	}, []);

	React.useEffect(() => {
		if (selectedUf !== '0'){
			axios
				.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
				.then(response => {
					const cityNames = response.data.map( (city: any) => city.nome)
					setCities(cityNames);
				})
		}
	}, [selectedUf]);

	React.useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const { latitude, longitude} = position.coords;
			setInitialPosition([latitude, longitude]);
		}, (error) => {
			setInitialPosition([-10.975060, -37.079139]);
		}, { enableHighAccuracy: true, timeout: 5000 })
	}, []);

	function handleInputChange(event: React.ChangeEvent<HTMLInputElement>){
		const {name, value} = event.target;
		setFormData({
			...formData,
			[name]: value
		});
	}

	function handleSelectUf(event: React.ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;
		setSelectedUf(uf);
	}

	function handleSelectCity(event: React.ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;
		setSelectedCity(city);
	}

	function handleMapClick(event: LeafletMouseEvent){
		setSelectedPosition([
			event.latlng.lat,
			event.latlng.lng
		])
	}

	function handleSelectItem(id: number){
		const alreadySelected = selectedItems.findIndex(item => item === id);
	
		if(alreadySelected >= 0){
			const filteredItems = selectedItems.filter(item => item !== id);
			setSelectedItems(filteredItems);
		}else {
			setSelectedItems([ ...selectedItems, id]);
		}
	}

	async function handleSubmit(event: React.FormEvent){
		event.preventDefault();

		const { name, email, whatsapp} = formData;
		const [latitude, longitude] = selectedPosition;
		const items = selectedItems;
		const uf = selectedUf;
		const city = selectedCity;

		const data = {
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			uf,
			city,
			items,
		}

		await api.post('points', data);
		alert('Ponto de coleta criado');

		history.push('/');

	}
	
	return (
		<div id="page-create-point" >
			<header>
				<img src={logo} alt="Ecoleta"/>

				<Link to="/">
					<FiArrowLeft />
					Voltar para home
				</Link>
			</header>

			<form onSubmit={handleSubmit} >
				<h1> Cadastro do <br/> ponto de coleta</h1>
				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>

					<div className="field">
						<label htmlFor="name">Nome da entidade</label>
						<input 
							type="text" 
							name="name"
							id="name"
							onChange={handleInputChange}
						/>
					</div>

					<div className="field-group">
						<div className="field">
							<label htmlFor="email">Email</label>
							<input 
								type="email" 
								name="email"
								id="email"
								onChange={handleInputChange}
							/>
						</div>

						<div className="field">
							<label htmlFor="whatsapp">Whatsapp</label>
							<input 
								type="text" 
								name="whatsapp"
								id="whatsapp"
								onChange={handleInputChange}
							/>
						</div>
					</div>

				</fieldset>
				
				<fieldset>
					<legend>
						<h2> Endereços</h2>
						<span>Selecione o endereço no mapa</span>
					</legend>

					<Map center={initialPosition} zoom={15} onClick={handleMapClick} >
						<TileLayer
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
						/>
						<Marker position={selectedPosition}/>
					</Map>

					<div className="field-group">
						<div className="field">
							<label htmlFor="uf">Estado (UF)</label>
							<select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
								<option value="0">Selecione uma UF</option>
								{ufs.map( uf => (
									<option key={uf} value={uf}>{uf}</option>
								))}
							</select>
						</div>

						<div className="field">
							<label htmlFor="city">Cidade</label>
							<select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
								<option value="0">Selecione uma Cidade</option>
								{cities.map( city => (
									<option key={city} value={city}>{city}</option>
								))}
							</select>
						</div>

					</div>

				</fieldset>

				<fieldset>
					<legend>
						<h2>Itens de coleta</h2>
						<span>Selecione um ou mais itens abaixo</span>
					</legend>

					<ul className="items-grid">
						{items.map(item => {
							return (
								<li
									key={item.id}
									className={selectedItems.includes(item.id) ? 'selected' : ''} 
									onClick={() => handleSelectItem(item.id)}>
									<img src={item.image_url} alt=""/>
									<span>{item.title}</span>
								</li>
							)
						})}
					</ul>



				</fieldset>
				<button type="submit">
					Cadastrar ponto de coleta
				</button>
			</form>

		</div>
	);
}

export default CreatePoint;